const express = require('express')

const router = express.Router()

const { validateDashboardOption } = require('../middleware/validator')


const salesDashboardController = require('../controllers/sales_dashboard_controller')
const { authenticateToken, authorizeRoles} = require('../middleware/auth')

// router.get('/sales_dashboard', authenticateToken,validateMonthYear, salesDashboardController.fetchAgentDashboard)

router.get('/sales_dashboard', authenticateToken, validateDashboardOption, salesDashboardController.fetchAgentDashboard)

module.exports = router