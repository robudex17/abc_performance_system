const express = require('express')

const router = express.Router()

const agentPerformance = require('../../controllers/evaluation/agent_performance_controller')
const agentPerformanceExport = require('../../controllers/evaluation/agent_performance_export')
const { authenticateToken, authorizeRoles } = require('../../middleware/auth')

// Who can see which employee is decided in the controller (position level / team / role).

router.get(['/evaluation/agent_performance/monthly', '/csd_agent_performance/monthly'], authenticateToken, agentPerformance.fetchMonthly)
router.get(['/evaluation/agent_performance/monthly/:employee_id', '/csd_agent_performance/monthly/:employee_id'], authenticateToken, agentPerformance.fetchMonthly)
router.get(['/evaluation/agent_performance/yearly', '/csd_agent_performance/yearly'], authenticateToken, agentPerformance.fetchYearly)
router.get(['/evaluation/agent_performance/yearly/:employee_id', '/csd_agent_performance/yearly/:employee_id'], authenticateToken, agentPerformance.fetchYearly)

// Excel: admin and poweruser only
router.get(['/evaluation/agent_performance_export/monthly', '/csd_agent_performance_export/monthly'], authenticateToken, authorizeRoles('admin', 'poweruser'), agentPerformanceExport.exportMonthly)
router.get(['/evaluation/agent_performance_export/monthly/:employee_id', '/csd_agent_performance_export/monthly/:employee_id'], authenticateToken, authorizeRoles('admin', 'poweruser'), agentPerformanceExport.exportMonthly)
router.get(['/evaluation/agent_performance_export/yearly', '/csd_agent_performance_export/yearly'], authenticateToken, authorizeRoles('admin', 'poweruser'), agentPerformanceExport.exportYearly)
router.get(['/evaluation/agent_performance_export/yearly/:employee_id', '/csd_agent_performance_export/yearly/:employee_id'], authenticateToken, authorizeRoles('admin', 'poweruser'), agentPerformanceExport.exportYearly)

module.exports = router
