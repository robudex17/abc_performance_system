const pool = require('../../config/db')
const { isQaStaff } = require('../../middleware/qa_access')
const { FROM_SNAPSHOT, snapshotParams } = require('./month_snapshot')

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
// The result has 5 decimals and is computed every time the evaluation is read, it is never stored.
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
// the averages have 5 decimals (rounded up when necessary)
const round5 = (value) => Number(Number(value).toFixed(5))

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

// for the tests: the rules of the departments and which levels are computed in a month
exports._internals = { RULES, computedLevelsOf }

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
        const average = counted.length ? round5(counted.reduce((sum, source) => sum + source.performance, 0) / counted.length) : 0

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

// ---------------------------------------------------------------- the submit order of the CSD & Collection Manager
// Only the computed Performance of CSD and Collection (the CSD & Collection Manager: Mark) has a submit order. His Performance is made of the
// evaluation of everybody under him, of BOTH departments (all the employees below him in the immediate heads: Donie, cindz, aben and their
// teams), so:
//   - SUBMIT: he can be submitted only when EVERYBODY under him is submitted (or is submitted in the same request: the Submit All of the department)
//   - REVIEW: nobody under him can be reviewed (unlocked) while he is submitted, the manager has to be reviewed first (with the average of the
//     subordinates, a changed value of anybody below would change the Performance of the manager)
// The other departments (Purchasing, HR & Admin) are not affected.
const SUBMIT_ORDER_DEPARTMENTS = ['csd', 'collection']

const hasSubmitOrder = (employee, hierarchy, yearMonth) =>
    SUBMIT_ORDER_DEPARTMENTS.includes(String(employee.department_code || '').toLowerCase()) &&
    isComputedEmployee(employee, hierarchy.childrenOf, yearMonth)

// everybody under the employee (children, their children ...), without repeating anybody
const descendantsOf = (id, childrenOf) => {
    const found = new Map()
    const walk = (headId) => {
        for (const child of childrenOf.get(headId) ?? []) {
            const childId = Number(child.id)
            if (childId === id || found.has(childId)) continue
            found.set(childId, child)
            walk(childId)
        }
    }
    walk(id)
    return [...found.values()]
}

const loadSubmittedIds = async (yearMonth) => {
    const [rows] = await pool.execute('SELECT employee_id FROM evaluation_status WHERE `year_month` = ? AND submitted = 1', [yearMonth])
    return new Set(rows.map(row => Number(row.employee_id)))
}

// Sets submit_waiting_for (everybody under him that is not submitted yet, [] for the others) and review_locked_by (the name of the submitted manager
// that this employee is under, or null) on the rows of the evaluation.
exports.applySubmitDependencies = async (rows, yearMonth) => {
    const hierarchy = await loadHierarchy(yearMonth)
    const submitted = await loadSubmittedIds(yearMonth)

    const lockedBy = new Map()
    for (const employee of hierarchy.byId.values()) {
        if (!hasSubmitOrder(employee, hierarchy, yearMonth) || !submitted.has(Number(employee.id))) continue
        for (const below of descendantsOf(Number(employee.id), hierarchy.childrenOf)) lockedBy.set(Number(below.id), employee.db_name)
    }

    for (const row of rows) {
        const employee = hierarchy.byId.get(Number(row.id))
        const below = employee && hasSubmitOrder(employee, hierarchy, yearMonth) ? descendantsOf(Number(employee.id), hierarchy.childrenOf) : []
        row.submit_waiting_for = below
            .filter(person => !submitted.has(Number(person.id)))
            .map(person => ({ id: person.id, db_name: person.db_name, department_code: person.department_code }))
        row.review_locked_by = lockedBy.get(Number(row.id)) ?? null
    }
}

// the employees of targetIds that can not be submitted: the ones under them that are not submitted and not submitted now (targetIds)
exports.getSubmitBlockers = async (targetIds, yearMonth) => {
    const ids = new Set(targetIds.map(Number))
    const hierarchy = await loadHierarchy(yearMonth)
    const submitted = await loadSubmittedIds(yearMonth)
    const blockers = []

    for (const id of ids) {
        const employee = hierarchy.byId.get(id)
        if (!employee || !hasSubmitOrder(employee, hierarchy, yearMonth)) continue
        const waiting = descendantsOf(id, hierarchy.childrenOf).filter(person => !submitted.has(Number(person.id)) && !ids.has(Number(person.id)))
        if (waiting.length > 0) blockers.push({ employee: employee.db_name, waiting: waiting.map(person => `${person.db_name} (${person.department_code})`) })
    }
    return blockers
}

// the employees of reviewIds that can not be reviewed: a manager above them (any level) is submitted and is not reviewed now
exports.getReviewBlockers = async (reviewIds, yearMonth) => {
    const ids = new Set(reviewIds.map(Number))
    const hierarchy = await loadHierarchy(yearMonth)
    const submitted = await loadSubmittedIds(yearMonth)
    const blockers = []

    for (const id of ids) {
        const employee = hierarchy.byId.get(id)
        if (!employee) continue

        // the heads above, from the immediate head up (the top manager is his/her own head)
        const seen = new Set([id])
        let head = employee.manager_id != null ? hierarchy.byId.get(Number(employee.manager_id)) : null
        while (head && !seen.has(Number(head.id))) {
            seen.add(Number(head.id))
            if (hasSubmitOrder(head, hierarchy, yearMonth) && submitted.has(Number(head.id)) && !ids.has(Number(head.id))) {
                blockers.push({ employee: employee.db_name, head: head.db_name })
                break
            }
            head = head.manager_id != null ? hierarchy.byId.get(Number(head.manager_id)) : null
        }
    }
    return blockers
}
