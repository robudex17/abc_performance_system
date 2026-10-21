// Who may use which department, who may evaluate the leaders, and the leadership forms. No database.
const paths = require('./paths')
const department = require(paths.department)
const access = require(paths.leadershipAccess)
const { tasksFor } = require(paths.leadershipTasks)

const request = (user, department) => {
    const res = { locals: {} }
    return { user, query: department ? { department } : {}, res }
}

const ADMIN = { role: 'admin', login_id: 1 }
const POWERUSER = { role: 'poweruser', login_id: 2 }
const GOM = { role: 'poweruser', login_id: 3, position_level: 15, position_name: 'GOM' }
const CSD_MANAGER = { role: 'manager', login_id: 4, position_level: 10, department_code: 'csd', position_name: 'CSD & Collection Manager' }
const QA = { role: 'user', login_id: 5, position_level: 9, department_code: 'csd', position_name: 'CSD & Collections Quality Analyst/ Trainer' }
const HR_MANAGER = { role: 'manager', login_id: 6, position_level: 10, department_code: 'hradmin', position_name: 'HR MANAGER' }
const PURCHASING_TL = { role: 'user', login_id: 7, position_level: 8, department_code: 'purchasing', position_name: 'Purchasing Team Leader' }
const AGENT = { role: 'user', login_id: 8, position_level: 3, department_code: 'csd', position_name: 'CSD Agent' }

describe('the department of a request', () => {
    test('csd is the default, an unknown department is refused', () => {
        expect(department.readDepartment(request(ADMIN))).toBe('csd')
        expect(department.readDepartment(request(ADMIN, 'nope'))).toBeNull()
    })

    test('admin, poweruser and the GOM use every department', () => {
        for (const user of [ADMIN, POWERUSER, GOM]) {
            for (const code of ['csd', 'collection', 'purchasing', 'hradmin']) {
                expect(department.readDepartment(request(user, code))).toBe(code)
            }
        }
    })

    test('the CSD & Collection Manager and the Quality Analyst work for CSD and Collection only', () => {
        for (const user of [CSD_MANAGER, QA]) {
            expect(department.readDepartment(request(user, 'csd'))).toBe('csd')
            expect(department.readDepartment(request(user, 'collection'))).toBe('collection')
        }
        const forbidden = request(CSD_MANAGER, 'hradmin')
        expect(department.readDepartment(forbidden)).toBeNull()
        expect(forbidden.res.locals.departmentForbidden).toBe(true)
    })

    test('the others use their own department only', () => {
        expect(department.readDepartment(request(HR_MANAGER, 'hradmin'))).toBe('hradmin')
        expect(department.readDepartment(request(HR_MANAGER, 'csd'))).toBeNull()
        expect(department.readDepartment(request(PURCHASING_TL, 'csd'))).toBeNull()
    })

    test('the Purchasing Manager is not in the evaluation of Purchasing', () => {
        expect(department.isExcludedFromEvaluation('purchasing', { position_name: 'Purchasing Manager' })).toBe(true)
        expect(department.isExcludedFromEvaluation('purchasing', { position_name: 'Purchasing Team Leader' })).toBe(false)
        expect(department.isExcludedFromEvaluation('csd', { position_name: 'Purchasing Manager' })).toBe(false)
    })
})

const allowed = (middleware, user) => {
    let passed = false
    const res = { status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
    middleware({ user }, res, () => { passed = true })
    return passed ? 200 : res.code
}

describe('the leadership evaluation access', () => {
    const cases = [
        // user, form, my list / save, view of the others
        ['admin', ADMIN, 200, 403, 200],
        ['poweruser', POWERUSER, 200, 403, 200],
        ['GOM (even with the poweruser role)', GOM, 200, 200, 403],
        ['CSD & Collection Manager', CSD_MANAGER, 200, 200, 403],
        ['Purchasing team leader (level 8)', PURCHASING_TL, 200, 200, 403],
        ['Quality Analyst', QA, 403, 403, 403],
        ['agent', AGENT, 403, 403, 403],
    ]

    test.each(cases)('%s', (name, user, form, evaluate, view) => {
        expect(allowed(access.onlyLeadershipUsers, user)).toBe(form)
        expect(allowed(access.onlyEvaluators, user)).toBe(evaluate)
        expect(allowed(access.onlyViewers, user)).toBe(view)
    })
})

describe('the leadership form of the evaluated employee', () => {
    const names = (employee) => tasksFor(employee).map(task => task.task)

    test('the Quality Analyst has the 8 tasks of the QA form', () => {
        expect(tasksFor({ position_level: 9, position_name: QA.position_name })).toHaveLength(8)
    })

    test('a manager (level 10) has the 16 tasks with Staff Scheduling before Leadership Presence', () => {
        const manager = names({ position_level: 10, department_code: 'csd' })
        expect(manager).toHaveLength(16)
        expect(manager.indexOf('Staff Scheduling & Time Management')).toBe(manager.indexOf('Leadership Presence') - 1)
    })

    test('the Purchasing team leader has 16 tasks, the Purchasing assistant has 15 with Adaptability', () => {
        expect(tasksFor({ position_level: 8, department_code: 'purchasing' })).toHaveLength(16)
        const assistant = names({ position_level: 7, department_code: 'purchasing' })
        expect(assistant).toHaveLength(15)
        expect(assistant).toContain('Adaptability')
        expect(assistant).not.toContain('Strategic Thinking')
    })

    test('the other leaders have the standard 15 tasks', () => {
        for (const employee of [{ position_level: 7, department_code: 'csd' }, { position_level: 8, department_code: 'collection' }, { position_level: 9, department_code: 'csd' }]) {
            expect(tasksFor(employee)).toHaveLength(15)
        }
    })
})
