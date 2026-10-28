// The Review of the evaluation never touches a resigned employee: the submitted status stays, nothing of him/her can change.
// No database: the pool is mocked.
jest.mock('../../src/config/db')
jest.mock('../../src/controllers/evaluation/performance_resolver', () => ({
    ...jest.requireActual('../../src/controllers/evaluation/performance_resolver'),
    getReviewBlockers: jest.fn().mockResolvedValue([]),
}))

const pool = require('../../src/config/db')
const controller = require('../../src/controllers/evaluation/evaluation_controller')

const admin = { role: 'admin', position_level: 0, login_id: 1 }
const response = () => {
    const res = { statusCode: 200 }
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (body) => { res.body = body; return res }
    return res
}
const review = async (employeeId) => {
    const res = response()
    await controller.reviewCsdEvaluation({ params: { employee_id: employeeId }, query: { year_month: '2026-10', department: 'csd' }, body: {}, user: admin }, res)
    return res
}

beforeEach(() => { jest.resetAllMocks(); require('../../src/controllers/evaluation/performance_resolver').getReviewBlockers.mockResolvedValue([]) })

describe('Review of one employee', () => {
    test('a resigned employee: 409 and the submitted status is NOT deleted', async () => {
        pool.execute.mockResolvedValueOnce([[{ status: 'Resigned' }]])    // employment of the month
        const res = await review('10650')
        expect(res.statusCode).toBe(409)
        expect(res.body.message).toMatch(/resigned employee can not be reviewed/)
        expect(pool.execute).toHaveBeenCalledTimes(1)                      // only the employment was read, no DELETE
    })

    test('a hired employee is reviewed as before', async () => {
        pool.execute
            .mockResolvedValueOnce([[{ status: 'Hired' }]])
            .mockResolvedValueOnce([{ affectedRows: 1 }])                 // the DELETE of the submitted status
        const res = await review('7')
        expect(res.statusCode).toBe(200)
        expect(pool.execute.mock.calls[1][0]).toMatch(/DELETE FROM csd_evaluation_status/)
    })
})

describe('Review All', () => {
    const rows = [
        { id: 1, employee_status: 'Hired' },
        { id: 2, employee_status: 'Resigned' },
        { id: 3, employee_status: 'Rehired' },
    ]

    test('the resigned employees stay submitted: they are not in the DELETE', async () => {
        jest.spyOn(controller, 'generateCsdEvaluation').mockResolvedValue(rows)
        pool.query.mockResolvedValue([{}])
        const res = await review('all')
        expect(res.statusCode).toBe(200)
        expect(pool.query.mock.calls[0][1]).toEqual(['2026-10', [1, 3]])
        expect(res.body.resigned_skipped).toBe(1)
        expect(res.body.message).toMatch(/1 resigned employee stays submitted/)
    })

    test('nobody resigned: everybody is reviewed and there is no note', async () => {
        jest.spyOn(controller, 'generateCsdEvaluation').mockResolvedValue([{ id: 1, employee_status: 'Hired' }])
        pool.query.mockResolvedValue([{}])
        const res = await review('all')
        expect(pool.query.mock.calls[0][1]).toEqual(['2026-10', [1]])
        expect(res.body.resigned_skipped).toBe(0)
        expect(res.body.message).not.toMatch(/resigned/)
    })
})
