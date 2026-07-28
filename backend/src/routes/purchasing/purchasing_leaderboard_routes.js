// For Testing purpose only, this route is not used in production. It is used to fetch the leaderboard data for CSD employees based on the scope and employee_id provided in the request parameters.

const express = require('express')

const router = express.Router()



const purchasingLeaderBoardController  = require('../../controllers/csd/csd_leaderboard_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')



router.get('/csd_leaderboard/:scope', authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)
router.get('/csd_leaderboard/:scope/:employee_id', authenticateToken,csdLeaderBoardController.fetchCsdLeaderboard)




module.exports = router
