const pool = require('../../config/db')

// Absences, tardiness and memo of the none-sales employees.
// One record per employee, per type and per month: { count, description } of a year_month (YYYY-MM).
// NOTE: `year_month` and `count` are wrapped in backticks because they are reserved words / functions in MariaDB.
// The table names come from this map only (never from the request).
const ATTENDANCE_TABLES = {
    absences: { table: 'absences2', label: 'Absences' },
    tardiness: { table: 'tardiness2', label: 'Tardiness' },
    memo: { table: 'memo2', label: 'Memo' },
}

const YEAR_MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

// employment status of the latest employment of the employee (undefined = employee not found)
const getEmployeeStatus = async (employeeId) => {
    const [rows] = await pool.execute(
        `SELECT status FROM employee_employments WHERE employee_id = ? ORDER BY id DESC LIMIT 1`,
        [employeeId]
    )
    return rows.length > 0 ? rows[0].status : undefined
}

// Validates the common request values. Returns { error: { status, message } } or the parsed values.
const readRequest = (req, { needsYearMonth }) => {
    const attendance = ATTENDANCE_TABLES[req.params.type]
    if (!attendance) {
        return { error: { status: 400, message: `Invalid attendance type: ${req.params.type}` } }
    }

    const employeeId = Number(req.params.employee_id)
    if (!Number.isInteger(employeeId) || employeeId < 1) {
        return { error: { status: 400, message: 'employee_id must be a positive integer' } }
    }

    // GET and DELETE have no body: the month is in the query string
    const yearMonth = req.method === 'POST' || req.method === 'PUT' ? req.body?.year_month : req.query.year_month
    if (needsYearMonth) {
        if (!YEAR_MONTH_FORMAT.test(yearMonth)) {
            return { error: { status: 400, message: 'year_month must be in YYYY-MM format' } }
        }
        if (yearMonth > currentYearMonth()) {
            return { error: { status: 400, message: `Cannot set ${attendance.label} for a future month` } }
        }
    }

    return { attendance, employeeId, yearMonth }
}

// Blocks the changes on a resigned (or unknown) employee, same rule as the sales details page
const checkEmployeeCanBeChanged = async (employeeId, attendance, action) => {
    const status = await getEmployeeStatus(employeeId)

    if (status === undefined) {
        return { status: 404, message: `Employee ${employeeId} not found` }
    }
    if (status === 'Resigned') {
        return { status: 400, message: `${action} ${attendance.label} of a Resigned employee is prohibited` }
    }
    return null
}


// GET /none_sales_attendance/:type/:employee_id?year_month=YYYY-MM
// Only the selected month is returned; the current month when year_month is not given.
exports.fetchNoneSalesAttendance = async (req, res, next) => {
    const request = readRequest(req, { needsYearMonth: false })
    if (request.error) {
        return res.status(request.error.status).json({ error: request.error.message })
    }

    const { attendance, employeeId } = request
    const yearMonth = req.query.year_month || currentYearMonth()

    if (!YEAR_MONTH_FORMAT.test(yearMonth)) {
        return res.status(400).json({ error: 'year_month must be in YYYY-MM format' })
    }

    try {
        const [result] = await pool.execute(
            `SELECT id, employee_id, \`count\`, \`year_month\`, description, created_at, updated_at
               FROM ${attendance.table}
              WHERE employee_id = ? AND \`year_month\` = ?`,
            [employeeId, yearMonth]
        )
        res.json(result)

    } catch (error) {
        console.error(`Error fetching ${attendance.label}`, error)
        res.status(500).json({ error: `Database Error, Error fetching ${attendance.label}` })
    }
}


// POST /none_sales_attendance/:type/:employee_id   body: { year_month, count, description }
exports.addNoneSalesAttendance = async (req, res, next) => {
    const request = readRequest(req, { needsYearMonth: true })
    if (request.error) {
        return res.status(request.error.status).json({ error: request.error.message })
    }

    const { attendance, employeeId, yearMonth } = request
    const { count } = req.body
    const description = String(req.body.description ?? '').trim()

    if (!Number.isInteger(Number(count)) || Number(count) < 0 || Number(count) > 999 || count === '') {
        return res.status(400).json({ error: 'count must be a whole number from 0 to 999' })
    }
    if (!description) {
        return res.status(400).json({ error: 'description is required' })
    }

    try {
        const blocked = await checkEmployeeCanBeChanged(employeeId, attendance, 'Adding')
        if (blocked) {
            return res.status(blocked.status).json({ error: blocked.message })
        }

        // one record per employee per month
        const [existing] = await pool.execute(
            `SELECT id FROM ${attendance.table} WHERE employee_id = ? AND \`year_month\` = ?`,
            [employeeId, yearMonth]
        )
        if (existing.length > 0) {
            return res.status(400).json({ error: `${attendance.label} for ${yearMonth} already exists, please edit it instead` })
        }

        await pool.execute(
            `INSERT INTO ${attendance.table} (employee_id, \`count\`, \`year_month\`, description) VALUES (?,?,?,?)`,
            [employeeId, Number(count), yearMonth, description]
        )

        res.status(201).json({ message: `${attendance.label} for ${yearMonth} is recorded` })

    } catch (error) {
        console.error(`Error adding ${attendance.label}`, error)
        res.status(500).json({ error: `Database Error, Error adding ${attendance.label}` })
    }
}


// PUT /none_sales_attendance/:type/:employee_id   body: { year_month, count, description }
exports.updateNoneSalesAttendance = async (req, res, next) => {
    const request = readRequest(req, { needsYearMonth: true })
    if (request.error) {
        return res.status(request.error.status).json({ error: request.error.message })
    }

    const { attendance, employeeId, yearMonth } = request
    const { count } = req.body
    const description = String(req.body.description ?? '').trim()

    if (!Number.isInteger(Number(count)) || Number(count) < 0 || Number(count) > 999 || count === '') {
        return res.status(400).json({ error: 'count must be a whole number from 0 to 999' })
    }
    if (!description) {
        return res.status(400).json({ error: 'description is required' })
    }

    try {
        const blocked = await checkEmployeeCanBeChanged(employeeId, attendance, 'Updating')
        if (blocked) {
            return res.status(blocked.status).json({ error: blocked.message })
        }

        const [result] = await pool.execute(
            `UPDATE ${attendance.table} SET \`count\` = ?, description = ? WHERE employee_id = ? AND \`year_month\` = ?`,
            [Number(count), description, employeeId, yearMonth]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `No ${attendance.label} record for ${yearMonth}` })
        }

        res.json({ message: `${attendance.label} for ${yearMonth} is updated` })

    } catch (error) {
        console.error(`Error updating ${attendance.label}`, error)
        res.status(500).json({ error: `Database Error, Error updating ${attendance.label}` })
    }
}


// DELETE /none_sales_attendance/:type/:employee_id?year_month=YYYY-MM
exports.deleteNoneSalesAttendance = async (req, res, next) => {
    const request = readRequest(req, { needsYearMonth: true })
    if (request.error) {
        return res.status(request.error.status).json({ error: request.error.message })
    }

    const { attendance, employeeId, yearMonth } = request

    try {
        const blocked = await checkEmployeeCanBeChanged(employeeId, attendance, 'Deleting')
        if (blocked) {
            return res.status(blocked.status).json({ error: blocked.message })
        }

        const [result] = await pool.execute(
            `DELETE FROM ${attendance.table} WHERE employee_id = ? AND \`year_month\` = ?`,
            [employeeId, yearMonth]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `No ${attendance.label} record for ${yearMonth}` })
        }

        res.json({ message: `${attendance.label} for ${yearMonth} is deleted` })

    } catch (error) {
        console.error(`Error deleting ${attendance.label}`, error)
        res.status(500).json({ error: `Database Error, Error deleting ${attendance.label}` })
    }
}
