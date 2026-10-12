const express = require('express')

const router = express.Router()

const noneSalesAttendanceController = require('../../controllers/common/none_sales_attendance_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

// :type is absences | tardiness | memo (stored in absences2, tardiness2 and memo2)
// One record per employee per month. The details page of the employee is for the admin only.

router.get('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesAttendanceController.fetchNoneSalesAttendance)

router.post('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesAttendanceController.addNoneSalesAttendance)

router.put('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesAttendanceController.updateNoneSalesAttendance)

router.delete('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesAttendanceController.deleteNoneSalesAttendance)


module.exports = router
