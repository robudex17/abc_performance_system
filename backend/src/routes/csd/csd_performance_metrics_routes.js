const express = require('express')

const router = express.Router()



const csdPerformanceMetrics = require('../../controllers/csd/csd_performance_metrics_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')


router.post('/csd_performance_metrics/submit/:submit_type/:employee_id', authenticateToken, authorizeRoles('admin'),  csdPerformanceMetrics.submitCsdPerformanceMetrics)


router.delete('/csd_performance_metrics/review/:review_type/:employee_id', authenticateToken, authorizeRoles('admin'), csdPerformanceMetrics.reviewCsdPerformanceMetrics)


router.get('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.fetchCsdPerformanceMetrics)
router.get('/csd_performance_metrics/:metrics_type', authenticateToken,csdPerformanceMetrics.fetchCsdPerformanceMetrics)

router.post('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.addCsdPerformanceMetrics)
router.put('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.updateCsdPerformanceMetrics)
router.delete('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.deleteACsdPerformanceMetrics)



module.exports = router