const express = require('express')

const router = express.Router()



const csdLeaderBoardController  = require('../../controllers/csd/csd_leaderboard_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')



router.get('/csd_leaderboard/:scope', authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)
router.get('/csd_leaderboard/:scope/:employee_id', authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)




module.exports = router