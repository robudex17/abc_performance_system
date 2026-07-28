const express = require('express')

const router = express.Router()



const emailResponseCountController = require('../../controllers/csd/email_responses_count_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

router.post('/agent_email_response_count/:employee_id',authenticateToken, authorizeRoles('admin'),  emailResponseCountController.addAgentEmailResponsesCount)

router.get('/agent_email_response_count/:employee_id', authenticateToken , emailResponseCountController.fetchAgentEmailResponsesCount)

router.put('/agent_email_response_count/:employee_id', authenticateToken, authorizeRoles('admin'),  emailResponseCountController.updateAgentEmailResponsesCount)

router.delete('/agent_email_response_count/:employee_id', authenticateToken, authorizeRoles('admin'), emailResponseCountController.deleteAgentEmailResponsesCount)
 
module.exports = router