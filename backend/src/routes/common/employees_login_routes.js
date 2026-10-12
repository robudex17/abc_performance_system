const express = require('express')

const router = express.Router()

const loginController = require('../../controllers/common/employees_login_controller')

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

const { registerUser, loginUser,logoutUser, updateLogin  } = require('../../middleware/validator')

router.post('/employee_register', authenticateToken, authorizeRoles('admin', ), registerUser,loginController.registerUser)

router.put('/employee_update_login', authenticateToken, authorizeRoles('admin'), updateLogin, loginController.updateLogin )

router.post('/employee_login', loginUser, loginController.loginUser)

// router.post('/refresh_token', loginController.refreshToken )

// router.post('/verify_token', loginController.verifyToken)

router.post('/employee_logout', loginController.logoutUser)
 
module.exports = router