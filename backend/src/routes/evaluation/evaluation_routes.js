const express = require('express')

const router = express.Router()



const evaluationController= require('../../controllers/evaluation/evaluation_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')
const { canChangeEvaluation, canReadEvaluation } = require('../../middleware/evaluation_access')
const { lockEvaluationWhenSubmitted } = require('../../middleware/evaluation_lock')


// submit / review of the month (admin only). employee_id can be 'all'.
router.post(['/evaluation/status/:employee_id', '/csd_evaluation_status/:employee_id'], authenticateToken, authorizeRoles('admin'), evaluationController.submitCsdEvaluation)
router.delete(['/evaluation/status/:employee_id', '/csd_evaluation_status/:employee_id'], authenticateToken, authorizeRoles('admin'), evaluationController.reviewCsdEvaluation)


router.get(['/evaluation/records/:eval_type/:employee_id', '/csd_evaluation/:eval_type/:employee_id'], authenticateToken, canReadEvaluation, evaluationController.fetchCsdEvaluation)
router.get(['/evaluation/records/:eval_type', '/csd_evaluation/:eval_type'], authenticateToken, canReadEvaluation, evaluationController.fetchCsdEvaluation)

router.post(['/evaluation/records/:eval_type/:employee_id', '/csd_evaluation/:eval_type/:employee_id'], authenticateToken, canChangeEvaluation, lockEvaluationWhenSubmitted, evaluationController.addCsdEvaluation)
router.put(['/evaluation/records/:eval_type/:employee_id', '/csd_evaluation/:eval_type/:employee_id'], authenticateToken, canChangeEvaluation, lockEvaluationWhenSubmitted, evaluationController.updateCsdEvaluation)
router.delete(['/evaluation/records/:eval_type/:employee_id', '/csd_evaluation/:eval_type/:employee_id'], authenticateToken, canChangeEvaluation, lockEvaluationWhenSubmitted, evaluationController.deleteCsdEvaluation)



module.exports = router