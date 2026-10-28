// The BEST TEAM tag of the Team Performance pages must be the one of the leaderboard: decided among ALL the teams,
// not only among the teams the user may see (a team leader sees only his/her own team, which would always be "the best").
// No database: the evaluation and the score tables are mocked.
jest.mock('../../src/config/db')
jest.mock('../../src/controllers/evaluation/evaluation_controller', () => ({ generateCsdEvaluation: jest.fn() }))

const paths = require('./paths')
const pool = require('../../src/config/db')

// the score tables: answered by the mocked pool (the leaderboard and the team pages both read them)
const TABLES = {
    csd_performance_score: [
        { min_value: 0, max_value: 79, score: 3, description: 'SATISFACTORY' },
        { min_value: 80, max_value: 100, score: 5, description: 'EXCEPTIONAL' },
    ],
    absences_score: [], tardiness_score: [], memorandum_score: [],
    evaluation_criteria: [{ performance: 0.8, absence: 0.05, tardiness: 0.05, memorandum_recieved: 0.05, feedback: 0.05 }],
    result_ratings: [
        { min_value: 5, ratings_name: 'EXCEPTIONAL' },
        { min_value: 4, ratings_name: 'VERY SATISFACTORY' },
        { min_value: 0, ratings_name: 'POOR' },
    ],
}
pool.execute.mockImplementation(async (sql) => {
    const table = Object.keys(TABLES).find(name => sql.includes(name))
    return [TABLES[table] ?? []]
})

const { generateCsdEvaluation } = require('../../src/controllers/evaluation/evaluation_controller')
const leaderboard = require(paths.leaderboard)
const teamPerformance = require('../../src/controllers/evaluation/team_performance_controller')

const row = (id, team_id, position_level, performance, submitted = 1) => ({
    id, db_name: `emp${id}`, team_id, team_name: `Team ${team_id}`, position_level, submitted, performance,
    month: 'October', year: 2026, year_month: '2026-10', image_link: null,
    absences: 0, tardiness: 0, memo: 0, feedback_by_admin: 5,
    feedback_by_qa: 0, feedback_by_immediate_head: 0, feedback_by_members: 0, leadership_required: false, leadership_score: 0,
})

// team 1 (Ivy) is the best team, team 2 (Raymond) is lower
const evaluation = () => [
    row(10, 1, 8, 95), row(11, 1, 1, 95),
    row(20, 2, 8, 70), row(21, 2, 1, 70),
]

const raymond = { login_id: 20, position_level: 8, role: 'user', department_code: 'csd' }
const admin = { login_id: 1, position_level: 0, role: 'admin' }

beforeEach(() => { generateCsdEvaluation.mockImplementation(async () => evaluation()) })

test('the leaderboard says team 1 is the best team', async () => {
    const { data } = await leaderboard.buildCsdLeaderboard(raymond, 'team', '2026-10', null, 'csd')
    expect(data.find(team => team.tag === 'BEST TEAM').team_id).toBe(1)
})

test('a team leader of the lower team does NOT get BEST TEAM on his team performance page', async () => {
    const teams = await teamPerformance.getTeamsMonthly(raymond, '2026-10', null, 'csd')
    expect(teams).toHaveLength(1)                       // he only sees his own team ...
    expect(teams[0].team_id).toBe(2)
    expect(teams[0].tag).toBe('')                       // ... and it is not the best team of the leaderboard
})

test('the team leader of the best team gets the tag', async () => {
    const ivy = { login_id: 10, position_level: 8, role: 'user', department_code: 'csd' }
    const teams = await teamPerformance.getTeamsMonthly(ivy, '2026-10', 'me', 'csd')
    expect(teams).toHaveLength(1)
    expect(teams[0].team_id).toBe(1)
    expect(teams[0].tag).toBe('BEST TEAM')
})

test('the admin sees all the teams and exactly one BEST TEAM, the same as the leaderboard', async () => {
    const teams = await teamPerformance.getTeamsMonthly(admin, '2026-10', null, 'csd')
    expect(teams.map(team => team.team_id)).toEqual([1, 2])
    expect(teams.filter(team => team.tag === 'BEST TEAM').map(team => team.team_id)).toEqual([1])
})

test('a team that is not completed is never the best team (the leaderboard rule)', async () => {
    generateCsdEvaluation.mockImplementation(async () => [
        row(10, 1, 8, 95), row(11, 1, 1, 95, 0),         // team 1 has one member not submitted
        row(20, 2, 8, 70), row(21, 2, 1, 70),
    ])
    const teams = await teamPerformance.getTeamsMonthly(admin, '2026-10', null, 'csd')
    expect(teams.find(team => team.tag === 'BEST TEAM').team_id).toBe(2)
})
