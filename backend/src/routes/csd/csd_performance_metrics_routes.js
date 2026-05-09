const express = require('express')

const router = express.Router()



const csdPerformanceMetrics = require('../../controllers/csd/csd_performance_metrics_controller')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')


router.get('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.fetchCsdPerfomanceMetrics)
router.get('/csd_performance_metrics/:metrics_type', authenticateToken,csdPerformanceMetrics.fetchCsdPerfomanceMetrics)

router.post('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.addCsdPerfomanceMetrics)
router.put('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.updateCsdPerfomanceMetrics)
router.delete('/csd_performance_metrics/:metrics_type/:employee_id', authenticateToken,csdPerformanceMetrics.deleteACsdPerfomanceMetrics)


module.exports = router