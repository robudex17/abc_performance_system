const express = require('express')

const router = express.Router()
const salesAgensController = require ('../controllers/sales_agent_controller2')
const { validateNewAndUpdateAgent } = require('../middleware/validator')
// const uploadImage = require('../middleware/fileupload')
const { upload } = require('../middleware/fileupload_to_minio') 
const { authenticateToken, authorizeRoles} = require('../middleware/auth')


router.get('/sales_agents/:agent_id',authenticateToken, authorizeRoles('admin', 'manager', 'user', 'poweruser'),salesAgensController.fetchSalesAgent)
router.get('/sales_agents', authenticateToken,authorizeRoles('admin', 'manager', 'user','poweruser'),salesAgensController.fetchSalesAgents)


router.post('/sales_agents', authenticateToken, authorizeRoles('admin'), upload.single('image'), validateNewAndUpdateAgent,salesAgensController.addNewSalesAgent  )

router.delete('/sales_agents/:agent_id', authenticateToken, authorizeRoles('admin'), salesAgensController.deleteSalesAgent)

router.put('/sales_agents', authenticateToken, authorizeRoles('admin'), upload.single('image'), validateNewAndUpdateAgent, salesAgensController.updateSalesAgent)



module.exports = router