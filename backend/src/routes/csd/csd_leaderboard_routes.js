const express = require('express')

const router = express.Router()



const csdLeaderBoardController  = require('../../controllers/csd/csd_leaderboard_controller')
const csdLeaderboardExport = require('../../controllers/csd/csd_leaderboard_export')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')



// Excel of the table view (agent and team_leader), admin and poweruser only
router.get('/csd_leaderboard_export/:scope', authenticateToken, authorizeRoles('admin', 'poweruser'), csdLeaderboardExport.csdLeaderboardExportToExcel)

router.get('/csd_leaderboard/:scope', authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)
router.get('/csd_leaderboard/:scope/:employee_id', authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)




module.exports = router