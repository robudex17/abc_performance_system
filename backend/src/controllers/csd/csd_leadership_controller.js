const pool = require('../../config/db')
const { FROM_SNAPSHOT, snapshotParams } = require('./csd_month_snapshot')
const { LEADERSHIP_TASKS, LEADERSHIP_SCORES, EVALUATED_LEVELS, MANAGER_LEVEL, GOM_LEVEL } = require('../../config/leadership_tasks')

// Leadership Individual Performance (table leadership_evaluations), for the position level 7, 8, 9 and 10.
// It is a form (TASK | KEY PERFORMANCE INDICATORS | SCORE | COMMENTS) answered by the HEAD of the evaluated employee:
//   the GOM (position level 15)      -> the CSD & Collection Manager (level 10)
//   the CSD & Collection Manager     -> the assistant managers and the Quality Analyst (his direct reports)
//   an assistant manager             -> his/her team leaders and assistant team leaders (direct reports of level 7, 8)
// The head is the immediate head (manager_id) of the month, in any department (the Collection assistant manager evaluates the
// Collection team leaders). The result of an evaluation is the average of the scores (1 - 5), it is the LEADERSHIP part
// of the Performance in the CSD Evaluation (csd_leadership.js).
//
// The answers are confidential like the feedback: only the one who gives the evaluation reads, saves and deletes it. Admin and
// poweruser can only VIEW it. A month that is already submitted (CSD Evaluation) or a resigned employee can not be changed:
// middleware/csd_evaluation_lock.js, used in the routes.
//
//   GET    /leadership_evaluations/tasks                          the form (tasks, indicators and the scores of the drop down)
//   GET    /leadership_evaluations?year_month=YYYY-MM             the employees I evaluate, with my result of the month
//   GET    /leadership_evaluations/:employee_id?year_month=...    my evaluation of the employee (admin / poweruser: ?evaluator_id=)
//   POST   /leadership_evaluations/:employee_id?year_month=...    body { responses: [{ task, score, comment }] }
//   PUT    /leadership_evaluations/:employee_id?year_month=...    the same body
//   DELETE /leadership_evaluations/:employee_id?year_month=...

const YEAR_MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/
const MAX_COMMENT_LENGTH = 1000
const VIEWER_ROLES = ['admin', 'poweruser']

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

const readYearMonth = (value) => {
    const yearMonth = value || currentYearMonth()
    return YEAR_MONTH_FORMAT.test(yearMonth) ? { yearMonth } : { error: 'year_month must be in YYYY-MM format' }
}

// the employees of the month (any department) that the user evaluates: the direct reports of level 7 - 10,
// or the CSD & Collection Manager when the user is the GOM. employeeId: only that employee.
const getEvaluatees = async (user, yearMonth, employeeId = null) => {
    const myId = Number(user.login_id)
    const isGom = Number(user.position_level) === GOM_LEVEL

    const [rows] = await pool.execute(
        `SELECT e.id, e.db_name, e.image_link, d.code AS department_code, p.level AS position_level, p.position_name,
                t.name AS team_name, ee.status AS employee_status, mgr.db_name AS manager_dbname,
                COALESCE(cs.submitted, 0) AS eval_submitted
         ${FROM_SNAPSHOT}
         LEFT JOIN teams2 t ON ea.team_id = t.id
         LEFT JOIN csd_evaluation_status cs ON cs.employee_id = e.id AND cs.\`year_month\` = ?
         LEFT JOIN employees mgr ON ea.manager_id = mgr.id
         WHERE p.level IN (${EVALUATED_LEVELS.map(() => '?').join(',')})
           AND ((ea.manager_id = ? AND e.id <> ?) OR (? AND p.level = ?))
           ${employeeId ? 'AND e.id = ?' : ''}
         ORDER BY p.level DESC, e.db_name`,
        [...snapshotParams(yearMonth), yearMonth, ...EVALUATED_LEVELS, myId, myId, isGom ? 1 : 0, MANAGER_LEVEL, ...(employeeId ? [employeeId] : [])]
    )
    return rows
}

// why an evaluation can not be changed (the resigned employee first, then the submitted month), or null
const lockOf = (employee) => {
    if (employee.employee_status === 'Resigned') {
        return { reason: 'Resigned', message: 'The leadership evaluation of a resigned employee can not be added, updated or deleted' }
    }
    if (Number(employee.eval_submitted) === 1) {
        return { reason: 'Submitted', message: 'The CSD Evaluation of this employee is already submitted, the leadership evaluation can not be added, updated or deleted' }
    }
    return null
}

// reads and checks the answers of the form. Returns { responses, total, score, percentage } or { error }
const readResponses = (body) => {
    const given = Array.isArray(body?.responses) ? body.responses : null
    if (!given) return { error: 'responses must be a list of { task, score, comment }' }

    const validScores = LEADERSHIP_SCORES.map(item => item.score)
    const responses = []

    for (const task of LEADERSHIP_TASKS) {
        const answer = given.find(item => item?.task === task.task)
        if (!answer) return { error: `The task "${task.task}" is not answered` }

        const score = Number(answer.score)
        if (!Number.isInteger(score) || !validScores.includes(score)) {
            return { error: `The score of "${task.task}" must be one of ${validScores.join(', ')}` }
        }

        const comment = String(answer.comment ?? '').trim()
        if (comment === '') return { error: `The comment of "${task.task}" is required` }
        if (comment.length > MAX_COMMENT_LENGTH) return { error: `The comment of "${task.task}" is too long (${MAX_COMMENT_LENGTH} characters at most)` }

        responses.push({ task: task.task, score, comment })
    }

    const total = responses.reduce((sum, response) => sum + response.score, 0)
    const maxTotal = Math.max(...validScores) * responses.length
    return {
        responses,
        total,
        score: (total / responses.length).toFixed(4),
        percentage: ((total / maxTotal) * 100).toFixed(2),
    }
}

// who is who in a request that changes an evaluation. Returns { error: { status, message } } or the values
const readChange = async (req, { needsBody }) => {
    const employeeId = Number(req.params.employee_id)
    if (!Number.isInteger(employeeId) || employeeId < 1) return { error: { status: 400, message: 'employee_id must be a positive integer' } }

    const when = readYearMonth(req.query.year_month)
    if (when.error) return { error: { status: 400, message: when.error } }
    if (when.yearMonth > currentYearMonth()) {
        return { error: { status: 400, message: 'Adding, Updating, or Deleting the leadership evaluation for a future month is prohibited' } }
    }

    // only the head of the employee (or the GOM for the manager)
    const [employee] = await getEvaluatees(req.user, when.yearMonth, employeeId)
    if (!employee) return { error: { status: 403, message: 'You are not allowed to evaluate this employee' } }

    // a resigned employee, or a month that is already submitted in the CSD Evaluation, can not be added, updated or deleted
    // (the same rule as middleware/csd_evaluation_lock.js, checked here too)
    const lock = lockOf(employee)
    if (lock) return { error: { status: 409, message: lock.message } }

    let answers
    if (needsBody) {
        answers = readResponses(req.body)
        if (answers.error) return { error: { status: 400, message: answers.error } }
    }

    return { employee, yearMonth: when.yearMonth, answers }
}

exports.fetchTasks = (req, res) => {
    res.json({ tasks: LEADERSHIP_TASKS, scores: LEADERSHIP_SCORES })
}

// the employees I evaluate and my result of the month
exports.fetchMyEvaluatees = async (req, res) => {
    const when = readYearMonth(req.query.year_month)
    if (when.error) return res.status(400).json({ error: when.error })

    try {
        const employees = await getEvaluatees(req.user, when.yearMonth)

        const [mine] = await pool.execute(
            'SELECT employee_id, leadership_score, percentage FROM leadership_evaluations WHERE evaluator_id = ? AND `year_month` = ?',
            [req.user.login_id, when.yearMonth]
        )
        const byEmployee = new Map(mine.map(row => [Number(row.employee_id), row]))

        const [year, month] = when.yearMonth.split('-').map(Number)
        const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })

        res.json(employees.map(employee => {
            const evaluation = byEmployee.get(Number(employee.id))
            return {
                ...employee,
                year_month: when.yearMonth,
                month: monthName,
                year,
                evaluated: Boolean(evaluation),
                // the evaluation can only be viewed: the employee is resigned or the month is submitted
                locked: Boolean(lockOf(employee)),
                locked_reason: lockOf(employee)?.reason ?? null,
                leadership_score: evaluation ? Number(evaluation.leadership_score).toFixed(4) : null,
            }
        }))
    } catch (error) {
        console.error('Error fetching the employees to evaluate', error)
        res.status(500).json({ error: 'Database Error, Cannot fetch the employees to evaluate' })
    }
}

exports.fetchEvaluation = async (req, res) => {
    const employeeId = Number(req.params.employee_id)
    const when = readYearMonth(req.query.year_month)
    if (!Number.isInteger(employeeId) || employeeId < 1) return res.status(400).json({ error: 'employee_id must be a positive integer' })
    if (when.error) return res.status(400).json({ error: when.error })

    // the evaluator: me, or (admin / poweruser, view only) the one chosen in ?evaluator_id
    const isViewer = VIEWER_ROLES.includes(req.user.role)
    const evaluatorId = isViewer && req.query.evaluator_id ? Number(req.query.evaluator_id) : Number(req.user.login_id)
    if (!isViewer && evaluatorId !== Number(req.user.login_id)) {
        return res.status(403).json({ error: 'You are not allowed to view the leadership evaluation of other users' })
    }

    try {
        const [rows] = await pool.execute(
            `SELECT evaluator_id, evaluator_dbname, employee_id, employee_dbname, responses, leadership_score, total_score, percentage, \`year_month\`
             FROM leadership_evaluations WHERE evaluator_id = ? AND employee_id = ? AND \`year_month\` = ?`,
            [evaluatorId, employeeId, when.yearMonth]
        )

        if (rows.length === 0) return res.json(null)

        const row = rows[0]
        res.json({ ...row, responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses })
    } catch (error) {
        console.error('Error fetching the leadership evaluation', error)
        res.status(500).json({ error: 'Database Error, Cannot fetch the leadership evaluation' })
    }
}

exports.addEvaluation = async (req, res) => {
    try {
        const request = await readChange(req, { needsBody: true })
        if (request.error) return res.status(request.error.status).json({ message: request.error.message })

        const { employee, yearMonth, answers } = request

        await pool.execute(
            `INSERT INTO leadership_evaluations
                (evaluator_id, evaluator_dbname, employee_id, employee_dbname, responses, leadership_score, total_score, percentage, \`year_month\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.login_id, req.user.db_name ?? String(req.user.login_id), employee.id, employee.db_name,
                JSON.stringify(answers.responses), answers.score, answers.total, answers.percentage, yearMonth]
        )

        res.status(201).json({ message: `Leadership evaluation of ${employee.db_name} (${yearMonth}) is saved`, leadership_score: answers.score })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'You already evaluated this employee for the month, please edit the evaluation instead' })
        }
        console.error('Error adding the leadership evaluation', error)
        res.status(500).json({ error: 'Database Error, Cannot save the leadership evaluation' })
    }
}

exports.updateEvaluation = async (req, res) => {
    try {
        const request = await readChange(req, { needsBody: true })
        if (request.error) return res.status(request.error.status).json({ message: request.error.message })

        const { employee, yearMonth, answers } = request

        const [result] = await pool.execute(
            `UPDATE leadership_evaluations
                SET evaluator_dbname = ?, employee_dbname = ?, responses = ?, leadership_score = ?, total_score = ?, percentage = ?
              WHERE evaluator_id = ? AND employee_id = ? AND \`year_month\` = ?`,
            [req.user.db_name ?? String(req.user.login_id), employee.db_name, JSON.stringify(answers.responses), answers.score,
                answers.total, answers.percentage, req.user.login_id, employee.id, yearMonth]
        )
        if (result.affectedRows === 0) return res.status(404).json({ message: 'There is no leadership evaluation to update' })

        res.json({ message: `Leadership evaluation of ${employee.db_name} (${yearMonth}) is updated`, leadership_score: answers.score })
    } catch (error) {
        console.error('Error updating the leadership evaluation', error)
        res.status(500).json({ error: 'Database Error, Cannot update the leadership evaluation' })
    }
}

exports.deleteEvaluation = async (req, res) => {
    try {
        const request = await readChange(req, { needsBody: false })
        if (request.error) return res.status(request.error.status).json({ message: request.error.message })

        const { employee, yearMonth } = request

        const [result] = await pool.execute(
            'DELETE FROM leadership_evaluations WHERE evaluator_id = ? AND employee_id = ? AND `year_month` = ?',
            [req.user.login_id, employee.id, yearMonth]
        )
        if (result.affectedRows === 0) return res.status(404).json({ message: 'There is no leadership evaluation to delete' })

        res.json({ message: `Leadership evaluation of ${employee.db_name} (${yearMonth}) is deleted` })
    } catch (error) {
        console.error('Error deleting the leadership evaluation', error)
        res.status(500).json({ error: 'Database Error, Cannot delete the leadership evaluation' })
    }
}
