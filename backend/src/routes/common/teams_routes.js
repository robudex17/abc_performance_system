const express = require('express')
const router = express.Router()

const teamController = require('../../controllers/common/teams_controller.js')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')
const  {validateMonthYear} = require('../../middleware/validator.js')

router.get('/teams/:department_code/:team_id', authenticateToken, teamController.fetchTeams)
router.get('/teams/:department_code/', authenticateToken, teamController.fetchTeams)
router.get('/teams', authenticateToken, teamController.fetchTeams)
router.post('/teams', authenticateToken, authorizeRoles('admin'), teamController.addUpdateDeleteTeam)
router.put('/teams', authenticateToken, authorizeRoles('admin'), teamController.addUpdateDeleteTeam)
router.delete('/teams', authenticateToken, authorizeRoles('admin'), teamController.addUpdateDeleteTeam)


module.exports = router