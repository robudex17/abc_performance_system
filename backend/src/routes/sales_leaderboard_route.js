const express = require('express')

const router = express.Router()

const { validateMonthYear } = require('../middleware/validator')

const salesLeaderboardController = require('../controllers/sales_leaderboard_controllers')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

router.get('/sales_leaderboard/:leaderboardOption', authenticateToken,validateMonthYear, salesLeaderboardController.fetchAgentLeaderBoard)  //Need For Perfomance of all agents

router.get('/sales_leaderboard', authenticateToken,validateMonthYear, salesLeaderboardController.fetchAgentLeaderBoard)




module.exports = router