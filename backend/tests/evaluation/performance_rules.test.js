// Which Performance is typed or computed, the average of the subordinates, and the submit order / review lock of the CSD & Collection Manager.
// The database is mocked: the employees of the month and the submitted months are the test data.
jest.mock('../../src/config/db', () => ({ execute: jest.fn(), query: jest.fn() }))

const pool = require('../../src/config/db')
const paths = require('./paths')
const rules = require(paths.performanceRules)

const QA = 'CSD & Collections Quality Analyst/ Trainer'

// id, name, department, level, head (manager_id) and the typed Performance
const person = (id, db_name, department_code, position_level, manager_id, performance = 0, position_name = 'Position') =>
    ({ id, db_name, department_code, position_level, position_name, manager_id, performance })

const MARK = person(1, 'Mark', 'csd', 10, 1, 0, 'CSD & Collection Manager')
const DONIE = person(2, 'Donie', 'csd', 9, 1, 90)
const CINDZ = person(3, 'cindz', 'csd', 9, 1, 45, QA)
const ABEN = person(4, 'aben', 'collection', 9, 1, 80)
const AHLIE = person(5, 'Ahlie', 'csd', 8, 2, 85)          // a team leader under Donie
const DHEN = person(6, 'Dhen', 'csd', 3, 5, 90)            // an agent under Ahlie
const CHAD = person(7, 'chad', 'collection', 8, 4, 0)      // a team leader under aben
const MIKE = person(8, 'mike', 'collection', 1, 7, 70)     // an agent under chad
const KISHI = person(20, 'kishi', 'purchasing', 10, 20, 0)
const IVY = person(21, 'ivy', 'purchasing', 8, 20, 0)
const CATHY = person(22, 'Cathy', 'purchasing', 1, 21, 94)

const EVERYBODY = [MARK, DONIE, CINDZ, ABEN, AHLIE, DHEN, CHAD, MIKE, KISHI, IVY, CATHY]
const CSD_IDS = [1, 2, 3, 5, 6]
const COLLECTION_IDS = [4, 7, 8]

const mockMonth = (submittedIds = []) => {
    pool.execute.mockImplementation(async (sql) => {
        if (sql.includes('evaluation_status')) return [submittedIds.map(employee_id => ({ employee_id }))]
        if (sql.includes('FROM employees e')) return [EVERYBODY.map(employee => ({ ...employee }))]
        throw new Error('unexpected query: ' + sql.slice(0, 60))
    })
}

const YM = '2026-10'

describe('which levels are computed (the rules of the department)', () => {
    const { computedLevelsOf, RULES } = rules._internals

    test('CSD and Collection: only the manager (level 10) is computed', () => {
        expect(computedLevelsOf({ department_code: 'csd' }, YM)).toEqual([10])
        expect(computedLevelsOf({ department_code: 'collection' }, YM)).toEqual([10])
    })

    test('the other departments: levels 7, 8, 9 and 10', () => {
        expect(computedLevelsOf({ department_code: 'purchasing' }, YM)).toEqual([7, 8, 9, 10])
        expect(computedLevelsOf({ department_code: 'hradmin' }, YM)).toEqual([7, 8, 9, 10])
    })

    test('a rule from a month on does not change the months before it', () => {
        RULES.csd.push({ from: '2026-11', computedLevels: [7, 8, 9, 10] })
        try {
            expect(computedLevelsOf({ department_code: 'csd' }, '2026-10')).toEqual([10])
            expect(computedLevelsOf({ department_code: 'csd' }, '2026-11')).toEqual([7, 8, 9, 10])
            expect(computedLevelsOf({ department_code: 'csd' }, '2027-01')).toEqual([7, 8, 9, 10])
        } finally {
            RULES.csd.pop()
        }
    })
})

describe('the computed Performance', () => {
    beforeEach(() => mockMonth())

    test('Mark is the average of Donie, cindz and aben (5 decimals), the others of CSD / Collection are typed', async () => {
        const rows = [MARK, DONIE, AHLIE, ABEN].map(employee => ({ ...employee }))
        await rules.applyComputedPerformance(rows, YM)

        const mark = rows.find(row => row.id === 1)
        expect(mark.performance_computed).toBe(true)
        expect(mark.performance).toBe(71.66667)                       // (90 + 45 + 80) / 3 = 71.666666
        expect(mark.performance_sources.map(source => source.db_name).sort()).toEqual(['aben', 'cindz', 'Donie'].sort())

        for (const name of ['Donie', 'Ahlie', 'aben']) {
            expect(rows.find(row => row.db_name === name).performance_computed).toBeUndefined()
        }
    })

    test('a subordinate with a Performance of 0 is not counted in the average', async () => {
        EVERYBODY.find(employee => employee.id === 4).performance = 0       // aben has nothing yet
        try {
            const rows = [{ ...MARK }]
            await rules.applyComputedPerformance(rows, YM)
            expect(rows[0].performance).toBe(67.5)                             // (90 + 45) / 2
        } finally {
            EVERYBODY.find(employee => employee.id === 4).performance = 80
        }
    })

    test('Purchasing: the team leader is computed from the staff under her', async () => {
        const rows = [{ ...IVY }, { ...CATHY }]
        await rules.applyComputedPerformance(rows, YM)
        expect(rows[0].performance_computed).toBe(true)
        expect(rows[0].performance).toBe(94)
        expect(rows[1].performance_computed).toBeUndefined()
    })

    test('the Quality Analyst is always typed', async () => {
        const rows = [{ ...CINDZ }]
        await rules.applyComputedPerformance(rows, YM)
        expect(rows[0].performance_computed).toBeUndefined()
    })

    test('isPerformanceComputed (the lock of the typed value): Mark yes, a CSD team leader no', async () => {
        expect(await rules.isPerformanceComputed(1, YM)).toBe(true)
        expect(await rules.isPerformanceComputed(5, YM)).toBe(false)
        expect(await rules.isPerformanceComputed(21, YM)).toBe(true)
    })
})

describe('the submit order of the CSD & Collection Manager', () => {
    test('Mark alone: everybody under him, of both departments, has to be submitted first', async () => {
        mockMonth([])
        const [blocker] = await rules.getSubmitBlockers([1], YM)
        expect(blocker.employee).toBe('Mark')
        expect(blocker.waiting.length).toBe(7)                      // Donie, cindz, aben, Ahlie, Dhen, chad, mike
        expect(blocker.waiting.join(' ')).toContain('mike (collection)')
    })

    test('the Submit All of CSD: only the Collection staff that is not submitted yet blocks it', async () => {
        mockMonth([])
        const [blocker] = await rules.getSubmitBlockers(CSD_IDS, YM)
        expect(blocker.waiting.sort()).toEqual(['aben (collection)', 'chad (collection)', 'mike (collection)'])
    })

    test('with Collection submitted the Submit All of CSD is allowed', async () => {
        mockMonth(COLLECTION_IDS)
        expect(await rules.getSubmitBlockers(CSD_IDS, YM)).toEqual([])
    })

    test('Purchasing has no submit order', async () => {
        mockMonth([])
        expect(await rules.getSubmitBlockers([21], YM)).toEqual([])
    })
})

describe('the review lock', () => {
    test('while Mark is submitted nobody under him, of any level and department, can be reviewed', async () => {
        mockMonth([1])
        for (const id of [2, 3, 4, 5, 6, 7, 8]) {
            const blockers = await rules.getReviewBlockers([id], YM)
            expect(blockers).toHaveLength(1)
            expect(blockers[0].head).toBe('Mark')
        }
    })

    test('Mark can be reviewed, and the Review All of CSD works because Mark is in the batch', async () => {
        mockMonth([1])
        expect(await rules.getReviewBlockers([1], YM)).toEqual([])
        expect(await rules.getReviewBlockers(CSD_IDS, YM)).toEqual([])
    })

    test('the Review All of Collection is blocked while Mark is submitted', async () => {
        mockMonth([1])
        expect(await rules.getReviewBlockers(COLLECTION_IDS, YM)).toHaveLength(3)
    })

    test('nothing is locked when Mark is not submitted, and Purchasing is not affected', async () => {
        mockMonth([21])
        expect(await rules.getReviewBlockers([2, 4, 8], YM)).toEqual([])
        expect(await rules.getReviewBlockers([22], YM)).toEqual([])
    })

    test('the rows of the evaluation say what they wait for and who locks them', async () => {
        mockMonth([1])
        const rows = [{ id: 1 }, { id: 4 }, { id: 2 }]
        await rules.applySubmitDependencies(rows, YM)
        expect(rows[0].submit_waiting_for.map(item => item.db_name)).toEqual(expect.arrayContaining(['Ahlie', 'chad']))
        expect(rows[1].review_locked_by).toBe('Mark')
        expect(rows[2].review_locked_by).toBe('Mark')
    })
})
