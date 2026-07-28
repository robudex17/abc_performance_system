const express = require('express')
const router = express.Router()

const salesManagerController = require('../controllers/sales_managers_controller.js')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

router.get('/managers', authenticateToken, salesManagerController.fetchManager)



module.exports = router