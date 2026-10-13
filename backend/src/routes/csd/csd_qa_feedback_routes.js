const express = require('express')

const router = express.Router()

const csdQaFeedbackController = require('../../controllers/csd/csd_qa_feedback_controller')
const { authenticateToken } = require('../../middleware/auth')
const { onlyQaStaff } = require('../../middleware/qa_access')
const { lockCsdEvaluationWhenSubmitted } = require('../../middleware/csd_evaluation_lock')

// QA feedback (a score, no questionnaire) of the CSD staff of position level 8 and below.
// Only the CSD & Collections Quality Analyst / Trainer can see and change it: not the admin, not the other managers.

router.get('/csd_qa_feedback', authenticateToken, onlyQaStaff, csdQaFeedbackController.fetchQaFeedbackStaff)

router.post('/csd_qa_feedback/:employee_id', authenticateToken, onlyQaStaff, lockCsdEvaluationWhenSubmitted, csdQaFeedbackController.addQaFeedback)
router.put('/csd_qa_feedback/:employee_id', authenticateToken, onlyQaStaff, lockCsdEvaluationWhenSubmitted, csdQaFeedbackController.updateQaFeedback)
router.delete('/csd_qa_feedback/:employee_id', authenticateToken, onlyQaStaff, lockCsdEvaluationWhenSubmitted, csdQaFeedbackController.deleteQaFeedback)

module.exports = router
