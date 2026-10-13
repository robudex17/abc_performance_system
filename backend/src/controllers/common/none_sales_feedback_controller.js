const pool = require('../../config/db')

const YEAR_MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/

// feedback_type -> table and which side (member / immediate_head) gives and receives the feedback
//   by_member : the member rates his/her immediate head  -> feedback_by_members
//   by_head   : the immediate head rates his/her member  -> feedback_by_heads
// The table and column names come from this map only (never from the request).
const FEEDBACK_TYPES = {
    by_member: { table: 'feedback_by_members', giver: 'member', receiver: 'immediate_head', label: 'Member' },
    by_head: { table: 'feedback_by_heads', giver: 'immediate_head', receiver: 'member', label: 'Immediate Head' },
}

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

// YYYY-MM strings compare correctly as text, so a later month is simply "greater"
const isFutureYearMonth = (year_month) => year_month > currentYearMonth()

// The answers of a feedback are confidential.
//  - Only the giver can give or change a feedback. Nobody else can do it on his/her behalf: admin and poweruser included.
//  - The giver can read it. Admin and poweruser can also read it, to VIEW it only.
const isNotTheGiver = (req, who_give_feedback_id) =>
    Number(who_give_feedback_id) !== Number(req.user.login_id)

const VIEWER_ROLES = ['admin', 'poweruser']
const canReadFeedback = (req, who_give_feedback_id) =>
    !isNotTheGiver(req, who_give_feedback_id) || VIEWER_ROLES.includes(req.user.role)

// A user can only rate his/her own immediate head (by_member) or his/her own members (by_head).
const isRelatedToTheGiver = async (feedback_type, who_give_feedback_id, who_receive_feedback_id) => {
    // latest assignment of the employee whose manager we need to compare
    const employeeId = feedback_type === 'by_member' ? who_give_feedback_id : who_receive_feedback_id
    const expectedManagerId = feedback_type === 'by_member' ? who_receive_feedback_id : who_give_feedback_id

    const [rows] = await pool.execute(
        `SELECT manager_id FROM employee_assignments WHERE employee_id = ? ORDER BY id DESC LIMIT 1`,
        [employeeId]
    )

    return rows.length > 0 && Number(rows[0].manager_id) === Number(expectedManagerId)
}


exports.addNoneSalesFeedback = async (req, res, next) => {
    const {
        who_give_feedback_id,
        who_receive_feedback_id,
        responses,
        feedback_score,
        total_score,
        percentage, date, year_month,
        feedback_type
    } = req.body

    const type = FEEDBACK_TYPES[feedback_type]
    if (!type) {
        return res.status(400).json({ error: `Invalid feedback type: ${feedback_type}` })
    }
    if (!YEAR_MONTH_FORMAT.test(year_month)) {
        return res.status(400).json({ error: 'year_month must be in YYYY-MM format' })
    }
    if (isFutureYearMonth(year_month)) {
        return res.status(400).json({ error: 'You cannot give feedback for a future month' })
    }
    if (isNotTheGiver(req, who_give_feedback_id)) {
        return res.status(403).json({ error: 'You are not allowed to give feedback on behalf of another user' })
    }

    const error_message = `Database Error, Cannot create ${type.label} Feedback`

    try {
        if (!(await isRelatedToTheGiver(feedback_type, who_give_feedback_id, who_receive_feedback_id))) {
            return res.status(403).json({ error: 'You can only give feedback to your own immediate head or members' })
        }

        // the names are read from the database (the login token / browser does not always have the db_name)
        const [employees] = await pool.execute(
            `SELECT id, db_name FROM employees WHERE id IN (?, ?)`,
            [who_give_feedback_id, who_receive_feedback_id]
        )
        const nameOf = (id) => employees.find(employee => Number(employee.id) === Number(id))?.db_name

        const who_give_feedback_db_name = nameOf(who_give_feedback_id)
        const who_receive_feedback_db_name = nameOf(who_receive_feedback_id)

        if (!who_give_feedback_db_name || !who_receive_feedback_db_name) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        // one feedback per giver, receiver and month
        const [existing] = await pool.execute(
            `SELECT id FROM ${type.table} WHERE ${type.giver}_id = ? AND ${type.receiver}_id = ? AND \`year_month\` = ?`,
            [who_give_feedback_id, who_receive_feedback_id, year_month]
        )

        if (existing.length > 0) {
            return res.status(400).json({ error: `Feedback for ${who_receive_feedback_db_name} in ${year_month} is already submitted` })
        }

        await pool.execute(
            `INSERT INTO ${type.table}
                (${type.giver}_id, ${type.giver}_dbname, ${type.receiver}_id, ${type.receiver}_dbname,
                 responses, feedback_score, total_score, percentage, date, \`year_month\`)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                who_give_feedback_id, who_give_feedback_db_name, who_receive_feedback_id, who_receive_feedback_db_name,
                JSON.stringify(responses), feedback_score, total_score, percentage, date, year_month
            ]
        )

        res.status(201).json({
            message: `New Feedback for ${who_receive_feedback_db_name} with id ${who_receive_feedback_id} is created or recorded`
        })

    } catch (error) {
        console.error('Error inserting new none sales feedback record', error)
        res.status(500).json({ error: error_message })
    }
}


exports.updateNoneSalesFeedback = async (req, res, next) => {
    const {
        who_give_feedback_id,
        who_receive_feedback_id,
        responses,
        feedback_score,
        total_score,
        percentage, year_month,
        feedback_type
    } = req.body

    const type = FEEDBACK_TYPES[feedback_type]
    if (!type) {
        return res.status(400).json({ error: `Invalid feedback type: ${feedback_type}` })
    }
    if (!YEAR_MONTH_FORMAT.test(year_month)) {
        return res.status(400).json({ error: 'year_month must be in YYYY-MM format' })
    }
    if (isFutureYearMonth(year_month)) {
        return res.status(400).json({ error: 'You cannot give feedback for a future month' })
    }
    if (isNotTheGiver(req, who_give_feedback_id)) {
        return res.status(403).json({ error: 'You are not allowed to update feedback on behalf of another user' })
    }

    const error_message = `Database Error, Cannot Update ${type.label} Feedback`

    try {
        // the update is only allowed when can_update is enabled (by the admin)
        const [current] = await pool.execute(
            `SELECT can_update FROM ${type.table} WHERE ${type.giver}_id = ? AND ${type.receiver}_id = ? AND \`year_month\` = ?`,
            [who_give_feedback_id, who_receive_feedback_id, year_month]
        )

        if (current.length === 0) {
            return res.status(404).json({ message: `No feedback found for employee ${who_receive_feedback_id} in ${year_month}` })
        }

        if (!current[0].can_update) {
            return res.status(403).json({ message: 'You are not allowed to update your feedback response, Please contact your IT or Manager' })
        }

        const [result] = await pool.execute(
            `UPDATE ${type.table}
                SET responses = ?, feedback_score = ?, total_score = ?, percentage = ?, can_update = 0
              WHERE ${type.giver}_id = ? AND ${type.receiver}_id = ? AND \`year_month\` = ?`,
            [JSON.stringify(responses), feedback_score, total_score, percentage, who_give_feedback_id, who_receive_feedback_id, year_month]
        )

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: error_message })
        }

        res.status(200).json({
            message: `Feedback for employee ${who_receive_feedback_id} is updated`
        })

    } catch (error) {
        console.error('Error Updating None Sales Feedback records', error)
        res.status(500).json({ error: error_message })
    }
}


// GET /feedback_by_nonesales/:id?feedback_type=by_member|by_head&who_give_feedback_id=..&year_month=YYYY-MM
// :id is who_receive_feedback_id. Returns [] when the feedback is not submitted yet.
exports.getNoneSalesFeedback = async (req, res, next) => {
    const feedback_type = req.query.feedback_type
    const who_receive_feedback_id = req.params.id
    const who_give_feedback_id = req.query.who_give_feedback_id || req.user.login_id
    const year_month = req.query.year_month || currentYearMonth()

    const type = FEEDBACK_TYPES[feedback_type]
    if (!type) {
        return res.status(400).json({ error: `Invalid feedback type: ${feedback_type}` })
    }
    if (!YEAR_MONTH_FORMAT.test(year_month)) {
        return res.status(400).json({ error: 'year_month must be in YYYY-MM format' })
    }
    if (!canReadFeedback(req, who_give_feedback_id)) {
        return res.status(403).json({ error: 'You are not allowed to view the feedback of other users' })
    }

    try {
        const [result] = await pool.execute(
            `SELECT
                id,
                ${type.giver}_id AS who_give_feedback_id,
                ${type.giver}_dbname AS who_give_feedback_name,
                ${type.receiver}_id AS who_receive_feedback_id,
                ${type.receiver}_dbname AS who_receive_feedback_name,
                responses, feedback_score, total_score, percentage, date, \`year_month\`, can_update
             FROM ${type.table}
             WHERE ${type.giver}_id = ? AND ${type.receiver}_id = ? AND \`year_month\` = ?`,
            [who_give_feedback_id, who_receive_feedback_id, year_month]
        )

        res.json(result)

    } catch (error) {
        console.error(`Error fetching ${type.label} Feedback records`, error)
        res.status(500).json({ error: `Database Error, Error fetching ${type.label} Feedback records` })
    }
}


// PUT: enable / disable the feedback update, DELETE: delete the feedback (admin only, see routes)
exports.enableDisableDeleteNoneSalesFeedback = async (req, res, next) => {
    const {
        who_give_feedback_id,
        who_receive_feedback_id,
        can_update,
        year_month,
        feedback_type,
    } = req.body

    const type = FEEDBACK_TYPES[feedback_type]
    if (!type) {
        return res.status(400).json({ error: `Invalid feedback type: ${feedback_type}` })
    }
    if (!YEAR_MONTH_FORMAT.test(year_month)) {
        return res.status(400).json({ error: 'year_month must be in YYYY-MM format' })
    }

    let query
    let values
    let success_message
    const error_message = `${type.label} Feedback Not Found..Cannot ${req.method === 'PUT' ? 'Update' : 'Delete'} ${type.label} Feedback`

    if (req.method === 'PUT') {
        query = `UPDATE ${type.table} SET can_update = ? WHERE ${type.giver}_id = ? AND ${type.receiver}_id = ? AND \`year_month\` = ?`
        values = [can_update ? 1 : 0, who_give_feedback_id, who_receive_feedback_id, year_month]
        success_message = `${type.label} can ${can_update ? 'now' : 'no longer'} update their feedback`
    } else {
        query = `DELETE FROM ${type.table} WHERE ${type.giver}_id = ? AND ${type.receiver}_id = ? AND \`year_month\` = ?`
        values = [who_give_feedback_id, who_receive_feedback_id, year_month]
        success_message = `${type.label} Feedback is deleted`
    }

    try {
        const [result] = await pool.execute(query, values)

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: error_message })
        }

        res.status(201).json({
            message: success_message
        })

    } catch (error) {
        console.error(error_message, error)
        res.status(500).json({ error: 'Database Error', error_message })
    }
}


const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// average of the scores of a list of feedback (0 = "no feedback yet" is ignored), null when there is none
const averageScore = (rows) => {
    const scores = rows.map(row => parseFloat(row.feedback_score)).filter(score => score > 0)
    if (scores.length === 0) return null
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(4)
}

// Overall feedback of an employee for a month:
//  1. the feedback by the admin (feedback_by_admin) overrules everything when there is one
//  2. else the average of the averages that exist: from members, from head and by QA
//     (an employee with only a QA feedback gets the QA feedback as the overall feedback)
//  3. null when there is no feedback at all
// Exported so the leaderboard / evaluation can use the same rule.
const computeOverallFeedback = ({ adminFeedback, fromMembers, fromHead, byQa }) => {
    if (adminFeedback !== undefined && adminFeedback !== null) {
        return Number(adminFeedback).toFixed(4)
    }

    const averages = [fromMembers, fromHead, byQa].filter(average => average !== null).map(parseFloat)
    if (averages.length === 0) return null

    return (averages.reduce((sum, average) => sum + average, 0) / averages.length).toFixed(4)
}
exports.computeOverallFeedback = computeOverallFeedback


// GET /feedback_by_nonesales_summary/:employee_id?year_month=YYYY-MM  (admin only, see routes)
// The feedback RECEIVED by the employee in ONE month (same idea as the sales Feedback Information table).
// The month is year_month, or the current month when it is not given:
//   months       the selected month with the averages and the overall feedback (empty for a future month)
//   from_members feedback of the members about their head (feedback_by_members)  -> list of the modal
//   from_head    feedback of the head about the member (feedback_by_heads)       -> list of the modal
//   qa           feedback by the QA (feedback_by_qa)
//   admin        feedback by the admin (feedback_by_admin)
exports.getNoneSalesFeedbackSummary = async (req, res, next) => {
    const employeeId = Number(req.params.employee_id)
    const yearMonth = req.query.year_month || currentYearMonth()

    if (!Number.isInteger(employeeId) || employeeId < 1) {
        return res.status(400).json({ error: 'employee_id must be a positive integer' })
    }
    if (!YEAR_MONTH_FORMAT.test(yearMonth)) {
        return res.status(400).json({ error: 'year_month must be in YYYY-MM format' })
    }

    const [year, month] = yearMonth.split('-').map(Number)

    try {
        const [fromMembers] = await pool.execute(
            `SELECT fm.id, 'by_member' AS feedback_type,
                    fm.member_id AS who_give_feedback_id, fm.member_dbname AS who_give_feedback_name,
                    fm.immediate_head_id AS who_receive_feedback_id, fm.immediate_head_dbname AS who_receive_feedback_name,
                    e.image_link, fm.feedback_score, fm.total_score, fm.percentage, fm.\`year_month\`, fm.can_update
               FROM feedback_by_members fm
               LEFT JOIN employees e ON e.id = fm.member_id
              WHERE fm.immediate_head_id = ? AND fm.\`year_month\` = ?
              ORDER BY fm.member_dbname`,
            [employeeId, yearMonth]
        )

        const [fromHead] = await pool.execute(
            `SELECT fh.id, 'by_head' AS feedback_type,
                    fh.immediate_head_id AS who_give_feedback_id, fh.immediate_head_dbname AS who_give_feedback_name,
                    fh.member_id AS who_receive_feedback_id, fh.member_dbname AS who_receive_feedback_name,
                    e.image_link, fh.feedback_score, fh.total_score, fh.percentage, fh.\`year_month\`, fh.can_update
               FROM feedback_by_heads fh
               LEFT JOIN employees e ON e.id = fh.immediate_head_id
              WHERE fh.member_id = ? AND fh.\`year_month\` = ?
              ORDER BY fh.immediate_head_dbname`,
            [employeeId, yearMonth]
        )

        // the QA table keeps the month as a name and the year as a number
        const [qaRows] = await pool.execute(
            `SELECT id, qa_id AS who_give_feedback_id, qa_dbname AS who_give_feedback_name, feedback_score, month, year
               FROM feedback_by_qa
              WHERE agent_id = ? AND year = ? AND month = ?`,
            [employeeId, year, MONTH_NAMES[month - 1]]
        )
        const qa = qaRows.map(row => ({ ...row, feedback_type: 'qa', year_month: yearMonth }))

        const [admin] = await pool.execute(
            `SELECT admin_id, admin_dbname, \`year_month\`, feedback
               FROM feedback_by_admin
              WHERE employee_id = ? AND \`year_month\` = ?`,
            [employeeId, yearMonth]
        )

        // a month that has not started yet has nothing to show
        const months = []
        if (yearMonth <= currentYearMonth()) {
            const averageFromMembers = averageScore(fromMembers)
            const averageFromHead = averageScore(fromHead)
            const averageByQa = averageScore(qa)
            const adminRow = admin[0]

            months.push({
                year_month: yearMonth,
                month: MONTH_NAMES[month - 1],
                year,
                average_from_members: averageFromMembers,
                average_from_head: averageFromHead,
                average_by_qa: averageByQa,
                admin_feedback: adminRow ? Number(adminRow.feedback).toFixed(4) : null,
                overall_feedback: computeOverallFeedback({
                    adminFeedback: adminRow ? adminRow.feedback : null,
                    fromMembers: averageFromMembers,
                    fromHead: averageFromHead,
                    byQa: averageByQa,
                }),
            })
        }

        res.json({ year_month: yearMonth, month: MONTH_NAMES[month - 1], year, months, from_members: fromMembers, from_head: fromHead, qa, admin })

    } catch (error) {
        console.error('Error fetching none sales feedback summary', error)
        res.status(500).json({ error: 'Database Error, Error fetching none sales feedback summary' })
    }
}
