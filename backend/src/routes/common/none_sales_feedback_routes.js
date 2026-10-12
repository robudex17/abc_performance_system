
const express = require('express')
const router = express.Router()

const noneSalesFeedbackController = require('../../controllers/common/none_sales_feedback_controller')


//for simplicity, I will  remove the validation for now, but in future we can add it back

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')


router.post('/feedback_by_nonesales/', 
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

router.delete('/feedback_by_nonesales/:id', 
             authorizeRoles('admin'),
             authenticateToken,
        
             noneSalesFeedbackController.removeNoneSalesFeedback

             )

 // enable and disable updated on the sales feedback  

router.put('/enable_disable_delete_nonesales_feedback_by_admin', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.enableDisableDeleteNoneSalesFeedback)
router.delete('/enable_disable_delete_nonesales_feedback_by_admin', authenticateToken, authorizeRoles('admin'), noneSalesFeedbackController.enableDisableDeleteNoneSalesFeedback)            