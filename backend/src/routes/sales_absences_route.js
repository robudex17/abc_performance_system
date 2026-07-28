const express = require('express')
const router = express.Router()
const salesAbsencesController = require('../controllers/sales_absences_controller')

const { validateAbsence,validateMonthYear } = require('../middleware/validator')
const { authenticateToken, authorizeRoles} = require('../middleware/auth')
//encode absent


router.get('/agent_absent/:agent_id', authenticateToken,validateMonthYear,salesAbsencesController.fetchAgentAbsent)

router.delete('/agent_absent/:agent_id', authenticateToken, authorizeRoles('admin'),salesAbsencesController.deleteAgentAbsent)

router.put('/agent_absent/:agent_id', authenticateToken, authorizeRoles('admin'), salesAbsencesController.updateAgentAbsent)

router.post('/agent_absent/:agent_id', authenticateToken, authorizeRoles('admin'),  salesAbsencesController.recordNewAbsent)



module.exports = router