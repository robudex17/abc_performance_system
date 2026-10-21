const express = require('express')

const router = express.Router()

const csdTeamPerformance = require('../../controllers/evaluation/team_performance_controller')
const { authenticateToken } = require('../../middleware/auth')

// Which teams / members the user may see is decided in the controller (position level / team / role).
// Like the sales team pages there is no Excel export.

router.get('/csd_team_performance/monthly', authenticateToken, csdTeamPerformance.fetchMonthly)
router.get('/csd_team_performance/monthly/:team_id', authenticateToken, csdTeamPerformance.fetchMonthly)
router.get('/csd_team_performance/yearly', authenticateToken, csdTeamPerformance.fetchYearly)
router.get('/csd_team_performance/yearly/:team_id', authenticateToken, csdTeamPerformance.fetchYearly)

module.exports = router
