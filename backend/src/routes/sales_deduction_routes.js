const express = require('express')
const router = express.Router()

const salesDeductionController = require('../controllers/sales_deduction_controller')
const { validateMemo, validateMonthYear } = require('../middleware/validator')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

router.post('/agent_deduction/:agent_id', authenticateToken, authorizeRoles('admin'), salesDeductionController.createAgentDeduction)

// router.get('/agent_deduction/:agent_id', authenticateToken,  validateMonthYear,salesDeductionController.fetchAgentDeduction)

router.put('/agent_deduction/:agent_id', authenticateToken, authorizeRoles('admin'),  salesDeductionController.updateAgentDeduction)

router.delete('/agent_deduction/:agent_id', authenticateToken, authorizeRoles('admin'), salesDeductionController.deleteAgentDeduction)


module.exports = router