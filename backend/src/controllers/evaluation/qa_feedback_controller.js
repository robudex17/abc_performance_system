const pool = require('../../config/db')
const csdEvaluationController = require('./evaluation_controller')
const { FROM_SNAPSHOT, snapshotParams } = require('./month_snapshot')

// QA feedback of the CSD staff (feedback_by_nonesales_qa table, built like feedback_by_admin).
// The Quality Analyst gives ONE score (greater than 0, 5 at most) per employee and month, like the feedback by admin.
// The table is unique per employee_id + year_month: the QA staff edits the same record, and the last one who saved it
// is the one that is stored as qa_id / qa_dbname.
// The access (only the Quality Analyst) is checked by middleware/qa_access.js in the routes.
//
//   feedback_by_nonesales_qa( employee_id, db_name, qa_id, qa_dbname, qa_role, year_month, feedback )
//
// (feedback_by_qa is the QA table of the sales department: it is not used here.)

const YEAR_MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/
// The Quality Analyst belongs to CSD but is also the QA of Collection. The QA feedback is for:
//   - the CSD staff of position level 8 and below
//   - the Collection staff of position level 3, 2 and 1 (the Collection assistant manager and team leader are not rated by the QA)
const MAX_POSITION_LEVEL = 8        // CSD
const COLLECTION_MAX_POSITION_LEVEL = 3
const maxLevelOf = (departmentCode) => (departmentCode === 'collection' ? COLLECTION_MAX_POSITION_LEVEL : MAX_POSITION_LEVEL)

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

// returns the year_month, or { error }
const readYearMonth = (value) => {
    const yearMonth = value || currentYearMonth()
    return YEAR_MONTH_FORMAT.test(yearMonth) ? { yearMonth } : { error: 'year_month must be in YYYY-MM format' }
}

// 4, 4.5, .5 ... greater than 0 and 5 at most
const readScore = (value) => {
    const text = String(value ?? '').trim()
    if (!/^(\d+(\.\d+)?|\.\d+)$/.test(text)) return null
    const score = Number(text)
    return score > 0 && score <= 5 ? score : null
}

// the CSD or Collection employee with his/her latest position and employment status
const getCsdEmployee = async (employeeId) => {
    const [rows] = await pool.execute(
        `SELECT e.id, e.db_name, p.level AS position_level, d.code AS department_code,
                (SELECT status FROM employee_employments WHERE employee_id = e.id ORDER BY id DESC LIMIT 1) AS employment_status
           FROM employees e
           JOIN employee_assignments ea ON ea.employee_id = e.id
                AND ea.id = (SELECT MAX(id) FROM employee_assignments WHERE employee_id = e.id)
           JOIN positions p ON p.id = ea.position_id
           JOIN departments d ON d.id = ea.department_id
          WHERE e.id = ? AND d.code IN ('csd', 'collection')`,
        [employeeId]
    )
    return rows[0]
}

// who gives the feedback: the logged in Quality Analyst
const getQaIdentity = async (req) => {
    const qaId = Number(req.user.login_id)
    let qaDbname = req.user.db_name

    if (!qaDbname) {
        const [employee] = await pool.execute('SELECT db_name FROM employees WHERE id = ?', [qaId])
        qaDbname = employee.length > 0 ? employee[0].db_name : (req.user.username || String(qaId))
    }

    return { qa_id: qaId, qa_dbname: qaDbname, qa_role: req.user.role ?? null }
}

// checks the common request values of the add / update / delete. Returns { error: { status, message } } or the values.
const readChangeRequest = async (req, { needsScore }) => {
    const employeeId = Number(req.params.employee_id)
    if (!Number.isInteger(employeeId) || employeeId < 1) {
        return { error: { status: 400, message: 'employee_id must be a positive integer' } }
    }

    const when = readYearMonth(req.query.year_month)
    if (when.error) return { error: { status: 400, message: when.error } }
    if (when.yearMonth > currentYearMonth()) {
        return { error: { status: 400, message: 'Adding, Updating, or Deleting the QA feedback for a future month is prohibited' } }
    }

    let score
    if (needsScore) {
        score = readScore(req.body?.feedback_score)
        if (score === null) {
            return { error: { status: 400, message: 'The QA feedback must be a number greater than 0 and not greater than 5' } }
        }
    }

    const employee = await getCsdEmployee(employeeId)
    if (!employee) return { error: { status: 404, message: `CSD or Collection employee ${employeeId} not found` } }
    const maxLevel = maxLevelOf(employee.department_code)
    if (Number(employee.position_level) > maxLevel) {
        return { error: { status: 400, message: `The QA feedback for the ${employee.department_code.toUpperCase()} staff is only for the position level ${maxLevel} and below` } }
    }
    if (employee.employment_status === 'Resigned') {
        return { error: { status: 400, message: 'Adding, Updating, or Deleting the QA feedback of a resigned employee is prohibited' } }
    }

    return { employee, score, yearMonth: when.yearMonth }
}


// GET /csd_qa_feedback?year_month=YYYY-MM
// The CSD staff of position level 8 and below for the month (same list as the CSD evaluation) with the QA feedback.
exports.fetchQaFeedbackStaff = async (req, res, next) => {
    const when = readYearMonth(req.query.year_month)
    if (when.error) return res.status(400).json({ error: when.error })

    try {
        const evaluation = await csdEvaluationController.generateCsdEvaluation(when.yearMonth, 'all', 'csd', 'all', 'all', null, req.user)
        const csdStaff = evaluation
            .filter(employee => Number(employee.position_level) <= MAX_POSITION_LEVEL)
            .map(employee => ({ ...employee, department_code: 'csd' }))

        // the Collection staff of level 3, 2, 1 (they are not in the CSD evaluation)
        const [collectionStaff] = await pool.execute(
            `SELECT e.id, e.db_name, e.image_link, ee.status AS employee_status, p.position_name, p.level AS position_level,
                    d.code AS department_code, mgr.db_name AS manager_dbname, t.name AS team_name,
                    COALESCE(cs.submitted, 0) AS eval_submitted
             ${FROM_SNAPSHOT}
             LEFT JOIN employees mgr ON ea.manager_id = mgr.id
             LEFT JOIN teams2 t ON ea.team_id = t.id
             LEFT JOIN csd_evaluation_status cs ON cs.employee_id = e.id AND cs.\`year_month\` = ?
             WHERE d.code = 'collection' AND p.level <= ?
             ORDER BY p.level DESC, e.db_name`,
            [...snapshotParams(when.yearMonth), when.yearMonth, COLLECTION_MAX_POSITION_LEVEL]
        )

        const staff = [...csdStaff, ...collectionStaff]

        const [qaRows] = await pool.execute(
            'SELECT employee_id, feedback, qa_dbname FROM feedback_by_nonesales_qa WHERE `year_month` = ?',
            [when.yearMonth]
        )
        const qaByEmployee = new Map(qaRows.map(row => [Number(row.employee_id), row]))

        const [year, month] = when.yearMonth.split('-').map(Number)
        const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })

        res.json(staff.map(employee => {
            const qa = qaByEmployee.get(Number(employee.id))
            return {
                id: employee.id,
                db_name: employee.db_name,
                image_link: employee.image_link,
                employee_status: employee.employee_status,
                position_name: employee.position_name,
                position_level: employee.position_level,
                department_code: employee.department_code,
                manager_dbname: employee.manager_dbname,
                team_name: employee.team_name,
                eval_submitted: employee.eval_submitted,
                year_month: when.yearMonth,
                month: monthName,
                year,
                qa_feedback: qa ? Number(qa.feedback).toFixed(4) : null,
                qa_dbname: qa ? qa.qa_dbname : null,
            }
        }))

    } catch (error) {
        console.error('Error fetching the CSD staff for the QA feedback', error)
        res.status(500).json({ error: 'Database Error, Cannot fetch the CSD staff for the QA feedback' })
    }
}


// POST /csd_qa_feedback/:employee_id?year_month=YYYY-MM    body: { feedback_score }
exports.addQaFeedback = async (req, res, next) => {
    try {
        const request = await readChangeRequest(req, { needsScore: true })
        if (request.error) return res.status(request.error.status).json({ message: request.error.message })

        const { employee, score, yearMonth } = request
        const qa = await getQaIdentity(req)

        await pool.execute(
            `INSERT INTO feedback_by_nonesales_qa (employee_id, db_name, qa_id, qa_dbname, qa_role, \`year_month\`, feedback)
             VALUES (?,?,?,?,?,?,?)`,
            [employee.id, employee.db_name, qa.qa_id, qa.qa_dbname, qa.qa_role, yearMonth, score]
        )

        res.status(201).json({ message: `${score} QA feedback for ${employee.db_name} (${yearMonth}) is created or recorded` })

    } catch (error) {
        // the table is unique per employee + month
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'The QA feedback of this employee for the month already exists, please edit it instead' })
        }
        console.error('Error adding the QA feedback', error)
        res.status(500).json({ error: 'Database Error, Error adding the QA feedback' })
    }
}


// PUT /csd_qa_feedback/:employee_id?year_month=YYYY-MM    body: { feedback_score }
exports.updateQaFeedback = async (req, res, next) => {
    try {
        const request = await readChangeRequest(req, { needsScore: true })
        if (request.error) return res.status(request.error.status).json({ message: request.error.message })

        const { employee, score, yearMonth } = request
        const qa = await getQaIdentity(req)

        const [result] = await pool.execute(
            `UPDATE feedback_by_nonesales_qa SET db_name = ?, qa_id = ?, qa_dbname = ?, qa_role = ?, feedback = ?
              WHERE employee_id = ? AND \`year_month\` = ?`,
            [employee.db_name, qa.qa_id, qa.qa_dbname, qa.qa_role, score, employee.id, yearMonth]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No QA feedback for ${employee.db_name} (${yearMonth}) to update` })
        }

        res.json({ message: `QA feedback for ${employee.db_name} (${yearMonth}) is updated` })

    } catch (error) {
        console.error('Error updating the QA feedback', error)
        res.status(500).json({ error: 'Database Error, Error updating the QA feedback' })
    }
}


// DELETE /csd_qa_feedback/:employee_id?year_month=YYYY-MM
exports.deleteQaFeedback = async (req, res, next) => {
    try {
        const request = await readChangeRequest(req, { needsScore: false })
        if (request.error) return res.status(request.error.status).json({ message: request.error.message })

        const { employee, yearMonth } = request

        const [result] = await pool.execute(
            'DELETE FROM feedback_by_nonesales_qa WHERE employee_id = ? AND `year_month` = ?',
            [employee.id, yearMonth]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No QA feedback for ${employee.db_name} (${yearMonth}) to delete` })
        }

        res.json({ message: `QA feedback for ${employee.db_name} (${yearMonth}) is deleted` })

    } catch (error) {
        console.error('Error deleting the QA feedback', error)
        res.status(500).json({ error: 'Database Error, Error deleting the QA feedback' })
    }
}
