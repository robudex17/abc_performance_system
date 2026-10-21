// A smoke test of the routes: every route of the evaluation is mounted and protected (no token = 401). No database is used.
const request = require('supertest')
const paths = require('./paths')
const app = require(paths.app)
const jwt = require('jsonwebtoken')

const tokenOf = (user) => jwt.sign(user, process.env.JWT_SECRET)
const AGENT = tokenOf({ role: 'user', login_id: 8, position_level: 3, department_code: 'csd' })
const ADMIN = tokenOf({ role: 'admin', login_id: 1 })

// [method, the address, the old address that still answers until nothing calls it]
const EVALUATION = [
    ['get', '/evaluation/records/all', '/csd_evaluation/all'],
    ['post', '/evaluation/status/all', '/csd_evaluation_status/all'],
    ['get', '/evaluation/leaderboard/agent', '/csd_leaderboard/agent'],
    ['get', '/evaluation/leaderboard_export/agent', '/csd_leaderboard_export/agent'],
    ['get', '/evaluation/agent_performance/monthly', '/csd_agent_performance/monthly'],
    ['get', '/evaluation/agent_performance/yearly', '/csd_agent_performance/yearly'],
    ['get', '/evaluation/agent_performance_export/monthly', '/csd_agent_performance_export/monthly'],
    ['get', '/evaluation/team_performance/monthly', '/csd_team_performance/monthly'],
    ['get', '/evaluation/qa_feedback', '/csd_qa_feedback'],
]
const OTHERS = [
    ['get', '/leadership_evaluations'],
    ['get', '/leadership_evaluations/tasks'],
    ['get', '/departments'],
    ['get', '/prod/managers/csd'],
    ['post', '/admin_users'],
    ['post', '/admin_users_register'],
]
const PROTECTED = [
    ...EVALUATION.flatMap(([method, url, legacy]) => [[method, '/api' + url], [method, '/api' + legacy]]),
    ...OTHERS.map(([method, url]) => [method, '/api' + url]),
]

describe('the routes of the evaluation', () => {
    test.each(PROTECTED)('%s %s needs a token', async (method, url) => {
        const response = await request(app)[method](url)
        expect(response.statusCode).toBe(401)
    })

    test('the evaluation list is not for the agents (it has the feedback and who gave it)', async () => {
        const response = await request(app).get('/api/evaluation/records/all').set('Authorization', 'Bearer ' + AGENT)
        expect(response.statusCode).toBe(403)
    })

    test('the list of the admin users is for the admin only', async () => {
        expect((await request(app).get('/api/admin_users')).statusCode).toBe(401)
        expect((await request(app).get('/api/admin_users').set('Authorization', 'Bearer ' + AGENT)).statusCode).toBe(403)
    })

    test('the logout needs the token', async () => {
        expect((await request(app).post('/api/admin_users_logout')).statusCode).toBe(401)
        expect((await request(app).post('/api/employee_logout')).statusCode).toBe(401)
    })

    test('the employees list refuses a status that is not a real one (no SQL is built from it)', async () => {
        const response = await request(app).get("/api/employees/csd").query({ employee_status: "Hired' OR '1'='1" }).set('Authorization', 'Bearer ' + ADMIN)
        expect(response.statusCode).toBe(400)
    })

    test('the app answers on /api/ping', async () => {
        const response = await request(app).get('/api/ping')
        expect(response.statusCode).toBe(200)
    })
})
