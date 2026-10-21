const express = require('express')

const router = express.Router()



const csdEvaluation= require('../../controllers/evaluation/evaluation_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')
const { canChangeCsdEvaluation, canReadCsdEvaluation } = require('../../middleware/evaluation_access')
const { lockCsdEvaluationWhenSubmitted } = require('../../middleware/evaluation_lock')


// submit / review of the month (admin only). employee_id can be 'all'.
router.post('/csd_evaluation_status/:employee_id', authenticateToken, authorizeRoles('admin'), csdEvaluation.submitCsdEvaluation)
router.delete('/csd_evaluation_status/:employee_id', authenticateToken, authorizeRoles('admin'), csdEvaluation.reviewCsdEvaluation)


router.get('/csd_evaluation/:eval_type/:employee_id', authenticateToken, canReadCsdEvaluation, csdEvaluation.fetchCsdEvaluation)
router.get('/csd_evaluation/:eval_type', authenticateToken, canReadCsdEvaluation, csdEvaluation.fetchCsdEvaluation)

router.post('/csd_evaluation/:eval_type/:employee_id', authenticateToken, canChangeCsdEvaluation, lockCsdEvaluationWhenSubmitted, csdEvaluation.addCsdEvaluation)
router.put('/csd_evaluation/:eval_type/:employee_id', authenticateToken, canChangeCsdEvaluation, lockCsdEvaluationWhenSubmitted, csdEvaluation.updateCsdEvaluation)
router.delete('/csd_evaluation/:eval_type/:employee_id', authenticateToken, canChangeCsdEvaluation, lockCsdEvaluationWhenSubmitted, csdEvaluation.deleteCsdEvaluation)



module.exports = router