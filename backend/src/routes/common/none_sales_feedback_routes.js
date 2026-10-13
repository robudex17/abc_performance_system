const express = require('express')
const router = express.Router()

const noneSalesFeedbackController = require('../../controllers/common/none_sales_feedback_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')
const { onlyTheGiverCanWrite, giverOrViewerCanRead } = require('../../middleware/feedback_access')

// feedback_type: by_member (member rates the immediate head) | by_head (immediate head rates the member)
//
// The answers of a feedback are confidential (middleware/feedback_access.js):
//  - only the giver (who_give_feedback_id) can add or update the feedback
//  - the giver, admin and poweruser can read it (admin and poweruser to view it only)

router.post('/feedback_by_nonesales',
            authenticateToken,
            onlyTheGiverCanWrite,
            noneSalesFeedbackController.addNoneSalesFeedback
          )

router.get('/feedback_by_nonesales/:id',
           authenticateToken,
           giverOrViewerCanRead,
           noneSalesFeedbackController.getNoneSalesFeedback
          )

router.put('/feedback_by_nonesales',
           authenticateToken,
           onlyTheGiverCanWrite,
           noneSalesFeedbackController.updateNoneSalesFeedback
          )

// the feedback an employee received in a month, with the scores only (details page, admin only)
router.get('/feedback_by_nonesales_summary/:employee_id', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.getNoneSalesFeedbackSummary)

// enable / disable the update of a submitted feedback, or delete it (admin only)
router.put('/enable_disable_delete_nonesales_feedback_by_admin', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.enableDisableDeleteNoneSalesFeedback)
router.delete('/enable_disable_delete_nonesales_feedback_by_admin', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.enableDisableDeleteNoneSalesFeedback)

module.exports = router
