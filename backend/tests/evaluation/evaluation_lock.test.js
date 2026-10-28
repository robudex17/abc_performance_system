// The lock of the details page of an employee: Absences, Tardiness, Memo (add, update, delete) and the update / delete of a received
// feedback. Resigned is checked FIRST, then submitted. No database: the pool is mocked.
jest.mock('../../src/config/db')
const pool = require('../../src/config/db')
const lock = require('../../src/middleware/evaluation_lock')

const response = () => {
    const res = { statusCode: 200 }
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (body) => { res.body = body; return res }
    return res
}

// pool.execute is called in this order: the employment of the month, then the submitted status
const resigned = () => pool.execute.mockResolvedValueOnce([[{ status: 'Resigned' }]])
const hired = () => pool.execute.mockResolvedValueOnce([[{ status: 'Hired' }]])
const submitted = () => pool.execute.mockResolvedValueOnce([[{ 1: 1 }]])
const notSubmitted = () => pool.execute.mockResolvedValueOnce([[]])

const run = async (middleware, req) => {
    const res = response()
    const next = jest.fn()
    await middleware(req, res, next)
    return { res, next }
}

beforeEach(() => { jest.resetAllMocks() })

describe('attendance (Absences, Tardiness, Memo)', () => {
    const put = { method: 'PUT', params: { type: 'absences', employee_id: '2741' }, query: {}, body: { year_month: '2026-10', count: 1 } }

    test('a resigned employee: refused, and the submitted status is not even asked (resigned is first)', async () => {
        resigned()
        const { res, next } = await run(lock.lockAttendanceWhenSubmitted, put)
        expect(res.statusCode).toBe(409)
        expect(res.body.message).toMatch(/resigned/)
        expect(next).not.toHaveBeenCalled()
        expect(pool.execute).toHaveBeenCalledTimes(1)
    })

    test('resigned AND submitted: the answer is the resigned one', async () => {
        resigned(); submitted()
        const { res } = await run(lock.lockAttendanceWhenSubmitted, put)
        expect(res.body.message).toMatch(/resigned/)
    })

    test('a submitted evaluation: update is refused', async () => {
        hired(); submitted()
        const { res, next } = await run(lock.lockAttendanceWhenSubmitted, put)
        expect(res.statusCode).toBe(409)
        expect(res.body.message).toMatch(/already submitted, click Review first/)
        expect(next).not.toHaveBeenCalled()
    })

    test('a submitted evaluation: add (POST) and delete are refused too', async () => {
        hired(); submitted()
        const post = await run(lock.lockAttendanceWhenSubmitted, { ...put, method: 'POST' })
        expect(post.res.statusCode).toBe(409)

        hired(); submitted()
        const del = await run(lock.lockAttendanceWhenSubmitted, { method: 'DELETE', params: put.params, query: { year_month: '2026-10' }, body: {} })
        expect(del.res.statusCode).toBe(409)
    })

    test('the month of a DELETE is read from the query, the month of POST / PUT from the body', async () => {
        hired(); notSubmitted()
        await run(lock.lockAttendanceWhenSubmitted, { method: 'DELETE', params: put.params, query: { year_month: '2026-08' }, body: {} })
        expect(pool.execute.mock.calls[0][1]).toEqual([2741, '2026-08', '2026-08'])

        pool.execute.mockClear()
        hired(); notSubmitted()
        await run(lock.lockAttendanceWhenSubmitted, put)
        expect(pool.execute.mock.calls[0][1]).toEqual([2741, '2026-10', '2026-10'])
    })

    test('not resigned and not submitted: the change goes on', async () => {
        hired(); notSubmitted()
        const { res, next } = await run(lock.lockAttendanceWhenSubmitted, put)
        expect(next).toHaveBeenCalledTimes(1)
        expect(res.statusCode).toBe(200)
    })

    test('no month in the request: left to the controller (it answers 400), the lock does not ask the database', async () => {
        const { next } = await run(lock.lockAttendanceWhenSubmitted, { ...put, body: {} })
        expect(next).toHaveBeenCalledTimes(1)
        expect(pool.execute).not.toHaveBeenCalled()
    })

    test('a database error is a 500, never a silent pass', async () => {
        pool.execute.mockRejectedValueOnce(new Error('down'))
        jest.spyOn(console, 'error').mockImplementation(() => {})
        const { res, next } = await run(lock.lockAttendanceWhenSubmitted, put)
        expect(res.statusCode).toBe(500)
        expect(next).not.toHaveBeenCalled()
    })
})

describe('feedback received by the employee (can_update and delete)', () => {
    const body = { who_give_feedback_id: 5, who_receive_feedback_id: 2741, year_month: '2026-10', feedback_type: 'by_member' }

    test('the receiver is the employee that is checked', async () => {
        hired(); notSubmitted()
        await run(lock.lockFeedbackWhenSubmitted, { method: 'DELETE', params: {}, query: {}, body })
        expect(pool.execute.mock.calls[0][1]).toEqual([2741, '2026-10', '2026-10'])
    })

    test('submitted: refused', async () => {
        hired(); submitted()
        const { res, next } = await run(lock.lockFeedbackWhenSubmitted, { method: 'PUT', params: {}, query: {}, body })
        expect(res.statusCode).toBe(409)
        expect(next).not.toHaveBeenCalled()
    })

    test('resigned: refused first', async () => {
        resigned()
        const { res } = await run(lock.lockFeedbackWhenSubmitted, { method: 'PUT', params: {}, query: {}, body })
        expect(res.body.message).toMatch(/resigned/)
        expect(pool.execute).toHaveBeenCalledTimes(1)
    })
})

describe('the evaluation records keep their rules (the current month when no month is given)', () => {
    test('no month: the current month is checked', async () => {
        hired(); submitted()
        const { res } = await run(lock.lockEvaluationWhenSubmitted, { method: 'PUT', params: { eval_type: 'absences', employee_id: '7' }, query: {}, body: {} })
        const now = new Date()
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        expect(pool.execute.mock.calls[0][1]).toEqual([7, month, month])
        expect(res.statusCode).toBe(409)
    })
})

describe('GET /evaluation/lock/:employee_id', () => {
    const ask = async (query = { year_month: '2026-10' }) => {
        const res = response()
        await lock.getLockStatus({ params: { employee_id: '2741' }, query }, res)
        return res
    }

    test('free', async () => {
        hired(); notSubmitted()
        expect((await ask()).body).toEqual({ locked: false, reason: null, message: '' })
    })

    test('submitted', async () => {
        hired(); submitted()
        const res = await ask()
        expect(res.body.locked).toBe(true)
        expect(res.body.reason).toBe('submitted')
    })

    test('resigned comes first', async () => {
        resigned()
        expect((await ask()).body.reason).toBe('resigned')
    })

    test('a bad month is a 400', async () => {
        expect((await ask({ year_month: '2026-13' })).statusCode).toBe(400)
    })
})

// the routes really use the lock (an edit of the route file must not drop it)
describe('the routes of the details page use the lock', () => {
    const fs = require('fs')
    const path = require('path')
    const routes = (file) => fs.readFileSync(path.join(__dirname, '../../src/routes/common', file), 'utf8').split('\n')

    test.each(['post', 'put', 'delete'])('none_sales_attendance %s', (method) => {
        const line = routes('none_sales_attendance_routes.js').find(text => text.startsWith(`router.${method}('/none_sales_attendance/`))
        expect(line).toContain('lockAttendanceWhenSubmitted')
        // after the admin check, before the controller
        expect(line.indexOf('authorizeRoles')).toBeLessThan(line.indexOf('lockAttendanceWhenSubmitted'))
    })

    test.each(['put', 'delete'])('enable_disable_delete_nonesales_feedback_by_admin %s', (method) => {
        const line = routes('none_sales_feedback_routes.js').find(text => text.startsWith(`router.${method}('/enable_disable_delete_nonesales_feedback_by_admin'`))
        expect(line).toContain('lockFeedbackWhenSubmitted')
    })

    test('reading the attendance is not locked', () => {
        const line = routes('none_sales_attendance_routes.js').find(text => text.startsWith("router.get('/none_sales_attendance/"))
        expect(line).not.toContain('lock')
    })
})
