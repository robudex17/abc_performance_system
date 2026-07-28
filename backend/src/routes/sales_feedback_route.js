const express = require('express')
const router = express.Router()

const salesFeedbackController = require('../controllers/sales_feedback_controller')
const {
     validateFeedback,
     validateMonthYear, 
     validateFeedbackDate,
     validateFeedbackResponsesValues,
     validateAddAndUpdateAgentsFeedback,
     validateAddAndUpdateLmFeedback,
     validateAddAndUpdateManagerFeedback,
     validateAgentId,
     validateLmId,
     validateManagerId,
     validateAddAndUpdateAgentsFeedbackByQa,
     validateQaId

     } = require('../middleware/validator')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')



router.get('/feedback_by_admin/all',
     authenticateToken,
     authorizeRoles('admin','manager', 'user', 'poweruser'),
     validateMonthYear,
     salesFeedbackController.getAllAgentsFeedbackByQaOrByAdmin
)



router.post('/feedback_by_admin/:agent_id', authenticateToken,authorizeRoles('admin'),  salesFeedbackController.addNewFeedback)

router.get('/feedback_by_admin/:agent_id', authenticateToken, validateMonthYear,salesFeedbackController.fetchAgentFeedback)

router.put('/feedback_by_admin/:agent_id', authenticateToken,authorizeRoles('admin'),  salesFeedbackController.updateAgentFeedback)

router.delete('/feedback_by_admin/:agent_id', authenticateToken, authorizeRoles('admin'), salesFeedbackController.deleteAgentFeedback)



// enable and disable updated on the sales feedback  

router.put('/enable_disable_delete_feedback_by_admin', authenticateToken, authorizeRoles('admin'), salesFeedbackController.enableDisableDeleteAgentFeedback)
router.delete('/enable_disable_delete_feedback_by_admin', authenticateToken, authorizeRoles('admin'), salesFeedbackController.enableDisableDeleteAgentFeedback)

router.post('/feedback_by_qa',
     authenticateToken,
     authorizeRoles('admin'),
     // validateAddAndUpdateAgentsFeedbackByQa,
     // validateFeedbackDate,
     // validateMonthYear,
     salesFeedbackController.addAgentsFeedbackByQa
)

router.get('/feedback_by_qa/all',
     authenticateToken,
     authorizeRoles('admin','manager', 'user', 'poweruser'),
     validateMonthYear,
     salesFeedbackController.getAllAgentsFeedbackByQaOrByAdmin
)

router.get('/feedback_by_qa/:agent_id',
     authenticateToken,
     authorizeRoles('admin','manager', 'user','poweruser'),
     // validateAgentId,
     // validateMonthYear,
     salesFeedbackController.getAgentsFeedbackByQa
)


router.put('/feedback_by_qa',
     authenticateToken,
     authorizeRoles('admin'),
     // validateAddAndUpdateAgentsFeedbackByQa,
     // validateFeedbackDate,
     // validateMonthYear,
     salesFeedbackController.updateAgentsFeedbackByQa
)
router.delete('/feedback_by_qa',
     authenticateToken,
     authorizeRoles('admin'),
     // validateAgentId,
     // validateQaId,
     // validateFeedbackDate,
     // validateMonthYear,
     salesFeedbackController.removeAgentsFeedbackByQa
)


router.post('/feedback_by_sales/', 
              authenticateToken,
          //     validateAddAndUpdateAgentsFeedback,
          //     validateFeedbackResponsesValues,
          //     validateFeedbackDate,
              validateMonthYear,
              salesFeedbackController.addSalesFeedback
            )
router.get('/feedback_by_sales/:id',
           authenticateToken,
          //  validateAgentId,
            validateMonthYear,
           salesFeedbackController.getSalesFeedback
          )

router.put('/feedback_by_sales', 
           authenticateToken,
         
          //  validateAddAndUpdateAgentsFeedback,
          //  validateFeedbackResponsesValues,
          //  validateFeedbackDate,
            validateMonthYear,

           salesFeedbackController.updateSalesFeedback
          )

router.delete('/feedback_by_sales/:id', 
             authorizeRoles('admin'),
             authenticateToken,
        //     validateAgentId,
        //     validateLmId,
        //     validateFeedbackDate,
             validateMonthYear,
             salesFeedbackController.removeSalesFeedback
             )
//              

module.exports = router