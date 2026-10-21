// Who sees which rows and details of the evaluation pages (visibility_rules.js). No database.
const paths = require('./paths')
const { canSee, canSeeDetails, canViewTeams } = require(paths.visibility)

const ADMIN = { role: 'admin', login_id: 1 }
const GOM = { role: 'manager', login_id: 2, position_level: 15 }
const MANAGER = { role: 'manager', login_id: 3, position_level: 10 }
const ASSISTANT_MANAGER = { role: 'manager', login_id: 4, position_level: 9 }
const TEAM_LEADER = { role: 'user', login_id: 5, position_level: 8 }
const ASSISTANT_TL = { role: 'user', login_id: 6, position_level: 7 }
const AGENT = { role: 'user', login_id: 7, position_level: 3 }

const TEAM = 100
const OTHER_TEAM = 200
const row = (id, position_level, team_id) => ({ id, position_level, team_id })

const OWN_TEAM_AGENT = row(30, 1, TEAM)
const OTHER_TEAM_AGENT = row(31, 1, OTHER_TEAM)
const A_LEVEL_9 = row(32, 9, null)
const A_LEVEL_10 = row(33, 10, null)

describe('canSee (the rows of the lists)', () => {
    test.each([
        ['admin', ADMIN, [true, true, true, true]],
        ['GOM', GOM, [true, true, true, true]],
        ['manager (10)', MANAGER, [true, true, true, true]],
        ['assistant manager (9)', ASSISTANT_MANAGER, [true, true, true, false]],     // not the level 10
        ['team leader (8)', TEAM_LEADER, [true, false, false, false]],               // only the own team
        ['assistant team leader (7)', ASSISTANT_TL, [true, false, false, false]],
        ['agent', AGENT, [false, false, false, false]],
    ])('%s', (name, user, [ownTeam, otherTeam, level9, level10]) => {
        const teamOfUser = TEAM
        expect(canSee(user, OWN_TEAM_AGENT, teamOfUser)).toBe(ownTeam)
        expect(canSee(user, OTHER_TEAM_AGENT, teamOfUser)).toBe(otherTeam)
        expect(canSee(user, A_LEVEL_9, teamOfUser)).toBe(level9)
        expect(canSee(user, A_LEVEL_10, teamOfUser)).toBe(level10)
    })

    test('everybody sees himself / herself', () => {
        for (const user of [TEAM_LEADER, ASSISTANT_TL, AGENT]) {
            expect(canSee(user, row(user.login_id, user.position_level, null), null)).toBe(true)
        }
    })

    test('a team leader without a team sees nobody else (no row has a team to compare)', () => {
        expect(canSee(TEAM_LEADER, OWN_TEAM_AGENT, null)).toBe(false)
    })
})

describe('canSeeDetails (the metrics and the feedback)', () => {
    test('the managers (10, 9), the GOM and the admin see the details of everybody', () => {
        for (const user of [ADMIN, GOM, MANAGER, ASSISTANT_MANAGER]) {
            expect(canSeeDetails(user, OTHER_TEAM_AGENT, TEAM)).toBe(true)
            expect(canSeeDetails(user, A_LEVEL_10, TEAM)).toBe(true)
        }
    })

    test('a team leader sees the details of the own team, an agent only his / her own', () => {
        expect(canSeeDetails(TEAM_LEADER, OWN_TEAM_AGENT, TEAM)).toBe(true)
        expect(canSeeDetails(TEAM_LEADER, OTHER_TEAM_AGENT, TEAM)).toBe(false)
        expect(canSeeDetails(AGENT, row(AGENT.login_id, 3, TEAM), TEAM)).toBe(true)
        expect(canSeeDetails(AGENT, OWN_TEAM_AGENT, TEAM)).toBe(false)
    })
})

describe('canViewTeams (the Team Performance pages)', () => {
    test('the admin, poweruser, GOM and the leaders of level 7 and above', () => {
        for (const user of [ADMIN, { role: 'poweruser', login_id: 9 }, GOM, MANAGER, ASSISTANT_MANAGER, TEAM_LEADER, ASSISTANT_TL]) {
            expect(canViewTeams(user)).toBe(true)
        }
    })

    test('not the agents', () => {
        expect(canViewTeams(AGENT)).toBe(false)
    })
})
