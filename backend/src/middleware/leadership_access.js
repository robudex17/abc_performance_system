const { isQaStaff } = require('./qa_access')
const { GOM_LEVEL, MANAGER_LEVEL } = require('../config/leadership_tasks')

// Who may use the Leadership Individual Performance (routes/csd/csd_leadership_routes.js). Put it after authenticateToken.
//   evaluators  the GOM (position level 15), the managers (10), the assistant managers (9) and the team leaders (8) who have a
//               leader to evaluate (the controller checks that the employee is a direct report). The Quality Analyst (level 9) has
//               nobody to evaluate.
//   viewers     admin and poweruser: they only VIEW an evaluation (onlyViewers), they never evaluate (onlyEvaluators).
// Every other user is denied, the answers are confidential.
const VIEWER_ROLES = ['admin', 'poweruser']
const EVALUATOR_LEVELS = [GOM_LEVEL, MANAGER_LEVEL, 9, 8]

const isViewer = (user) => VIEWER_ROLES.includes(user?.role)
const isEvaluator = (user) => !isViewer(user) && !isQaStaff(user) && EVALUATOR_LEVELS.includes(Number(user?.position_level))

const denied = (res, message) => res.status(403).json({ message: `Access Denied: ${message}` })

// the form: the evaluators and the viewers
const onlyLeadershipUsers = (req, res, next) => {
    if (isViewer(req.user) || isEvaluator(req.user)) return next()
    return denied(res, 'only the heads who evaluate the leaders, the admin and the poweruser can open the leadership evaluation')
}

// the list of my leaders, my evaluation, add, update, delete: the evaluators only (the admin and the poweruser cannot evaluate)
const onlyEvaluators = (req, res, next) => {
    if (isEvaluator(req.user)) return next()
    if (isViewer(req.user)) return denied(res, 'the admin and the poweruser can only view the leadership evaluation')
    return denied(res, 'only the heads who evaluate the leaders can use the leadership evaluation')
}

// view the evaluation that somebody gave: the admin and the poweruser only
const onlyViewers = (req, res, next) => {
    if (isViewer(req.user)) return next()
    return denied(res, 'the evaluation of another user can only be viewed by the admin and the poweruser')
}

module.exports = { onlyLeadershipUsers, onlyEvaluators, onlyViewers, isViewer }
