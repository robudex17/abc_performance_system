const pool = require('../../config/db')

// An office (table offices) can say that its people do not receive feedback from the employees of another office:
// the Japan office (the Purchasing Manager, the Data Uploading Manager, the GOM ...) does not get the feedback of the
// Philippines employees. The office of an employee is the office_id of his/her latest assignment.
// Nothing changes until offices.receives_feedback_from_other_offices is 0 for an office and employees are moved to it.

// ER_NO_SUCH_TABLE / ER_BAD_FIELD_ERROR: the migration (database/migrations/2026-10-27_offices.sql) is not run yet
const MIGRATION_NOT_RUN = ['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR']

// true when the member can rate the head, false when the office of the head does not receive feedback from the office of the member
exports.headCanReceiveFeedback = async (memberId, headId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT ea.employee_id, ea.office_id, o.receives_feedback_from_other_offices AS receives
               FROM employee_assignments ea
               JOIN offices o ON o.id = ea.office_id
              WHERE ea.id IN (SELECT MAX(id) FROM employee_assignments WHERE employee_id IN (?, ?) GROUP BY employee_id)`,
            [memberId, headId]
        )

        const member = rows.find(row => Number(row.employee_id) === Number(memberId))
        const head = rows.find(row => Number(row.employee_id) === Number(headId))
        if (!member || !head) return true

        const sameOffice = Number(member.office_id) === Number(head.office_id)
        return sameOffice || Boolean(head.receives)

    } catch (error) {
        if (MIGRATION_NOT_RUN.includes(error.code)) return true
        throw error
    }
}
