const express = require('express')
const router = express.Router()

const noneSalesFeedbackController = require('../../controllers/common/none_sales_feedback_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

// feedback_type: by_member (member rates the immediate head) | by_head (immediate head rates the member)
// The controller makes sure that users can only give / read their own feedback.

router.post('/feedback_by_nonesales',
            authenticateToken,
            noneSalesFeedbackController.addNoneSalesFeedback
          )

router.get('/feedback_by_nonesales/:id',
           authenticateToken,
           noneSalesFeedbackController.getNoneSalesFeedback
          )

router.put('/feedback_by_nonesales',
           authenticateToken,
           noneSalesFeedbackController.updateNoneSalesFeedback
          )

// all feedback an employee gave / received in a year (details page, admin only)
router.get('/feedback_by_nonesales_summary/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.getNoneSalesFeedbackSummary)

// enable / disable the update of a submitted feedback, or delete it (admin only)
router.put('/enable_disable_delete_nonesales_feedback_by_admin', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.enableDisableDeleteNoneSalesFeedback)
router.delete('/enable_disable_delete_nonesales_feedback_by_admin', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.enableDisableDeleteNoneSalesFeedback)

module.exports = router
