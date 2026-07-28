const express = require('express')

const router = express.Router()



const customSearchController = require('../controllers/custom_search_controller')
const { authenticateToken, authorizeRoles} = require('../middleware/auth')



// router.get('/custom_search/:search_type:/:filter_by', authenticateToken, authorizeRoles('admin', 'poweruser'),customSearchController.fetchSalesAgentsByFilter)

router.get('/custom_search/:search_type', authenticateToken ,customSearchController.fetchCustomSearch )



module.exports = router