const express = require('express')

const router = express.Router()

const noneSalesAttendanceController = require('../../controllers/common/none_sales_attendance_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')
const { lockAttendanceWhenSubmitted, getLockStatus } = require('../../middleware/evaluation_lock')

// :type is absences | tardiness | memo (stored in absences2, tardiness2 and memo2)
// One record per employee per month. The details page of the employee is for the admin only.

router.get('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesAttendanceController.fetchNoneSalesAttendance)

router.post('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), lockAttendanceWhenSubmitted, noneSalesAttendanceController.addNoneSalesAttendance)

router.put('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), lockAttendanceWhenSubmitted, noneSalesAttendanceController.updateNoneSalesAttendance)

router.delete('/none_sales_attendance/:type/:employee_id', authenticateToken, authorizeRoles('admin'), lockAttendanceWhenSubmitted, noneSalesAttendanceController.deleteNoneSalesAttendance)


// is the data of the employee locked in the month (resigned or submitted)? The details page disables its buttons with it
router.get('/evaluation/lock/:employee_id', authenticateToken, authorizeRoles('admin'), getLockStatus)

module.exports = router
