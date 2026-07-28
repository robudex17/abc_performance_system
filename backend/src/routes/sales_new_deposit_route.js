const express = require('express')
const router = express.Router()

const salesNewDepositController = require('../controllers/sales_new_deposit_controller')
const { validateNewDeposit, validateMonthYear } = require('../middleware/validator')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

router.post('/agent_deposit/:agent_id', authenticateToken, authorizeRoles('admin', 'manager'), validateNewDeposit,validateMonthYear, salesNewDepositController.addNewDeposit )

router.get('/agent_deposit/:agent_id', authenticateToken, validateMonthYear,salesNewDepositController.fetchAgentNewDeposit )

router.put('/agent_deposit/:agent_id',authenticateToken, authorizeRoles('admin', 'manager'),  salesNewDepositController.updateAgentNewDeposit )

router.delete('/agent_deposit/:agent_id', authenticateToken, authorizeRoles('admin', 'manager'),  salesNewDepositController.deleteAgentNewDeposit )

module.exports = router