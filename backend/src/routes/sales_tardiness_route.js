const express = require('express')

const router = express.Router()

const { validateTardiness, validateMonthYear } = require('../middleware/validator')

const salesTardinessController = require('../controllers/sales_tardiness_controller')
const { authenticateToken, authorizeRoles} = require('../middleware/auth')

router.post('/agent_tardiness/:agent_id',authenticateToken, authorizeRoles('admin'),  salesTardinessController.recordNewTardiness)

router.get('/agent_tardiness/:agent_id', authenticateToken,validateMonthYear,salesTardinessController.fetchAgentTardiness)

router.put('/agent_tardiness/:agent_id', authenticateToken, authorizeRoles('admin'),  salesTardinessController.updateAgentTardiness)

router.delete('/agent_tardiness/:agent_id', authenticateToken, authorizeRoles('admin'), salesTardinessController.deleteAgentTardiness)

module.exports = router