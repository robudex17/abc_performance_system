const express = require('express')

const router = express.Router()

const csdAgentPerformance = require('../../controllers/evaluation/agent_performance_controller')
const csdAgentPerformanceExport = require('../../controllers/evaluation/agent_performance_export')
const { authenticateToken, authorizeRoles } = require('../../middleware/auth')

// Who can see which employee is decided in the controller (position level / team / role).

router.get(['/evaluation/agent_performance/monthly', '/csd_agent_performance/monthly'], authenticateToken, csdAgentPerformance.fetchMonthly)
router.get(['/evaluation/agent_performance/monthly/:employee_id', '/csd_agent_performance/monthly/:employee_id'], authenticateToken, csdAgentPerformance.fetchMonthly)
router.get(['/evaluation/agent_performance/yearly', '/csd_agent_performance/yearly'], authenticateToken, csdAgentPerformance.fetchYearly)
router.get(['/evaluation/agent_performance/yearly/:employee_id', '/csd_agent_performance/yearly/:employee_id'], authenticateToken, csdAgentPerformance.fetchYearly)

// Excel: admin and poweruser only
router.get(['/evaluation/agent_performance_export/monthly', '/csd_agent_performance_export/monthly'], authenticateToken, authorizeRoles('admin', 'poweruser'), csdAgentPerformanceExport.exportMonthly)
router.get(['/evaluation/agent_performance_export/monthly/:employee_id', '/csd_agent_performance_export/monthly/:employee_id'], authenticateToken, authorizeRoles('admin', 'poweruser'), csdAgentPerformanceExport.exportMonthly)
router.get(['/evaluation/agent_performance_export/yearly', '/csd_agent_performance_export/yearly'], authenticateToken, authorizeRoles('admin', 'poweruser'), csdAgentPerformanceExport.exportYearly)
router.get(['/evaluation/agent_performance_export/yearly/:employee_id', '/csd_agent_performance_export/yearly/:employee_id'], authenticateToken, authorizeRoles('admin', 'poweruser'), csdAgentPerformanceExport.exportYearly)

module.exports = router
