const express = require('express')

const router = express.Router()

const leadership = require('../../controllers/csd/csd_leadership_controller')
const { authenticateToken } = require('../../middleware/auth')
const { lockCsdEvaluationWhenSubmitted } = require('../../middleware/csd_evaluation_lock')
const { onlyLeadershipUsers, onlyEvaluators, onlyViewers } = require('../../middleware/leadership_access')

// Who can evaluate whom is decided in the controller (the head of the employee, or the GOM for the manager).
// Access: the evaluators (GOM, managers, assistant managers, team leaders) use the form; admin and poweruser can only VIEW an evaluation
// (the route /view); everybody else is denied (middleware/leadership_access.js).
// A month that is submitted in the CSD Evaluation, and a resigned employee, can not be changed (the lock).

router.get('/leadership_evaluations/tasks', authenticateToken, onlyLeadershipUsers, leadership.fetchTasks)
router.get('/leadership_evaluations', authenticateToken, onlyEvaluators, leadership.fetchMyEvaluatees)
// admin / poweruser: the evaluation that ?evaluator_id gave, with the employee (before /:employee_id)
router.get('/leadership_evaluations/:employee_id/view', authenticateToken, onlyViewers, leadership.viewEvaluation)
router.get('/leadership_evaluations/:employee_id', authenticateToken, onlyEvaluators, leadership.fetchEvaluation)

router.post('/leadership_evaluations/:employee_id', authenticateToken, onlyEvaluators, lockCsdEvaluationWhenSubmitted, leadership.addEvaluation)
router.put('/leadership_evaluations/:employee_id', authenticateToken, onlyEvaluators, lockCsdEvaluationWhenSubmitted, leadership.updateEvaluation)
router.delete('/leadership_evaluations/:employee_id', authenticateToken, onlyEvaluators, lockCsdEvaluationWhenSubmitted, leadership.deleteEvaluation)

module.exports = router
