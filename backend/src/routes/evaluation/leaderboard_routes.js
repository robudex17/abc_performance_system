const express = require('express')

const router = express.Router()



const csdLeaderBoardController  = require('../../controllers/evaluation/leaderboard_controller')
const csdLeaderboardExport = require('../../controllers/evaluation/leaderboard_export')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')



// Excel of the table view (agent and team_leader), admin and poweruser only
router.get(['/evaluation/leaderboard_export/:scope', '/csd_leaderboard_export/:scope'], authenticateToken, authorizeRoles('admin', 'poweruser'), csdLeaderboardExport.csdLeaderboardExportToExcel)

router.get(['/evaluation/leaderboard/:scope', '/csd_leaderboard/:scope'], authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)
router.get(['/evaluation/leaderboard/:scope/:employee_id', '/csd_leaderboard/:scope/:employee_id'], authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)




module.exports = router