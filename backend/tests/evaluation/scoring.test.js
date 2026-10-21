// The score of an employee of the evaluation (scoreEmployee): the weights, the leaders' AveScore, the rounding. No database.
const paths = require('./paths')
const { scoring } = require(paths.leaderboard)

const tables = {
    performance: [
        { min_value: 0, max_value: 59, score: 1, description: 'POOR' },
        { min_value: 60, max_value: 69, score: 2, description: 'NEEDS IMPROVEMENT' },
        { min_value: 70, max_value: 79, score: 3, description: 'SATISFACTORY' },
        { min_value: 80, max_value: 89, score: 4, description: 'VERY SATISFACTORY' },
        { min_value: 90, max_value: 100, score: 5, description: 'EXCEPTIONAL' },
    ],
    absences: [{ count: 1, score: 4 }, { count: 2, score: 3 }],
    tardiness: [{ count: 1, score: 4 }, { count: 2, score: 3 }],
    memo: [{ count: 1, score: 3 }, { count: 2, score: 1 }],
    criteria: { performance: 0.8, absence: 0.05, tardiness: 0.05, memorandum_recieved: 0.05, feedback: 0.05 },
    ratings: [
        { min_value: 5, ratings_name: 'EXCEPTIONAL' },
        { min_value: 4, ratings_name: 'VERY SATISFACTORY' },
        { min_value: 3, ratings_name: 'SATISFACTORY' },
        { min_value: 2, ratings_name: 'NEEDS IMPROVEMENT' },
        { min_value: 0, ratings_name: 'POOR' },
    ],
}

const agent = (overrides = {}) => ({
    id: 1, db_name: 'test', submitted: 1, performance: 85, absences: 0, tardiness: 0, memo: 1,
    feedback_by_admin: 5, feedback_by_qa: 0, feedback_by_immediate_head: 0, feedback_by_members: 0,
    leadership_required: false, leadership_score: 0,
    ...overrides,
})

describe('scoreEmployee', () => {
    test('an agent: performance 85% is score 4, the weights give the final rating', () => {
        const row = scoring.scoreEmployee(agent(), tables)
        expect(row.performance_score).toBe(4)
        expect(row.performance_rating).toBe(3.2)           // 4 x 0.8
        expect(row.absence_score).toBe(5)                  // 0 absences = 5 points
        expect(row.memo_score).toBe(3)
        expect(row.final_ratings).toBe('4.1000')           // 3.2 + 0.25 + 0.25 + 0.15 + 0.25
        expect(row.ratings_name).toBe('VERY SATISFACTORY')
    })

    test('a leader: the performance score is the average of the individual score and the leadership score (the Ahlie example)', () => {
        const row = scoring.scoreEmployee(agent({ leadership_required: true, leadership_score: 4.4 }), tables)
        expect(row.team_performance_score).toBe(4)
        expect(row.leadership_score).toBe(4.4)
        expect(row.performance_score).toBe(4.2)
        expect(row.performance_rating).toBe(3.36)
        expect(row.final_ratings).toBe('4.2600')
    })

    test('the average of a leader has 5 decimals, rounded up when necessary', () => {
        const row = scoring.scoreEmployee(agent({ leadership_required: true, leadership_score: 4.33333 }), tables)
        expect(row.performance_score).toBe(4.16667)        // (4 + 4.33333) / 2 = 4.166665
    })

    test('a leader without an answered leadership evaluation keeps the individual score', () => {
        const row = scoring.scoreEmployee(agent({ leadership_required: true, leadership_score: 0 }), tables)
        expect(row.performance_score).toBe(4)
    })

    test('an employee that is not submitted has nothing counted: INCOMPLETE RATING', () => {
        const row = scoring.scoreEmployee(agent({ submitted: 0 }), tables)
        expect(row.performance_score).toBe(0)
        expect(row.final_ratings).toBe('0.0000')
        expect(row.ratings_name).toBe('INCOMPLETE RATING')
    })

    test('the feedback of the admin overrules the others; without it the average of the feedback that has a value', () => {
        expect(scoring.scoreEmployee(agent({ feedback_by_admin: 4, feedback_by_qa: 5 }), tables).feedback_score).toBe('4.0000')
        const averaged = scoring.scoreEmployee(agent({ feedback_by_admin: 0, feedback_by_qa: 5, feedback_by_immediate_head: 3, feedback_by_members: 0 }), tables)
        expect(averaged.feedback_score).toBe('4.0000')     // (5 + 3) / 2, the 0 is not counted
    })

    test('the rating name follows the final rating: no gap below 5', () => {
        expect(scoring.ratingName(tables.ratings, 4.9999)).toBe('VERY SATISFACTORY')
        expect(scoring.ratingName(tables.ratings, 5)).toBe('EXCEPTIONAL')
        expect(scoring.ratingName(tables.ratings, 1.5)).toBe('POOR')
    })
})
