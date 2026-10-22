// The Custom Range: the months of the range, the filter, and the average of the submitted months only. No database: the months are mocked.
jest.mock('../../src/controllers/evaluation/agent_performance_controller', () => {
    const actual = jest.requireActual('../../src/controllers/evaluation/agent_performance_controller')
    return { ...actual, shared: { ...actual.shared, buildMonth: jest.fn() } }
})

const paths = require('./paths')
const { monthsBetween, readRange, readStatusFilter } = require(paths.monthRange)

// the score tables are not read from the database
const { scoring } = require(paths.leaderboard)
scoring.loadScoreTables = async () => ({
    ratings: [
        { min_value: 5, ratings_name: 'EXCEPTIONAL' },
        { min_value: 4, ratings_name: 'VERY SATISFACTORY' },
        { min_value: 3, ratings_name: 'SATISFACTORY' },
        { min_value: 0, ratings_name: 'POOR' },
    ],
})

const agentPerformance = require('../../src/controllers/evaluation/agent_performance_controller')
const customRange = require(paths.customRange)

describe('the months of the range', () => {
    test('from the start to the end month, the year can change', () => {
        expect(monthsBetween('2025-11', '2026-04')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'])
        expect(monthsBetween('2026-05', '2026-10')).toHaveLength(6)
        expect(monthsBetween('2026-03', '2026-03')).toEqual(['2026-03'])
    })

    test('a wrong range has no months', () => {
        expect(monthsBetween('2026-04', '2026-03')).toEqual([])
        expect(monthsBetween('2026-4', '2026-05')).toEqual([])
    })
})

describe('the validation of the range (the answer is a message, never a hang)', () => {
    const TODAY = '2026-10'

    test('a good range', () => {
        expect(readRange('2025-11', '2026-04', TODAY).months).toHaveLength(6)
        expect(readRange('2026-01', '2026-10', TODAY).months).toHaveLength(10)
    })

    test.each([
        [undefined, '2026-04', 'required'],
        ['2026-04', undefined, 'required'],
        ['2026-13', '2026-14', 'Invalid'],
        ['abc', '2026-04', 'Invalid'],
        ['2026-05', '2026-04', 'cannot be after'],
        ['2026-08', '2026-11', 'beyond the current month'],
        ['2025-01', '2026-04', 'more than 12 months'],
    ])('start %s, end %s is refused (%s)', (start, end, text) => {
        const result = readRange(start, end, TODAY)
        expect(result.months).toBeUndefined()
        expect(result.error).toContain(text)
    })

    test('the employee status: all by default, hired includes the rehired', () => {
        expect(readStatusFilter(undefined).statuses).toBeNull()
        expect(readStatusFilter('all').statuses).toBeNull()
        expect(readStatusFilter('HIRED').statuses).toEqual(['Hired', 'Rehired'])
        expect(readStatusFilter('resigned').statuses).toEqual(['Resigned'])
        expect(readStatusFilter('gone').error).toContain('employee_status must be')
    })
})

// a scored row of a month (the numbers that the average reads)
const scored = (id, name, status, yearMonth, submitted, final) => ({
    id, db_name: name, employee_status: status, year_month: yearMonth, submitted,
    image_link: 'x.png', position_name: 'Agent', position_level: 1, manager_dbname: 'head', team_id: 1, team_name: 'Team',
    performance: 80, performance_score: 4, team_performance_score: 4, leadership_score: 0, leadership_required: false,
    absence_score: 5, tardiness_score: 5, memo_score: 5, feedback_score: '5.0000',
    performance_rating: 3.2, absence_rating: 0.25, tardiness_rating: 0.25, memo_rating: 0.25, feedback_rating: 0.25,
    final_ratings: String(final), absences: 0, tardiness: 0, memo: 0,
})

const MONTHS = ['2025-11', '2025-12', '2026-01']

const mockMonths = (rowsOfMonth) => {
    agentPerformance.shared.buildMonth.mockImplementation(async (user, yearMonth) => rowsOfMonth[yearMonth] ?? [])
}

describe('the average of the range: only the submitted months count', () => {
    const user = { role: 'admin', login_id: 1 }

    beforeEach(() => mockMonths({
        '2025-11': [scored(1, 'Dhen', 'Hired', '2025-11', 1, 4), scored(2, 'Resigned One', 'Resigned', '2025-11', 1, 3), scored(3, 'Nothing', 'Hired', '2025-11', 0, 0)],
        '2025-12': [scored(1, 'Dhen', 'Hired', '2025-12', 1, 5), scored(2, 'Resigned One', 'Resigned', '2025-12', 1, 3), scored(3, 'Nothing', 'Hired', '2025-12', 0, 0)],
        '2026-01': [scored(1, 'Dhen', 'Hired', '2026-01', 0, 0)],                                   // not submitted: left out of the average
    }))

    test('the average of Dhen has the 2 submitted months of the 3 of the range', async () => {
        const list = await customRange.getCustomRangeList(user, MONTHS, 'csd')
        const dhen = list.find(row => row.db_name === 'Dhen')

        expect(dhen.final_ratings).toBe('4.5000')                       // (4 + 5) / 2: January is not in it
        expect(dhen.months_submitted).toBe(2)
        expect(dhen.months_in_range).toBe(3)
        expect(dhen.submitted_months).toEqual(['2025-11', '2025-12'])
        expect(dhen.start_date).toBe('2025-11')
        expect(dhen.end_date).toBe('2026-01')
        expect(dhen.year).toBeUndefined()
        expect(dhen.ratings_name).toBe('VERY SATISFACTORY')
    })

    test('an employee without a submitted month is not listed', async () => {
        const list = await customRange.getCustomRangeList(user, MONTHS, 'csd')
        expect(list.map(row => row.db_name)).not.toContain('Nothing')
    })

    test('the list is sorted by the rating, the best first', async () => {
        const list = await customRange.getCustomRangeList(user, MONTHS, 'csd')
        expect(list.map(row => row.db_name)).toEqual(['Dhen', 'Resigned One'])
    })

    test('the employee status filter', async () => {
        const hired = await customRange.getCustomRangeList(user, MONTHS, 'csd', ['Hired', 'Rehired'])
        expect(hired.map(row => row.db_name)).toEqual(['Dhen'])

        const resigned = await customRange.getCustomRangeList(user, MONTHS, 'csd', ['Resigned'])
        expect(resigned.map(row => row.db_name)).toEqual(['Resigned One'])

        const all = await customRange.getCustomRangeList(user, MONTHS, 'csd', null)
        expect(all).toHaveLength(2)
    })

    test('one employee: the submitted months, the average and the months that are left out', async () => {
        const one = await customRange.getCustomRangeOne(user, MONTHS, 'csd', 1)
        expect(one.agentMetricsInRange.map(row => row.year_month)).toEqual(['2025-11', '2025-12'])
        expect(one.rangeAverage.final_ratings).toBe('4.5000')
        expect(one.months_left_out).toEqual(['2026-01'])
    })

    test('an employee that is not in the range, or has no submitted month, is null', async () => {
        expect(await customRange.getCustomRangeOne(user, MONTHS, 'csd', 999)).toBeNull()
        expect(await customRange.getCustomRangeOne(user, MONTHS, 'csd', 3)).toBeNull()
    })
})

describe('the request', () => {
    const res = () => ({ code: null, body: null, locals: {}, status(code) { this.code = code; return this }, json(body) { this.body = body; return this } })
    const request = (query, user = { role: 'admin', login_id: 1 }) => {
        const response = res()
        return { req: { user, query, res: response }, res: response }
    }

    test('a good request gives the months, the department and the statuses', () => {
        const { req, res: response } = request({ start_date: '2026-01', end_date: '2026-03', employee_status: 'hired', department: 'collection' })
        const read = customRange.readRequest(req, response)
        expect(read.months).toEqual(['2026-01', '2026-02', '2026-03'])
        expect(read.department).toBe('collection')
        expect(read.statuses).toEqual(['Hired', 'Rehired'])
    })

    test('a wrong range is answered with 400 and a message', () => {
        const { req, res: response } = request({ start_date: '2026-05', end_date: '2026-01' })
        expect(customRange.readRequest(req, response)).toBeNull()
        expect(response.code).toBe(400)
        expect(response.body.message).toContain('cannot be after')
    })

    test('a department that the user may not use is answered with 403', () => {
        const manager = { role: 'manager', login_id: 4, position_level: 10, department_code: 'csd', position_name: 'CSD & Collection Manager' }
        const { req, res: response } = request({ start_date: '2026-01', end_date: '2026-02', department: 'hradmin' }, manager)
        expect(customRange.readRequest(req, response)).toBeNull()
        expect(response.code).toBe(403)
    })
})
