const express = require('express')

const router = express.Router()

const agentPerformance = require('../../controllers/evaluation/agent_performance_controller')
const agentPerformanceExport = require('../../controllers/evaluation/agent_performance_export')
const customRange = require('../../controllers/evaluation/custom_range_controller')
const customRangeExport = require('../../controllers/evaluation/custom_range_export')
const { canUseCustomRange } = require('../../middleware/evaluation_access')
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

// Custom Range: the average of the submitted months between two months chosen by the user (admin, poweruser, GOM)
router.get('/evaluation/custom_range', authenticateToken, canUseCustomRange, customRange.fetchCustomRange)
router.get('/evaluation/custom_range/:employee_id', authenticateToken, canUseCustomRange, customRange.fetchCustomRange)
router.get('/evaluation/custom_range_export', authenticateToken, canUseCustomRange, customRangeExport.exportCustomRange)
router.get('/evaluation/custom_range_export/:employee_id', authenticateToken, canUseCustomRange, customRangeExport.exportCustomRange)

module.exports = router
