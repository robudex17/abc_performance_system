const express = require('express')
const router = express.Router()

const salesTeamController = require('../controllers/sales_teams_controller.js')
const { authenticateToken, authorizeRoles} = require('../middleware/auth')

const  {validateMonthYear} = require('../middleware/validator.js')

router.get('/teams', authenticateToken, salesTeamController.fetchTeams)
router.get('/teams/:team_id', authenticateToken, salesTeamController.fetchTeams )
router.post('/teams', authenticateToken, authorizeRoles('admin'), salesTeamController.addUpdateDeleteTeam)
router.put('/teams', authenticateToken, authorizeRoles('admin'), salesTeamController.addUpdateDeleteTeam)
router.delete('/teams', authenticateToken, authorizeRoles('admin'),salesTeamController.addUpdateDeleteTeam)


module.exports = router