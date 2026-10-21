const express = require('express')

const router = express.Router()

const { authenticateToken, authorizeRoles, allowedAdmins } = require('../../middleware/auth')

const loginController = require('../../controllers/system_users/admin_users_login_controller')

const { registerUser, loginUser,logoutUser, updateLogin } = require('../../middleware/validator')

router.post('/admin_users_register', authenticateToken, authorizeRoles('admin'), allowedAdmins, registerUser,loginController.registerUser)

router.put('/admin_users_update_login', authenticateToken, authorizeRoles('admin'), allowedAdmins, updateLogin, loginController.updateLogin)

router.post('/admin_users_login', loginUser, loginController.loginUser)
// router.post('/refresh_token', loginController.refreshToken )

// router.post('/verify_token', loginController.verifyToken)

router.post('/admin_users_logout',   authenticateToken, loginController.logoutUser)
 
module.exports = router