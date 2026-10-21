const express = require('express')

const router = express.Router()
const adminUserController = require ('../../controllers/system_users/admin_users_controller')
const { validateNewAndUpdateStandardUser } = require('../../middleware/validator')
// const uploadImage = require('../middleware/fileupload')
const { upload } = require('../../middleware/fileupload_to_minio')  // updated import
const { authenticateToken, authorizeRoles, allowedAdmins } = require('../../middleware/auth')


// router.get('/standardusers/:user_id', authenticateToken,salesAgensController.fetchSalesAgent)
router.get('/admin_users', adminUserController.fetchAdminUsers)


router.post('/admin_users', authenticateToken, authorizeRoles('admin'), allowedAdmins, upload.single('image'),  validateNewAndUpdateStandardUser, adminUserController.addNewAdminUser  )

router.delete('/admin_users/:user_id', authenticateToken, authorizeRoles('admin'), allowedAdmins, adminUserController.deleteAdminUser)

router.put('/admin_users/:user_id', authenticateToken, authorizeRoles('admin'), allowedAdmins, upload.single('image'),  validateNewAndUpdateStandardUser, adminUserController.updateAdminUser)



module.exports = router