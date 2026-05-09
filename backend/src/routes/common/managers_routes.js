const express = require('express')
const router = express.Router()

const managerController = require('../../controllers/common/managers_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

router.get('/managers/:department_code', authenticateToken, managerController.fetchManager)



module.exports = router