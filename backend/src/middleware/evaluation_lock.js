// Locks the CSD evaluation data of an employee for a month (none-sales only, the sales evaluation has its own rules).
//  1. Resigned staff: can never be changed, not even after the evaluation is reviewed.
//  2. Submitted evaluation (csd_evaluation_status.submitted = 1): can not be changed until the admin clicks Review.
// The resigned check is first, then the submitted check (same order as the sales pages).
// Used by the routes that change Performance, Absences, Tardiness, Memo, Feedback (Admin) and Feedback (QA), and by the
// admin buttons of the employee details page (the attendance routes, and the update / delete of a received feedback).
// Feedback (Immediate Head) and Feedback (Members) are GIVEN in the Give Feedback pages and are not part of this lock.
const pool = require('../config/db')

const { isPerformanceComputed } = require('../controllers/evaluation/performance_resolver')

const YEAR_MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

// Why the data of the employee can not be changed in the month: { reason, message }, or null when it can.
// evalType 'performance' also checks the computed performance.
const findLock = async (employeeId, yearMonth, evalType) => {
    // employment status in that month (same snapshot rule as the CSD Evaluation list)
    const [employment] = await pool.execute(
        `SELECT status FROM employee_employments
          WHERE employee_id = ?
            AND DATE_FORMAT(start_date, '%Y-%m') <= ?
            AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
          ORDER BY id DESC LIMIT 1`,
        [employeeId, yearMonth, yearMonth]
    )
    if (employment[0]?.status === 'Resigned') {
        return { reason: 'resigned', message: 'The data of a resigned employee can not be changed' }
    }

    // the computed performance (assistant team leaders, team leaders, assistant managers, the manager) can not be
    // added, changed or deleted: it is the average of the subordinates
    if (evalType === 'performance' && await isPerformanceComputed(employeeId, yearMonth)) {
        return { reason: 'computed', message: 'The performance of this employee is computed from the performance of the subordinates, it can not be changed' }
    }

    const [status] = await pool.execute(
        'SELECT 1 FROM csd_evaluation_status WHERE employee_id = ? AND `year_month` = ? AND submitted = 1 LIMIT 1',
        [employeeId, yearMonth]
    )
    if (status.length > 0) {
        return { reason: 'submitted', message: `The evaluation of this employee for ${yearMonth} is already submitted, click Review first to change it` }
    }

    return null
}

// read(req) -> { employeeId, yearMonth, evalType }: where each route keeps the employee and the month.
// useCurrentMonth: a request without a month is about the current month (the evaluation records), otherwise it is left to the
// controller to answer 400 (the bodies of the attendance and the feedback buttons).
const lockWith = (read, { useCurrentMonth = false } = {}) => async (req, res, next) => {
    const { employeeId: rawEmployeeId, yearMonth: rawYearMonth, evalType } = read(req)
    const employeeId = Number(rawEmployeeId)
    const yearMonth = rawYearMonth || (useCurrentMonth ? currentYearMonth() : undefined)

    // bad values are answered by the controllers, the lock only decides about valid ones
    if (!Number.isInteger(employeeId) || employeeId < 1 || !YEAR_MONTH_FORMAT.test(yearMonth)) return next()

    try {
        const lock = await findLock(employeeId, yearMonth, evalType)
        if (lock) return res.status(409).json({ message: lock.message })

        next()
    } catch (error) {
        console.error('Error checking the CSD evaluation lock', error)
        res.status(500).json({ error: 'Database Error, Cannot check if the evaluation is submitted' })
    }
}

// the evaluation records and the QA / leadership routes: /:employee_id and /:eval_type, the month in the query
exports.lockEvaluationWhenSubmitted = lockWith(
    req => ({ employeeId: req.params.employee_id, yearMonth: req.query.year_month, evalType: req.params.eval_type }),
    { useCurrentMonth: true }
)

// Absences, Tardiness and Memo of the details page: POST / PUT have the month in the body, DELETE in the query
exports.lockAttendanceWhenSubmitted = lockWith(
    req => ({ employeeId: req.params.employee_id, yearMonth: req.method === 'DELETE' ? req.query.year_month : req.body?.year_month })
)

// Update (can_update) and delete of a feedback the employee RECEIVED: the receiver is the employee of the details page
exports.lockFeedbackWhenSubmitted = lockWith(
    req => ({ employeeId: req.body?.who_receive_feedback_id, yearMonth: req.body?.year_month })
)

// GET /evaluation/lock/:employee_id?year_month=YYYY-MM : the details page disables its buttons with it
exports.getLockStatus = async (req, res) => {
    const employeeId = Number(req.params.employee_id)
    const yearMonth = req.query.year_month || currentYearMonth()

    if (!Number.isInteger(employeeId) || employeeId < 1) {
        return res.status(400).json({ message: 'employee_id must be a positive integer' })
    }
    if (!YEAR_MONTH_FORMAT.test(yearMonth)) {
        return res.status(400).json({ message: 'year_month must be in YYYY-MM format' })
    }

    try {
        const lock = await findLock(employeeId, yearMonth)
        res.status(200).json(lock ? { locked: true, ...lock } : { locked: false, reason: null, message: '' })
    } catch (error) {
        console.error('Error reading the CSD evaluation lock', error)
        res.status(500).json({ error: 'Database Error, Cannot read if the evaluation is submitted' })
    }
}
