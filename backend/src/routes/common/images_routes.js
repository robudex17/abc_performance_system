const express = require('express')

const router = express.Router()

const { authenticateToken, authorizeRoles} = require('../../middleware/auth')

const imagesController = require('../../controllers/common/images_controller')


// router.get('/employees/:department_code/:employee_id',authenticateToken, authorizeRoles('admin', 'manager', 'user', 'poweruser'),salesAgensController.fetchSalesAgent)
router.get('/images/:key',  imagesController.fetchImage)



module.exports = router