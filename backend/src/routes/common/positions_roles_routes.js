const express = require('express')
const router = express.Router()

const positionRolesController = require('../../controllers/common/positions_roles_controller.js')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth.js')
const  {validateMonthYear} = require('../../middleware/validator.js')


router.get('/positions/:position_id', authenticateToken, positionRolesController.fetchPositionsRoles)
router.get('/positions', authenticateToken, positionRolesController.fetchPositionsRoles)
router.post('/positions', authenticateToken, authorizeRoles('admin'), positionRolesController.addUpdateDeletePositionRoles)
router.put('/positions', authenticateToken, authorizeRoles('admin'), positionRolesController.addUpdateDeletePositionRoles)
router.delete('/positions', authenticateToken, authorizeRoles('admin'), positionRolesController.addUpdateDeletePositionRoles)


router.get('/roles/:position_id', authenticateToken, positionRolesController.fetchPositionsRoles)
router.get('/roles', authenticateToken, positionRolesController.fetchPositionsRoles)
router.post('/roles', authenticateToken, authorizeRoles('admin'), positionRolesController.addUpdateDeletePositionRoles)
router.put('/roles', authenticateToken, authorizeRoles('admin'), positionRolesController.addUpdateDeletePositionRoles)
router.delete('/roles', authenticateToken, authorizeRoles('admin'), positionRolesController.addUpdateDeletePositionRoles)




module.exports = router