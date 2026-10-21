const express = require('express')

const router = express.Router()

const { validateNewAndUpdateEmployee } = require('../../middleware/validator')


const employeesController = require('../../controllers/common/employees_controller')

// the images are saved in the MinIO server (the same as the sales agents), the database keeps only the file name
const { upload: uploadImage } = require('../../middleware/fileupload_to_minio')
const { authenticateToken, authorizeRoles} = require('../../middleware/auth')


// router.get('/employees/:department_code/:employee_id',authenticateToken, authorizeRoles('admin', 'manager', 'user', 'poweruser'),salesAgensController.fetchSalesAgent)
router.get('/employees/:department_code', authenticateToken,authorizeRoles('admin', 'manager', 'user','poweruser'),employeesController.fetchEmployees)

// employment and assignment history of one employee (details page, admin only)
router.get('/employees/:department_code/:employee_id', authenticateToken, authorizeRoles('admin'), employeesController.fetchEmployeeBio)


router.post('/employees/:department_code', authenticateToken, authorizeRoles('admin'), uploadImage.single('image'), validateNewAndUpdateEmployee,employeesController.addNewEmployee  )

router.delete('/employees/:department_code/:employee_id', authenticateToken, authorizeRoles('admin'), employeesController.deleteEmployee)

router.put('/employees/:department_code/:employee_id', authenticateToken, authorizeRoles('admin'), uploadImage.single('image'), validateNewAndUpdateEmployee, employeesController.updateEmployee)



module.exports = router