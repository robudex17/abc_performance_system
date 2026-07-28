const express = require('express')

const router = express.Router()


const {  validateMonthYear } = require('../middleware/validator')
const salesEvaluationDataController = require('../controllers/sales_evaluation_data_controller')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

// I remove the validateTarget because it is not needed for now

router.post('/sales_evaluation_data/:agent_id', authenticateToken, authorizeRoles('admin' ),  salesEvaluationDataController.addSalesEvaluationData)


router.delete('/sales_evaluation_data/:agent_id', authenticateToken, authorizeRoles('admin'), salesEvaluationDataController.deleteSalesEvaluationData)


router.get('/sales_evaluation_data', authenticateToken,authorizeRoles('admin', 'manager', 'poweruser'),validateMonthYear, salesEvaluationDataController.fetchSalesEvaluationData)


// router.put('/agent_target_shipok/:agent_id', authenticateToken, authorizeRoles('admin', 'manager'),  salesTargetShipokController.updateAgentTarget)




module.exports = router