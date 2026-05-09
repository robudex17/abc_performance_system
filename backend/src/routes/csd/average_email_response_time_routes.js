const express = require('express')

const router = express.Router()



const avgEmailResponseTimeController = require('../../controllers/csd/average_email_response_time_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

router.post('/agent_email_response_time/:employee_id',authenticateToken, authorizeRoles('admin'),  avgEmailResponseTimeController.addAgentEmailResponseTime)

router.get('/agent_email_response_time/:employee_id', authenticateToken , avgEmailResponseTimeController.fetchAgentEmailResponseTime)

router.put('/agent_email_response_time/:employee_id', authenticateToken, authorizeRoles('admin'),  avgEmailResponseTimeController.updateAgentEmailResponseTime)

router.delete('/agent_email_response_time/:employee_id', authenticateToken, authorizeRoles('admin'), avgEmailResponseTimeController.deleteAgentEmailResponseTime)
 
module.exports = router