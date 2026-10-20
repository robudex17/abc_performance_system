const pool = require('../../config/db')
const { isQaStaff } = require('../../middleware/qa_access')
const { FROM_SNAPSHOT, snapshotParams } = require('./csd_month_snapshot')

// Who types the Performance and who gets it computed (CSD Evaluation):
//
//   CSD and Collection (the departments of the CSD & Collection Manager):
//     typed by the admin   everybody except the CSD & Collection Manager: the agents, the assistant team leaders, the team leaders, the
//                          assistant managers and the Quality Analyst (the staff asked to type them: the average of the subordinates
//                          does not have the extra points that they give)
//     computed             position level 10 (the CSD & Collection Manager) = the average of the Performance of his direct subordinates
//                          (the assistant managers of CSD and Collection and the Quality Analyst)
//   Purchasing, HR & Admin and any other department:
//     typed by the admin   position level 1, 2, 3, the Quality Analyst (no subordinates) and anybody who has no subordinates
//     computed             position level 7, 8, 9 and 10 = the average of the Performance of their SUBORDINATES
//
// The subordinates of an employee are the employees whose immediate head (manager_id) he/she is in the month, of ANY department:
// the CSD & Collection Manager has the CSD and the Collection assistant managers, the Collection assistant manager has the
// Collection team leaders and executives ... The computed Performance of a subordinate counts as his/her Performance
// (Mark <- Donie <- team leaders <- agents).
//   - a subordinate with a Performance of 0 is NOT counted in the average (the same idea as the feedback), when none of the
//     subordinates has a Performance the result is 0 and the employee can not be submitted
//   - the sources (the subordinates and their Performance) are returned with the row (performance_sources)
// The result is computed every time the evaluation is read, it is never stored.
const COMPUTED_LEVELS = [7, 8, 9, 10]
// THE RULE of each department and month: which position levels are computed (the others are typed). A rule applies from its month (from,
// YYYY-MM) until the next rule of the department: the months before keep the rule they were typed / computed with, so a change of the rule
// never changes the old months (the typed values stay in none_sales_performance and are used for the months before the change).
// To change the rule of a department from a month on, add a rule with that month, e.g. { from: '2026-11', computedLevels: [7, 8, 9, 10] }.
const RULES = {
    csd:        [{ from: '0000-00', computedLevels: [10] }],
    collection: [{ from: '0000-00', computedLevels: [10] }],
    default:    [{ from: '0000-00', computedLevels: COMPUTED_LEVELS }],
}

const computedLevelsOf = (employee, yearMonth) => {
    const rules = RULES[String(employee.department_code || '').toLowerCase()] ?? RULES.default
    const rule = [...rules].reverse().find(item => item.from <= yearMonth) ?? rules[0]
    return rule.computedLevels
}

const round2 = (value) => Number(Number(value).toFixed(2))

// every employee of the month with the immediate head, the position and the typed Performance
const loadHierarchy = async (yearMonth) => {
    const [employees] = await pool.execute(
        `SELECT e.id, e.db_name, d.code AS department_code, p.level AS position_level, p.position_name,
                ea.manager_id, COALESCE(nsp.performance, 0) AS performance
         ${FROM_SNAPSHOT}
         LEFT JOIN none_sales_performance nsp ON nsp.employee_id = e.id AND nsp.\`year_month\` = ?`,
        [...snapshotParams(yearMonth), yearMonth]
    )

    const byId = new Map()
    const childrenOf = new Map()
    for (const employee of employees) {
        byId.set(Number(employee.id), employee)
        // the top manager is his/her own manager
        if (employee.manager_id != null && Number(employee.manager_id) !== Number(employee.id)) {
            const head = Number(employee.manager_id)
            if (!childrenOf.has(head)) childrenOf.set(head, [])
            childrenOf.get(head).push(employee)
        }
    }
    return { byId, childrenOf, yearMonth }
}

const isComputedEmployee = (employee, childrenOf, yearMonth) =>
    computedLevelsOf(employee, yearMonth).includes(Number(employee.position_level)) &&
    !isQaStaff(employee) &&
    (childrenOf.get(Number(employee.id)) ?? []).length > 0

// the Performance of an employee: typed, or the average of the subordinates (computed from the bottom up)
const buildResolver = ({ byId, childrenOf, yearMonth }) => {
    const cache = new Map()

    const resolve = (id, path = new Set()) => {
        if (cache.has(id)) return cache.get(id)
        const employee = byId.get(id)
        if (!employee) return { performance: 0, computed: false, sources: [] }

        // a loop in the immediate heads: use the typed value instead of repeating forever
        if (path.has(id) || !isComputedEmployee(employee, childrenOf, yearMonth)) {
            const typed = { performance: round2(employee.performance), computed: false, sources: [] }
            if (!path.has(id)) cache.set(id, typed)
            return typed
        }

        path.add(id)
        const sources = (childrenOf.get(id) ?? [])
            .map(child => {
                const result = resolve(Number(child.id), path)
                return {
                    id: child.id,
                    db_name: child.db_name,
                    department_code: child.department_code,
                    position_name: child.position_name,
                    performance: result.performance,
                    counted: result.performance > 0,
                }
            })
            .sort((a, b) => String(a.department_code).localeCompare(String(b.department_code)) || String(a.db_name).localeCompare(String(b.db_name)))
        path.delete(id)

        const counted = sources.filter(source => source.counted)
        const average = counted.length ? round2(counted.reduce((sum, source) => sum + source.performance, 0) / counted.length) : 0

        const result = { performance: average, computed: true, sources }
        cache.set(id, result)
        return result
    }

    return resolve
}

// Sets performance / performance_computed / performance_sources on the rows of the evaluation that are computed.
exports.applyComputedPerformance = async (rows, yearMonth) => {
    if (!rows.some(row => COMPUTED_LEVELS.includes(Number(row.position_level)))) return

    const hierarchy = await loadHierarchy(yearMonth)
    const resolve = buildResolver(hierarchy)

    for (const row of rows) {
        const employee = hierarchy.byId.get(Number(row.id))
        if (!employee || !isComputedEmployee(employee, hierarchy.childrenOf, yearMonth)) continue

        const result = resolve(Number(row.id))
        row.performance = result.performance
        row.performance_computed = true
        row.performance_sources = result.sources
    }
}

// Is the Performance of the employee computed in the month (nobody can type it)?
exports.isPerformanceComputed = async (employeeId, yearMonth) => {
    const hierarchy = await loadHierarchy(yearMonth)
    const employee = hierarchy.byId.get(Number(employeeId))
    return Boolean(employee) && isComputedEmployee(employee, hierarchy.childrenOf, yearMonth)
}
