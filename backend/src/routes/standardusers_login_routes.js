const express = require('express')

const router = express.Router()

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

const loginController = require('../controllers/standardusers_login_controller')

const { registerUser, loginUser,logoutUser, updateLogin } = require('../middleware/validator')

router.post('/standardusers_register', authenticateToken, authorizeRoles('admin'), registerUser,loginController.registerUser)

router.put('/standardusers_update_login', authenticateToken, authorizeRoles('admin'), updateLogin, loginController.updateLogin)

router.post('/standardusers_login', loginUser, loginController.loginUser)
// router.post('/refresh_token', loginController.refreshToken )

// router.post('/verify_token', loginController.verifyToken)

router.post('/standardusers_logout',   loginController.logoutUser)
 
module.exports = router