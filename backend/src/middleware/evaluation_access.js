const { isFullViewer } = require('../controllers/evaluation/department_scope')
// Who can add / change / delete the CSD evaluation data (routes/evaluation/evaluation_routes.js).
// Same rules as the CSD Evaluation page (pages/csd/csd_evaluation.vue), now also checked by the backend:
//  - performance and feedback_by_admin : the admin, or the CSD managers (position level 10 and 9)
//  - absences, tardiness and memo      : the admin only
// Without this check any logged in user (an agent for example) could save his own feedback_by_admin,
// and the feedback by the admin overrules all the other feedback of an employee.
const MANAGER_LEVELS = [10, 9]
const ADMIN_AND_MANAGERS = ['performance', 'feedback_by_admin']
const ADMIN_ONLY = ['absences', 'tardiness', 'memo']

// Who can READ the evaluation (the list has the feedback and who gave it): the admin, the poweruser, the GOM and the managers (level 10 and 9).
// The agents and the team leaders see only their own results through the leaderboard and the Agent / Team Performance pages.
exports.canReadEvaluation = (req, res, next) => {
    if (isFullViewer(req.user) || MANAGER_LEVELS.includes(Number(req.user?.position_level))) return next()
    return res.status(403).json({ message: 'Access Denied: not allowed to read the evaluation of the month' })
}

exports.canChangeEvaluation = (req, res, next) => {
    const isAdmin = req.user?.role === 'admin'
    const isCsdManager = MANAGER_LEVELS.includes(Number(req.user?.position_level))
    const evalType = req.params.eval_type

    const allowed = ADMIN_ONLY.includes(evalType)
        ? isAdmin
        : ADMIN_AND_MANAGERS.includes(evalType) && (isAdmin || isCsdManager)

    if (!allowed) {
        return res.status(403).json({ message: `Access Denied: not allowed to change ${evalType}` })
    }
    next()
}
