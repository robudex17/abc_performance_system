const express = require('express')

const router = express.Router()

const leadership = require('../../controllers/csd/csd_leadership_controller')
const { authenticateToken } = require('../../middleware/auth')
const { lockCsdEvaluationWhenSubmitted } = require('../../middleware/csd_evaluation_lock')

// Who can evaluate whom is decided in the controller (the head of the employee, or the GOM for the manager).
// A month that is submitted in the CSD Evaluation, and a resigned employee, can not be changed (the lock).

router.get('/leadership_evaluations/tasks', authenticateToken, leadership.fetchTasks)
router.get('/leadership_evaluations', authenticateToken, leadership.fetchMyEvaluatees)
router.get('/leadership_evaluations/:employee_id', authenticateToken, leadership.fetchEvaluation)

router.post('/leadership_evaluations/:employee_id', authenticateToken, lockCsdEvaluationWhenSubmitted, leadership.addEvaluation)
router.put('/leadership_evaluations/:employee_id', authenticateToken, lockCsdEvaluationWhenSubmitted, leadership.updateEvaluation)
router.delete('/leadership_evaluations/:employee_id', authenticateToken, lockCsdEvaluationWhenSubmitted, leadership.deleteEvaluation)

module.exports = router
