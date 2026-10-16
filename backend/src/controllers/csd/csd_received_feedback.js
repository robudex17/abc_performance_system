const pool = require('../../config/db')
const { isQaStaff } = require('../../middleware/qa_access')
const { FROM_SNAPSHOT, snapshotParams } = require('./csd_month_snapshot')

// The feedback an employee RECEIVED in a month, for the CSD Evaluation page (same idea as the sales evaluation, where
// the list of every feedback has ALL the people who should give it: the ones who did not give yet have a score of 0).
// The admin can only VIEW these three, they are given by others:
//
//   feedback_by_qa              the Quality Analyst   (feedback_by_nonesales_qa)
//   feedback_by_immediate_head  the immediate head    (feedback_by_heads:   immediate_head_id rates member_id)
//   feedback_by_members         the members           (feedback_by_members: member_id rates immediate_head_id)
//
// Each one is the average (4 decimals) of the feedback that was given, or null when nobody gave it yet, and has a
// *_list with the people who should give it:
//   { who_give_feedback_id, who_give_feedback_name, image_link, month, year, feedback_score }   (feedback_score 0 = not given yet)
//
//   members      all the employees whose immediate head is the employee (in the month of the evaluation)
//   immediate head  the immediate head of the employee
//   QA           the Quality Analyst who gave it, or all the Quality Analysts while nobody gave it (one QA feedback per month)

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// average of the scores that were given (0 = not given yet is ignored), null when there is none
const average = (list) => {
    const scores = list.map(item => parseFloat(item.feedback_score)).filter(score => score > 0)
    if (scores.length === 0) return null
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(4)
}

const groupBy = (rows, key) => {
    const groups = new Map()
    for (const row of rows) {
        const id = Number(row[key])
        if (!groups.has(id)) groups.set(id, [])
        groups.get(id).push(row)
    }
    return groups
}

// expected: the people who should give the feedback { id, db_name, image_link }
// given: the feedback that exists { who_give_feedback_id, who_give_feedback_name, image_link, feedback_score }
// The ones who did not give yet come first (score 0), then the ones who gave, both by name.
const buildList = (expected, given, month, year) => {
    const givenById = new Map(given.map(item => [Number(item.who_give_feedback_id), item]))

    const list = expected.map(person => givenById.get(Number(person.id)) ?? {
        who_give_feedback_id: person.id,
        who_give_feedback_name: person.db_name,
        image_link: person.image_link,
        feedback_score: 0,
    })

    // a feedback of somebody who is not expected anymore (moved, resigned ...) is not lost
    for (const item of given) {
        if (!expected.some(person => Number(person.id) === Number(item.who_give_feedback_id))) list.push(item)
    }

    return list
        .map(item => ({ ...item, month, year }))
        .sort((a, b) =>
            (parseFloat(a.feedback_score) > 0) - (parseFloat(b.feedback_score) > 0) ||
            String(a.who_give_feedback_name).localeCompare(String(b.who_give_feedback_name)))
}

// Adds the three feedback (and their lists) to every employee of the evaluation. The evaluation still loads when
// the feedback can not be read: the fields are null / empty then.
// excludedIds: staff that is not in the evaluation (the Purchasing Manager): he does not give the immediate head feedback
exports.attachReceivedFeedback = async (employees, yearMonth, excludedIds = new Set()) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const monthName = MONTH_NAMES[month - 1]

    let byQa = new Map(), byHead = new Map(), byMembers = new Map()

    try {
        const [qaRows] = await pool.execute(
            `SELECT q.employee_id, q.qa_id AS who_give_feedback_id, q.qa_dbname AS who_give_feedback_name,
                    e.image_link, q.feedback AS feedback_score
               FROM feedback_by_nonesales_qa q
               LEFT JOIN employees e ON e.id = q.qa_id
              WHERE q.\`year_month\` = ?`,
            [yearMonth]
        )

        // the immediate head rates the member
        const [headRows] = await pool.execute(
            `SELECT h.member_id AS employee_id, h.immediate_head_id AS who_give_feedback_id, h.immediate_head_dbname AS who_give_feedback_name,
                    e.image_link, h.feedback_score
               FROM feedback_by_heads h
               LEFT JOIN employees e ON e.id = h.immediate_head_id
              WHERE h.\`year_month\` = ?`,
            [yearMonth]
        )

        // the members rate the immediate head
        const [memberRows] = await pool.execute(
            `SELECT m.immediate_head_id AS employee_id, m.member_id AS who_give_feedback_id, m.member_dbname AS who_give_feedback_name,
                    e.image_link, m.feedback_score
               FROM feedback_by_members m
               LEFT JOIN employees e ON e.id = m.member_id
              WHERE m.\`year_month\` = ?`,
            [yearMonth]
        )

        byQa = groupBy(qaRows, 'employee_id')
        byHead = groupBy(headRows, 'employee_id')
        byMembers = groupBy(memberRows, 'employee_id')

    } catch (error) {
        console.error('Error fetching the received feedback of the CSD evaluation', error)
    }

    // members of the employees who are in ANOTHER department: the Collection assistant manager has the CSD & Collection Manager
    // as immediate head, and the manager is in the CSD list only (the resigned ones are not expected to give feedback)
    let outsideMembers = []
    try {
        const ids = employees.map(employee => Number(employee.id))
        if (ids.length > 0) {
            const [rows] = await pool.query(
                `SELECT e.id, e.db_name, e.image_link, ea.manager_id
                 ${FROM_SNAPSHOT}
                 WHERE ea.manager_id IN (?) AND e.id NOT IN (?) AND ee.status <> 'Resigned'`,
                [...snapshotParams(yearMonth), ids, ids]
            )
            outsideMembers = rows
        }
    } catch (error) {
        console.error('Error fetching the members of the other departments', error)
    }

    const stripEmployee = (rows = []) => rows.map(({ employee_id, ...feedback }) => feedback)
    const employeesById = new Map(employees.map(employee => [Number(employee.id), employee]))
    // the Quality Analyst belongs to CSD but is also the QA of Collection: read from the employees of ALL the departments,
    // the list of the page only has the staff of one department
    let qaStaff = employees.filter(employee => isQaStaff(employee))
    try {
        // the position name is compared in the code (isQaStaff ignores the spaces and the capitals)
        const [rows] = await pool.query(
            `SELECT e.id, e.db_name, e.image_link, p.position_name
             ${FROM_SNAPSHOT}
             WHERE ee.status <> 'Resigned'`,
            snapshotParams(yearMonth)
        )
        const qaRows = rows.filter(row => isQaStaff(row))
        if (qaRows.length > 0) qaStaff = qaRows
    } catch (error) {
        console.error('Error fetching the Quality Analyst', error)
    }

    for (const employee of employees) {
        const id = Number(employee.id)

        // the members of the employee: everybody whose immediate head he/she is (the top manager is his/her own manager)
        const members = [
            ...employees.filter(other => Number(other.manager_id) === id && Number(other.id) !== id),
            ...outsideMembers.filter(other => Number(other.manager_id) === id),
        ]

        // the immediate head of the employee (none for the top manager)
        const hasHead = employee.manager_id && Number(employee.manager_id) !== id && !excludedIds.has(Number(employee.manager_id))
        const head = hasHead
            ? [{ id: employee.manager_id, db_name: employee.manager_dbname, image_link: employeesById.get(Number(employee.manager_id))?.image_link }]
            : []

        const givenByQa = stripEmployee(byQa.get(id))
        const givenByHead = stripEmployee(byHead.get(id))
        const givenByMembers = stripEmployee(byMembers.get(id))

        const qaList = buildList(givenByQa.length > 0 ? [] : qaStaff, givenByQa, monthName, year)
        const headList = buildList(head, givenByHead, monthName, year)
        const membersList = buildList(members, givenByMembers, monthName, year)

        employee.feedback_by_qa = average(qaList)
        employee.feedback_by_qa_list = qaList
        employee.feedback_by_immediate_head = average(headList)
        employee.feedback_by_immediate_head_list = headList
        employee.feedback_by_members = average(membersList)
        employee.feedback_by_members_list = membersList
    }

    return employees
}
