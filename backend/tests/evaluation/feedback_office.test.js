// Feedback to a head of an office that does not receive feedback from other offices (Japan).
jest.mock('../../src/config/db')
const pool = require('../../src/config/db')
const { headCanReceiveFeedback } = require('../../src/controllers/common/feedback_office')
const { addNoneSalesFeedback } = require('../../src/controllers/common/none_sales_feedback_controller')

const PHILIPPINES = 1, JAPAN = 2
// the rows of the latest assignments the helper reads
const assignment = (employee_id, office_id, receives) => ({ employee_id, office_id, receives })

const response = () => {
    const res = { statusCode: 200 }
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (body) => { res.body = body; return res }
    return res
}

beforeEach(() => { jest.resetAllMocks() })

describe('headCanReceiveFeedback', () => {
    test('a head of the same office receives it', async () => {
        pool.execute.mockResolvedValueOnce([[assignment(5, PHILIPPINES, 1), assignment(6, PHILIPPINES, 1)]])
        expect(await headCanReceiveFeedback(5, 6)).toBe(true)
    })

    test('a head of the Japan office does not receive the feedback of a Philippines member', async () => {
        pool.execute.mockResolvedValueOnce([[assignment(21, PHILIPPINES, 1), assignment(20, JAPAN, 0)]])
        expect(await headCanReceiveFeedback(21, 20)).toBe(false)
    })

    test('two employees of the Japan office can rate each other', async () => {
        pool.execute.mockResolvedValueOnce([[assignment(30, JAPAN, 0), assignment(20, JAPAN, 0)]])
        expect(await headCanReceiveFeedback(30, 20)).toBe(true)
    })

    test('an office that receives from the others (receives = 1) is allowed', async () => {
        pool.execute.mockResolvedValueOnce([[assignment(21, PHILIPPINES, 1), assignment(20, JAPAN, 1)]])
        expect(await headCanReceiveFeedback(21, 20)).toBe(true)
    })

    test('the migration is not run yet: nothing is blocked', async () => {
        pool.execute.mockRejectedValueOnce(Object.assign(new Error('no table'), { code: 'ER_NO_SUCH_TABLE' }))
        expect(await headCanReceiveFeedback(21, 20)).toBe(true)
    })

    test('another database error is not hidden', async () => {
        pool.execute.mockRejectedValueOnce(Object.assign(new Error('down'), { code: 'ECONNREFUSED' }))
        await expect(headCanReceiveFeedback(21, 20)).rejects.toThrow('down')
    })
})

describe('giving a feedback', () => {
    const body = (feedback_type) => ({
        who_give_feedback_id: 21, who_receive_feedback_id: 20, responses: [], feedback_score: 4, total_score: 4, percentage: 80,
        date: '2026-10-01', year_month: '2026-10', feedback_type,
    })

    test('a member cannot rate a head of the Japan office', async () => {
        pool.execute
            .mockResolvedValueOnce([[{ manager_id: 20 }]])                                      // isRelatedToTheGiver
            .mockResolvedValueOnce([[assignment(21, PHILIPPINES, 1), assignment(20, JAPAN, 0)]]) // office check
        const res = response()
        await addNoneSalesFeedback({ body: body('by_member') }, res)
        expect(res.statusCode).toBe(403)
        expect(res.body.error).toMatch(/office/)
        expect(pool.execute).toHaveBeenCalledTimes(2) // nothing was inserted
    })

    test('the head still rates his/her members (by_head has no office check)', async () => {
        pool.execute
            .mockResolvedValueOnce([[{ manager_id: 21 }]])                          // isRelatedToTheGiver (the member 20 has the head 21)
            .mockResolvedValueOnce([[{ id: 21, db_name: 'a' }, { id: 20, db_name: 'b' }]])
            .mockResolvedValueOnce([[]])                                            // no feedback yet
            .mockResolvedValueOnce([{}])                                            // insert
        const res = response()
        await addNoneSalesFeedback({ body: { ...body('by_head'), who_give_feedback_id: 21, who_receive_feedback_id: 20 } }, res)
        expect(res.statusCode).toBe(201)
    })
})
