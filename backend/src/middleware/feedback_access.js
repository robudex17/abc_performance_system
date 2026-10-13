// Access rules of the none-sales feedback (feedback_by_members / feedback_by_heads).
// The answers of a feedback are confidential, whatever the position level or the department is:
//  - only the giver (who_give_feedback_id) can give or change a feedback. Nobody else, admin and poweruser included.
//  - the giver can read it. Admin and poweruser can read it too, to VIEW it only.
// Put these middlewares after authenticateToken in the routes (see routes/common/none_sales_feedback_routes.js).
// The frontend has the same rules in middleware/feedback_by_nonesales.js, but only this one cannot be bypassed.

const VIEWER_ROLES = ['admin', 'poweruser']

const isTheGiver = (req, who_give_feedback_id) =>
    Number(who_give_feedback_id) === Number(req.user?.login_id)

// POST / PUT: the body says who gives the feedback
exports.onlyTheGiverCanWrite = (req, res, next) => {
    if (!isTheGiver(req, req.body?.who_give_feedback_id)) {
        return res.status(403).json({ error: 'You are not allowed to give or update feedback on behalf of another user' })
    }
    next()
}

// GET: the query says whose feedback it is (the logged in user when it is not given)
exports.giverOrViewerCanRead = (req, res, next) => {
    const who_give_feedback_id = req.query.who_give_feedback_id || req.user?.login_id

    if (!isTheGiver(req, who_give_feedback_id) && !VIEWER_ROLES.includes(req.user?.role)) {
        return res.status(403).json({ error: 'You are not allowed to view the feedback of other users' })
    }
    next()
}
