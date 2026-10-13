// Locks the CSD evaluation data of an employee for a month (none-sales only, the sales evaluation has its own rules).
//  1. Resigned staff: can never be changed, not even after the evaluation is reviewed.
//  2. Submitted evaluation (csd_evaluation_status.submitted = 1): can not be changed until the admin clicks Review.
// The resigned check is first, then the submitted check (same order as the sales pages).
// Used by the routes that change Performance, Absences, Tardiness, Memo, Feedback (Admin) and Feedback (QA).
// Feedback (Immediate Head) and Feedback (Members) are given in the Give Feedback pages and are not part of this lock.
const pool = require('../config/db')

const YEAR_MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

exports.lockCsdEvaluationWhenSubmitted = async (req, res, next) => {
    const employeeId = Number(req.params.employee_id)
    const yearMonth = req.query.year_month || currentYearMonth()

    // bad values are answered by the controllers, the lock only decides about valid ones
    if (!Number.isInteger(employeeId) || employeeId < 1 || !YEAR_MONTH_FORMAT.test(yearMonth)) return next()

    try {
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
            return res.status(409).json({ message: 'The data of a resigned employee can not be changed' })
        }

        const [status] = await pool.execute(
            'SELECT 1 FROM csd_evaluation_status WHERE employee_id = ? AND `year_month` = ? AND submitted = 1 LIMIT 1',
            [employeeId, yearMonth]
        )
        if (status.length > 0) {
            return res.status(409).json({ message: `The evaluation of this employee for ${yearMonth} is already submitted, click Review first to change it` })
        }

        next()
    } catch (error) {
        console.error('Error checking the CSD evaluation lock', error)
        res.status(500).json({ error: 'Database Error, Cannot check if the evaluation is submitted' })
    }
}
