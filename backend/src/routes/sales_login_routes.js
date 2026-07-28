const express = require('express')

const router = express.Router()

const loginController = require('../controllers/sales_login_controller')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

const { registerUser, loginUser,logoutUser, updateLogin  } = require('../middleware/validator')

router.post('/sales_register', authenticateToken, authorizeRoles('admin', ), registerUser,loginController.registerUser)

router.put('/sales_update_login', authenticateToken, authorizeRoles('admin'), updateLogin, loginController.updateLogin )

router.post('/sales_login', loginUser, loginController.loginUser)

// router.post('/refresh_token', loginController.refreshToken )

// router.post('/verify_token', loginController.verifyToken)

router.post('/sales_logout', loginController.logoutUser)
 
module.exports = router