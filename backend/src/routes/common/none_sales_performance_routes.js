const express = require('express')
const { param, query, body } = require('express-validator')

const router = express.Router()

const noneSalesPerformanceController = require('../../controllers/common/none_sales_performance_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

const validateEmployeeId = param('employee_id').isInt({ min: 1 }).withMessage('employee_id must be a positive integer')

const validateYearMonthRequired = query('year_month')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('year_month is required and must be in YYYY-MM format')

const validateYearMonthOptional = query('year_month')
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('year_month must be in YYYY-MM format')

// performance column is decimal(5,2) -> 0.00 up to 999.99
const validatePerformance = body('performance')
    .isFloat({ min: 0, max: 999.99 }).withMessage('performance must be a number between 0 and 999.99')


router.get('/none_sales_performance/:employee_id', authenticateToken, authorizeRoles('admin', 'manager', 'user', 'poweruser'), validateEmployeeId, validateYearMonthOptional, noneSalesPerformanceController.fetchNoneSalesPerformance)

router.post('/none_sales_performance/:employee_id', authenticateToken, authorizeRoles('admin'), validateEmployeeId, validateYearMonthRequired, validatePerformance, noneSalesPerformanceController.addUpdateDeleteNoneSalesPerformance)

router.put('/none_sales_performance/:employee_id', authenticateToken, authorizeRoles('admin'), validateEmployeeId, validateYearMonthRequired, validatePerformance, noneSalesPerformanceController.addUpdateDeleteNoneSalesPerformance)

router.delete('/none_sales_performance/:employee_id', authenticateToken, authorizeRoles('admin'), validateEmployeeId, validateYearMonthRequired, noneSalesPerformanceController.addUpdateDeleteNoneSalesPerformance)


module.exports = router
