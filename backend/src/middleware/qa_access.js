// The CSD & Collections Quality Analyst / Trainer (position level 9, like the assistant managers) is the only one who
// gives the QA feedback: a score (like the feedback by admin, no questionnaire) to the CSD staff of position level 8
// and below. The position is read from the login token (position_name).
// The same name is in the frontend: frontend/config/departments.js (QA_POSITION_NAME).
const QA_POSITION_NAME = 'CSD & Collections Quality Analyst/ Trainer'

const normalize = (text) => String(text ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

const isQaStaff = (user) => normalize(user?.position_name) === normalize(QA_POSITION_NAME)

// Put it after authenticateToken in the routes
const onlyQaStaff = (req, res, next) => {
    if (!isQaStaff(req.user)) {
        return res.status(403).json({ message: 'Access Denied: only the Quality Analyst can give the QA feedback' })
    }
    next()
}

module.exports = { QA_POSITION_NAME, isQaStaff, onlyQaStaff }
