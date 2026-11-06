// The sales dashboard: the GOM (position level 15, view only) sees every team / agent, like the admin. An agent sees only his / her own.
jest.mock('../../src/config/db')
const pool = require('../../src/config/db')
const controller = require('../../src/controllers/sales_dashboard_controller')

const call = async (user, dashboardoption) => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await controller.fetchAgentDashboard({ user, query: { dashboardoption, month: 'October', year: '2026' } }, res, jest.fn())
    return res
}

const executed = () => pool.execute.mock.calls.map(([sql]) => String(sql))

beforeEach(() => {
    pool.execute = jest.fn().mockResolvedValue([[]])
    pool.query = jest.fn().mockResolvedValue([[]])
})

describe('sales dashboard: who sees every team', () => {
    test('the GOM (level 15, employee login): the team query is not limited to one team', async () => {
        await call({ role: 'manager', login_type: 'employee', position_level: 15, login_id: 1, team_id: null }, 'team')
        expect(executed().some(sql => sql.includes('t.id=?'))).toBe(false)
        expect(executed().length).toBeGreaterThan(0)
    })

    test('an agent: the team query is limited to the team of the agent', async () => {
        await call({ role: 'agent', login_type: 'salesagentuser', agent_type: 1, position_level: 1, login_id: 5, team_id: 3 }, 'team')
        expect(executed().some(sql => sql.includes('t.id=?'))).toBe(true)
    })

    test('the admin (admin login) still sees every team', async () => {
        await call({ role: 'admin', login_type: 'standarduser', login_id: 9 }, 'team')
        expect(executed().some(sql => sql.includes('t.id=?'))).toBe(false)
    })
})
