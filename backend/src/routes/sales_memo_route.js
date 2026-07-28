const express = require('express')
const router = express.Router()

const salesMemoController = require('../controllers/sales_memo_controller')
const { validateMemo, validateMonthYear } = require('../middleware/validator')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

router.post('/agent_memo/:agent_id', authenticateToken, authorizeRoles('admin'), salesMemoController.createSalesAgentMemo)

router.get('/agent_memo/:agent_id', authenticateToken,  validateMonthYear,salesMemoController.fetchAgentMemo)

router.put('/agent_memo/:agent_id', authenticateToken, authorizeRoles('admin'),  salesMemoController.updateAgentMemo)

router.delete('/agent_memo/:agent_id', authenticateToken, authorizeRoles('admin'), salesMemoController.deleteAgentMemo)


module.exports = router