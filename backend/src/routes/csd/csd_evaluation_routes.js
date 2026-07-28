const express = require('express')

const router = express.Router()



const csdEvaluation= require('../../controllers/csd/csd_evaluation_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')


// router.post('/csd_evaluation/submit/:submit_type/:employee_id', authenticateToken, authorizeRoles('admin'),  csdEvaluation.submitCsdEvaluation)


// router.delete('/csd_evaluation/review/:review_type/:employee_id', authenticateToken, authorizeRoles('admin'), csdEvaluation.reviewCsdEvaluation)


router.get('/csd_evaluation/:eval_type/:employee_id', authenticateToken,csdEvaluation.fetchCsdEvaluation)
router.get('/csd_evaluation/:eval_type', authenticateToken,csdEvaluation.fetchCsdEvaluation)

router.post('/csd_evaluation/:eval_type/:employee_id', authenticateToken,csdEvaluation.addCsdEvaluation)
router.put('/csd_evaluation/:eval_type/:employee_id', authenticateToken,csdEvaluation.updateCsdEvaluation)
router.delete('/csd_evaluation/:eval_type/:employee_id', authenticateToken,csdEvaluation.deleteCsdEvaluation)



module.exports = router