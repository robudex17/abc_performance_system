const express = require('express')

const router = express.Router()

const teamPerformance = require('../../controllers/evaluation/team_performance_controller')
const { authenticateToken } = require('../../middleware/auth')

// Which teams / members the user may see is decided in the controller (position level / team / role).
// Like the sales team pages there is no Excel export.

router.get(['/evaluation/team_performance/monthly', '/csd_team_performance/monthly'], authenticateToken, teamPerformance.fetchMonthly)
router.get(['/evaluation/team_performance/monthly/:team_id', '/csd_team_performance/monthly/:team_id'], authenticateToken, teamPerformance.fetchMonthly)
router.get(['/evaluation/team_performance/yearly', '/csd_team_performance/yearly'], authenticateToken, teamPerformance.fetchYearly)
router.get(['/evaluation/team_performance/yearly/:team_id', '/csd_team_performance/yearly/:team_id'], authenticateToken, teamPerformance.fetchYearly)

module.exports = router
