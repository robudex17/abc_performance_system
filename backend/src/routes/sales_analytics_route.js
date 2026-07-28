const express =  require('express')

const router = express.Router()

const { validateYear } = require('../middleware/validator')

const  salesAnalyticsController = require('../controllers/sales_analytics_controller')
const { authenticateToken, authorizeRoles} = require('../middleware/auth')


router.get('/analytics/:scope', authenticateToken,validateYear, salesAnalyticsController.fetchAnalytics)

module.exports = router



