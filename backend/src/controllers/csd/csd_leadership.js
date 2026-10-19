const pool = require('../../config/db')
const { EVALUATED_LEVELS } = require('../../config/leadership_tasks')

// The Leadership Individual Performance of the leaders (position level 7, 8, 9, 10) in the CSD Evaluation.
// The evaluation is made by the head of the employee in csd_leadership_controller.js (table leadership_evaluations).
// Every leader of the list gets:
//   leadership_required   true (the leader can not be submitted without it)
//   leadership_score      the score of the questionnaire, 1 - 5 (the average when more than one head evaluated), 0 = not answered yet
//   leadership_by         who evaluated: [{ evaluator_id, evaluator_dbname, leadership_score }]
// The score is the LEADERSHIP part of the Performance, see scoreEmployee() in csd_leaderboard_controller.js.
exports.attachLeadership = async (rows, yearMonth) => {
    const leaders = rows.filter(row => EVALUATED_LEVELS.includes(Number(row.position_level)))
    if (leaders.length === 0) return

    let evaluations = []
    try {
        const [found] = await pool.query(
            'SELECT employee_id, evaluator_id, evaluator_dbname, leadership_score FROM leadership_evaluations WHERE `year_month` = ? AND employee_id IN (?)',
            [yearMonth, leaders.map(leader => Number(leader.id))]
        )
        evaluations = found
    } catch (error) {
        // the evaluation still loads when the leadership can not be read: the leaders are "not answered"
        console.error('Error fetching the leadership evaluations', error)
    }

    for (const leader of leaders) {
        const mine = evaluations.filter(evaluation => Number(evaluation.employee_id) === Number(leader.id))
        const average = mine.length ? mine.reduce((sum, evaluation) => sum + Number(evaluation.leadership_score), 0) / mine.length : 0

        leader.leadership_required = true
        leader.leadership_score = Number(average.toFixed(4))
        leader.leadership_by = mine.map(evaluation => ({
            evaluator_id: Number(evaluation.evaluator_id),
            evaluator_dbname: evaluation.evaluator_dbname,
            leadership_score: Number(evaluation.leadership_score),
        }))
    }
}
