const { shared } = require('./agent_performance_controller')
const { scoring } = require('./leaderboard_controller')
const { readDepartment, badDepartment } = require('./department_scope')
const { readRange, readStatusFilter } = require('./month_range')

// CUSTOM RANGE: the Agent Yearly page with a range of months that the user chooses (start_date and end_date, YYYY-MM).
// Every month of the range is scored by the same engine as the monthly and yearly pages (buildMonth), then the months are averaged per
// employee exactly like the yearly average: only the SUBMITTED months count, the ones that are not submitted are left out (nothing is blocked).
//
//   GET /evaluation/custom_range?start_date=2025-11&end_date=2026-04&employee_status=all|hired|resigned&department=csd
//   GET /evaluation/custom_range/:employee_id?start_date=...&end_date=...        one employee: his/her submitted months and the average
//
// Admin, poweruser and the GOM only (middleware canUseCustomRange). A month is not listed for an employee that was not in the evaluation of
// that month. An employee without a submitted month in the range is not in the list: there is nothing to average.
const { buildMonth, yearAverage, currentYearMonth } = shared
const { loadScoreTables } = scoring

// the scored rows of every month of the range, grouped by employee
const buildRange = async (user, months, department) => {
    const tables = await loadScoreTables()
    const byEmployee = new Map()

    for (const yearMonth of months) {
        const rows = await buildMonth(user, yearMonth, tables, department)
        for (const row of rows) {
            if (!byEmployee.has(row.id)) byEmployee.set(row.id, [])
            byEmployee.get(row.id).push(row)
        }
    }
    return { tables, byEmployee }
}

// the average of the submitted months of one employee, with what the page shows about the range
const rangeAverage = (records, tables, months) => {
    const submitted = records.filter(record => record.submitted === 1)
    const result = yearAverage(submitted, records, tables, undefined)

    delete result.year
    return {
        ...result,
        start_date: months[0],
        end_date: months[months.length - 1],
        months_in_range: months.length,
        // months_submitted (the months that are in the average) comes from the yearly average
        submitted_months: submitted.map(record => record.year_month),
    }
}

const byRatingDesc = (a, b) => parseFloat(b.final_ratings) - parseFloat(a.final_ratings)

exports.getCustomRangeList = async (user, months, department, statuses = null) => {
    const { tables, byEmployee } = await buildRange(user, months, department)

    const list = []
    for (const records of byEmployee.values()) {
        if (!records.some(record => record.submitted === 1)) continue         // nothing to average
        const average = rangeAverage(records, tables, months)
        // the status is the one of the latest submitted month (like the yearly average)
        if (statuses && !statuses.includes(average.employee_status)) continue
        list.push(average)
    }
    return list.sort(byRatingDesc)
}

exports.getCustomRangeOne = async (user, months, department, employeeId) => {
    const { tables, byEmployee } = await buildRange(user, months, department)
    const records = byEmployee.get(Number(employeeId))
    if (!records) return null

    const submitted = records.filter(record => record.submitted === 1)
    if (submitted.length === 0) return null

    const present = new Set(submitted.map(record => record.year_month))
    return {
        agentMetricsInRange: submitted,
        rangeAverage: rangeAverage(records, tables, months),
        months_left_out: months.filter(yearMonth => !present.has(yearMonth)),
    }
}

// the range, the department and the status of a request: { months, department, statuses } or the answer is sent and null is returned
exports.readRequest = (req, res) => {
    const department = readDepartment(req)
    if (!department) { badDepartment(res); return null }

    const range = readRange(req.query.start_date, req.query.end_date, currentYearMonth())
    if (range.error) { res.status(400).json({ message: range.error }); return null }

    const status = readStatusFilter(req.query.employee_status)
    if (status.error) { res.status(400).json({ message: status.error }); return null }

    return { months: range.months, department, statuses: status.statuses }
}

exports.fetchCustomRange = async (req, res) => {
    const request = exports.readRequest(req, res)
    if (!request) return

    try {
        const employeeId = req.params.employee_id
        if (!employeeId) {
            return res.status(200).json(await exports.getCustomRangeList(req.user, request.months, request.department, request.statuses))
        }

        const one = await exports.getCustomRangeOne(req.user, request.months, request.department, employeeId)
        // not in the range, or not somebody the user may see: nothing is told about the difference
        return res.status(200).json(one)
    } catch (error) {
        console.error('Error fetching the custom range', error)
        return res.status(500).json({ error: 'Database Error, Cannot Fetch the custom range' })
    }
}
