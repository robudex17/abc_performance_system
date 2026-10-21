// The files that the evaluation tests use, in ONE place. When a file is renamed or moved only this list changes (see the refactor plan).
// Test environment: no database is needed (the pool is mocked where a test needs data) and the S3 / DB settings are dummies.
process.env.S3_ENDPOINT = process.env.S3_ENDPOINT || '127.0.0.1'
process.env.S3_PORT = process.env.S3_PORT || '9000'
process.env.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'test'
process.env.S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'testtest'
process.env.S3_BUCKET = process.env.S3_BUCKET || 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

module.exports = {
    leaderboard: '../../src/controllers/evaluation/leaderboard_controller',
    performanceRules: '../../src/controllers/evaluation/performance_resolver',
    department: '../../src/controllers/evaluation/department_scope',
    visibility: '../../src/controllers/evaluation/visibility_rules',
    leadershipAccess: '../../src/middleware/leadership_access',
    leadershipTasks: '../../src/config/leadership_tasks',
    app: '../../src/app',
}
