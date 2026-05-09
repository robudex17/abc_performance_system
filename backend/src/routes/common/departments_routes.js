const express = require('express')
const router = express.Router()

const salesTeamController = require('../../controllers/common/departments_controller.js')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')


router.get('/departments/:department_id', authenticateToken, salesTeamController.fetchDepartments )
router.get('/departments', authenticateToken, salesTeamController.fetchDepartments)
router.post('/departments', authenticateToken, authorizeRoles('admin'), salesTeamController.addUpdateDeleteDepartment)
router.put('/departments', authenticateToken, authorizeRoles('admin'), salesTeamController.addUpdateDeleteDepartment)
router.delete('/departments', authenticateToken, authorizeRoles('admin'),salesTeamController.addUpdateDeleteDepartment)


module.exports = router