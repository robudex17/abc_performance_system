const express = require('express')

const router = express.Router()

const qaFeedbackController = require('../../controllers/evaluation/qa_feedback_controller')
const { authenticateToken } = require('../../middleware/auth')
const { onlyQaStaff } = require('../../middleware/qa_access')
const { lockEvaluationWhenSubmitted } = require('../../middleware/evaluation_lock')

// QA feedback (a score, no questionnaire) of the CSD staff of position level 8 and below.
// Only the CSD & Collections Quality Analyst / Trainer can see and change it: not the admin, not the other managers.

router.get(['/evaluation/qa_feedback', '/csd_qa_feedback'], authenticateToken, onlyQaStaff, qaFeedbackController.fetchQaFeedbackStaff)

router.post(['/evaluation/qa_feedback/:employee_id', '/csd_qa_feedback/:employee_id'], authenticateToken, onlyQaStaff, lockEvaluationWhenSubmitted, qaFeedbackController.addQaFeedback)
router.put(['/evaluation/qa_feedback/:employee_id', '/csd_qa_feedback/:employee_id'], authenticateToken, onlyQaStaff, lockEvaluationWhenSubmitted, qaFeedbackController.updateQaFeedback)
router.delete(['/evaluation/qa_feedback/:employee_id', '/csd_qa_feedback/:employee_id'], authenticateToken, onlyQaStaff, lockEvaluationWhenSubmitted, qaFeedbackController.deleteQaFeedback)

module.exports = router
