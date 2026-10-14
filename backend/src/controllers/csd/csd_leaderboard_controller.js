const pool = require('../../config/db')
const { generateCsdEvaluation } = require('./csd_evaluation_controller')

// CSD leaderboard, built like the sales leaderboard but on the CSD evaluation (not on csd_performance_metrics):
//   - the rows are the ones of the CSD Evaluation page: Performance (typed by the admin), Absences, Tardiness, Memo and
//     the feedback, only the SUBMITTED ones count (csd_evaluation_status), the others are "INCOMPLETE RATING".
//   - Performance -> csd_performance_score (the Performance is rounded to a whole number first, 90.5 = 91).
//     Absences, Tardiness and Memo -> absences_score, tardiness_score, memorandum_score (0 = 5, not in the table = 0).
//   - Feedback: Feedback (Admin) when it exists, if not the average of the Feedback (QA), (Immediate Head) and (Members) that have a value.
//   - Final rating = the scores x the weights of evaluation_criteria (performance, absence, tardiness, memorandum_recieved, feedback),
//     the name of the rating comes from result_ratings.
// Boards (scope): agent (position level 1-3), team_leader (level 8), team (members of the team + the team leader).
// The managers (level 10 and 9, the Quality Analyst too) are not in the leaderboard for now.

const AGENT_LEVELS = [1, 2, 3]
const TEAM_LEADER_LEVELS = [8]
const RANKED_LEVELS = [...AGENT_LEVELS, ...TEAM_LEADER_LEVELS]
const SCOPES = ['agent', 'team_leader', 'team']
const INCOMPLETE = 'INCOMPLETE RATING'

const currentYearMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

const toNumber = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

// the score tables, read once per request
const loadScoreTables = async () => {
    const [performance] = await pool.execute('SELECT min_value, max_value, score, description FROM csd_performance_score')
    const [absences] = await pool.execute('SELECT absence_count AS count, score FROM absences_score')
    const [tardiness] = await pool.execute('SELECT tardiness_count AS count, score FROM tardiness_score')
    const [memo] = await pool.execute('SELECT memo_count AS count, score FROM memorandum_score')
    const [[criteria]] = await pool.execute('SELECT * FROM evaluation_criteria LIMIT 1')
    const [ratings] = await pool.execute('SELECT min_value, ratings_name FROM result_ratings ORDER BY min_value DESC')
    return { performance, absences, tardiness, memo, criteria, ratings }
}

// 0 is 5 points, a count that is not in the table is 0 point (same as the sales leaderboard)
const countScore = (table, count) => {
    if (toNumber(count) === 0) return 5
    return toNumber(table.find(row => Number(row.count) === Number(count))?.score)
}

// the first rating (highest first) the final rating reaches: no gap between 4.999 and 5
const ratingName = (ratings, finalRating) =>
    ratings.find(rating => finalRating >= toNumber(rating.min_value))?.ratings_name ?? ratings[ratings.length - 1]?.ratings_name ?? ''

const round4 = (value) => Number(value).toFixed(4)

// Feedback (Admin) overrules the others, if not: the average of the ones that have a value
const feedbackScore = (agent) => {
    const admin = toNumber(agent.feedback_by_admin)
    if (admin > 0) return admin

    const scores = [agent.feedback_by_qa, agent.feedback_by_immediate_head, agent.feedback_by_members].map(toNumber).filter(score => score > 0)
    return scores.length === 0 ? 0 : scores.reduce((sum, score) => sum + score, 0) / scores.length
}

// the scores and the rating of one employee (a row of the CSD evaluation)
const scoreEmployee = (agent, tables) => {
    const { criteria } = tables
    const submitted = Number(agent.submitted) === 1

    const performancePercent = Math.round(toNumber(agent.performance))
    const performanceRow = tables.performance.find(row => performancePercent >= toNumber(row.min_value) && performancePercent <= toNumber(row.max_value))

    const result = {
        id: agent.id,
        db_name: agent.db_name,
        image_link: agent.image_link,
        employee_status: agent.employee_status,
        position_name: agent.position_name,
        position_level: agent.position_level,
        manager_id: agent.manager_id,
        manager_dbname: agent.manager_dbname,
        team_id: agent.team_id,
        team_name: agent.team_name,
        month: agent.month,
        year: agent.year,
        year_month: agent.year_month,
        submitted: submitted ? 1 : 0,
        performance: toNumber(agent.performance),
        performance_percent: performancePercent,
        performance_description: submitted ? (performanceRow?.description ?? '') : '',
        absences: toNumber(agent.absences),
        tardiness: toNumber(agent.tardiness),
        memo: toNumber(agent.memo),
        feedback_by_admin: toNumber(agent.feedback_by_admin),
        feedback_by_qa: toNumber(agent.feedback_by_qa),
        feedback_by_immediate_head: toNumber(agent.feedback_by_immediate_head),
        feedback_by_members: toNumber(agent.feedback_by_members),
    }

    // not submitted: nothing counts yet
    if (!submitted) {
        return {
            ...result,
            performance_score: 0, absence_score: 0, tardiness_score: 0, memo_score: 0, feedback_score: '0.0000',
            performance_rating: 0, absence_rating: 0, tardiness_rating: 0, memo_rating: 0, feedback_rating: 0,
            final_ratings: '0.0000', ratings_name: INCOMPLETE,
        }
    }

    const performanceScore = toNumber(performanceRow?.score)
    const absenceScore = countScore(tables.absences, agent.absences)
    const tardinessScore = countScore(tables.tardiness, agent.tardiness)
    const memoScore = countScore(tables.memo, agent.memo)
    const feedback = feedbackScore(agent)

    const performanceRating = performanceScore * toNumber(criteria.performance)
    const absenceRating = absenceScore * toNumber(criteria.absence)
    const tardinessRating = tardinessScore * toNumber(criteria.tardiness)
    const memoRating = memoScore * toNumber(criteria.memorandum_recieved)
    const feedbackRating = feedback * toNumber(criteria.feedback)
    const finalRating = performanceRating + absenceRating + tardinessRating + memoRating + feedbackRating

    return {
        ...result,
        performance_score: performanceScore,
        absence_score: absenceScore,
        tardiness_score: tardinessScore,
        memo_score: memoScore,
        feedback_score: round4(feedback),
        performance_rating: parseFloat(performanceRating.toFixed(4)),
        absence_rating: parseFloat(absenceRating.toFixed(4)),
        tardiness_rating: parseFloat(tardinessRating.toFixed(4)),
        memo_rating: parseFloat(memoRating.toFixed(4)),
        feedback_rating: parseFloat(feedbackRating.toFixed(4)),
        final_ratings: round4(finalRating),
        ratings_name: ratingName(tables.ratings, parseFloat(round4(finalRating))),
    }
}

// the tag goes to the submitted employee(s) with the top rating (like the sales leaderboard)
const addTopTag = (rows, tag) => {
    const topRating = Math.max(...rows.filter(row => row.submitted === 1).map(row => parseFloat(row.final_ratings)))
    return rows.map(row => ({
        ...row,
        tag: row.submitted === 1 && parseFloat(row.final_ratings) === topRating ? tag : '',
    }))
}

// The ranking is public, the details (metrics, scores and feedback) are not:
// admin / poweruser and the CSD managers (position level 10 and 9) see all, a team leader sees his/her team, the others only their own.
const DETAIL_FIELDS = [
    'performance', 'performance_percent', 'performance_description', 'absences', 'tardiness', 'memo',
    'feedback_by_admin', 'feedback_by_qa', 'feedback_by_immediate_head', 'feedback_by_members',
    'performance_score', 'absence_score', 'tardiness_score', 'memo_score', 'feedback_score',
    'performance_rating', 'absence_rating', 'tardiness_rating', 'memo_rating', 'feedback_rating',
]

const canSeeDetails = (user, row) => {
    if (['admin', 'poweruser'].includes(user?.role)) return true
    const level = Number(user?.position_level)
    if (level === 10 || level === 9) return true
    if (Number(row.id) === Number(user?.login_id)) return true
    return level === 8 && row.team_id != null && Number(row.team_id) === Number(user?.team_id)
}

const limitDetails = (user, row) => {
    const allowed = canSeeDetails(user, row)
    if (allowed) return { ...row, can_view_details: true }
    const publicRow = { ...row, can_view_details: false }
    DETAIL_FIELDS.forEach(field => delete publicRow[field])
    return publicRow
}

const byRatingDesc = (a, b) => parseFloat(b.final_ratings) - parseFloat(a.final_ratings)

// teams: the team leader is the highest position of the team (also when he/she is not ranked), the rating is the average of the ranked members
const groupByTeam = (allRows, rankedRows) => {
    const teams = new Map()

    for (const row of rankedRows) {
        if (!teams.has(row.team_id)) teams.set(row.team_id, { team_id: row.team_id, team_name: row.team_name, members: [] })
        teams.get(row.team_id).members.push(row)
    }

    const result = []
    for (const team of teams.values()) {
        const leader = allRows
            .filter(row => row.team_id === team.team_id)
            .sort((a, b) => Number(b.position_level) - Number(a.position_level))[0]

        const members = team.members.sort((a, b) => Number(b.position_level) - Number(a.position_level) || byRatingDesc(a, b))
        const isCompleted = members.every(member => member.submitted === 1)
        const total = members.reduce((sum, member) => sum + parseFloat(member.final_ratings), 0)

        result.push({
            team_id: team.team_id,
            team_name: team.team_name,
            team_leader_id: leader?.id,
            team_leader_name: leader?.db_name,
            team_image: leader?.image_link,
            month: members[0].month,
            year: members[0].year,
            members_count: members.length,
            isCompleted,
            final_ratings: round4(total / members.length),
            teams: members,
        })
    }
    return result
}

// The leaderboard of a month: returns { data } or { error: { status, message } }.
// Used by the page (fetchCsdLeaderboard) and by the Excel export.
// shared with the agent performance pages (csd_agent_performance_controller.js)
exports.scoring = { scoreEmployee, loadScoreTables, ratingName, toNumber, round4, INCOMPLETE }

exports.buildCsdLeaderboard = async (user, scope, yearMonth, employeeId) => {
    if (!SCOPES.includes(scope)) {
        return { error: { status: 400, message: `Unknown leaderboard scope: ${scope}. Use ${SCOPES.join(', ')}` } }
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
        return { error: { status: 400, message: 'Invalid year_month format. Expected YYYY-MM' } }
    }

    const evaluation = await generateCsdEvaluation(yearMonth, 'all', 'csd', 'all', 'all', null, user)
    const tables = await loadScoreTables()

    const ranked = evaluation
        .filter(agent => RANKED_LEVELS.includes(Number(agent.position_level)))
        .map(agent => scoreEmployee(agent, tables))

    let data
    if (scope === 'team') {
        const teams = groupByTeam(evaluation, ranked)
        const topTeamRating = Math.max(...teams.filter(team => team.isCompleted).map(team => parseFloat(team.final_ratings)))
        data = teams
            .map(team => ({
                ...team,
                ratings_name: team.isCompleted ? ratingName(tables.ratings, parseFloat(team.final_ratings)) : INCOMPLETE,
                tag: team.isCompleted && parseFloat(team.final_ratings) === topTeamRating ? 'BEST TEAM' : '',
            }))
            .sort(byRatingDesc)
    } else {
        const levels = scope === 'agent' ? AGENT_LEVELS : TEAM_LEADER_LEVELS
        const rows = ranked.filter(row => levels.includes(Number(row.position_level)))
        data = addTopTag(rows, scope === 'agent' ? 'TOP AGENT' : 'TOP TEAM LEADER').sort(byRatingDesc)
    }

    // the details of the others stay on the server
    data = data.map(row => row.teams ? { ...row, teams: row.teams.map(member => limitDetails(user, member)) } : limitDetails(user, row))

    // one employee (the performance pages of the employees use this)
    if (employeeId) {
        data = data.filter(row => String(row.id ?? row.team_leader_id) === String(employeeId))
    }

    return { data }
}

exports.fetchCsdLeaderboard = async (req, res, next) => {
    try {
        const { data, error } = await exports.buildCsdLeaderboard(
            req.user, req.params.scope || 'agent', req.query.year_month || currentYearMonth(), req.params.employee_id)

        if (error) return res.status(error.status).json({ message: error.message })

        res.status(200).json(data)

    } catch (error) {
        console.error('Error fetching the CSD leaderboard', error)
        res.status(500).json({ error: 'Database Error, Cannot Fetch CSD leaderboard' })
    }
}
