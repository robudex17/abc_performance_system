const express = require('express')

const router = express.Router()
const uploadData = require('../middleware/fileupload_excel')

const importExportDataController =  require('../controllers/import_export_data_controller')

const salesLeaderboardController = require('../controllers/sales_leaderboard_controllers')

const salesTargetShipokController = require('../controllers/sales_target_shipok_controller')

const salesNewDepositController = require('../controllers/sales_new_deposit_controller')

const salesAbsencesController = require('../controllers/sales_absences_controller')

const salesTardinessController = require('../controllers/sales_tardiness_controller')


const salesMemoController = require('../controllers/sales_memo_controller')
const salesFeedbackController = require('../controllers/sales_feedback_controller')

const salesAgentsController = require ('../controllers/sales_agent_controller2')

const { authenticateToken, authorizeRoles} = require('../middleware/auth')

const salesMarketController = require('../controllers/sales_market_controller.js')

const salesDashboardController = require('../controllers/sales_dashboard_controller.js')

const customSearchController = require('../controllers/custom_search_controller')



module.exports = (io) => {
    
    router.post('/upload_target_shipok_data',
                 uploadData.single("file"),  
                 (req, res,) =>  importExportDataController.importTargetShipokData(req, res, io) 
                )
  
    router.post('/upload_new_deposit_data', 
                uploadData.single("file"), 
                (req, res,) =>  importExportDataController.importNewDepositData(req, res, io) )

    router.post('/upload_sales_evaluation_data',  authenticateToken, uploadData.single('file'),
                (req, res,) =>  importExportDataController.importSalesEvaluationData(req, res, io)
            )
    

    router.get('/sales_leaderboard_export', authenticateToken, authorizeRoles('admin', 'poweruser'), (req, res, next) => {
        req.export_to_excel = true
        next()
        }, salesLeaderboardController.fetchAgentLeaderBoard, (req,res, next) => {
        next()
        }, importExportDataController.salesLeaderboardExportToExcel 
   )
   router.get('/sales_agent_performanace_export',  authenticateToken, authorizeRoles('admin', 'poweruser'),
        (req,res, next) => {
            req.export_to_excel = true
         
            next()
        },salesLeaderboardController.fetchAgentLeaderBoard,

        
         importExportDataController.salesAgentMonthlyPerformanceExportToExcel
  )


     router.get('/sales_leaderboard_yearly_export',  authenticateToken, authorizeRoles('admin', 'poweruser'),
        (req,res, next) => {
            req.export_to_excel = true
         
            next()
        },salesLeaderboardController.fetchAgentLeaderBoard,

        
         importExportDataController.salesLeaderboardYearlyExportToExcel 
  )

  router.get('/sales_agents_export', authenticateToken, authorizeRoles('admin', 'poweruser'), 
    (req, res, next) => {
        req.export_to_excel = true
        next()
    }, salesAgentsController.fetchSalesAgents, importExportDataController.fetchSalesAgentsExportToExcel
 
 )


  router.get('/sales_agents_target_export', authenticateToken, authorizeRoles('admin', 'poweruser'), 
    (req, res, next) => {
        req.export_to_excel = true
        next()
    },salesDashboardController.fetchAgentDashboard, importExportDataController.fetchSalesAgentsTargetExportToExcel
 
 )
  
 router.get('/agent_market_target_shipok_new_deposit_export', authenticateToken, authorizeRoles('admin', 'poweruser'),
            (req, res, next) => {
               req.export_to_excel = true
               req.year_only = false
               next()
            },
            salesMarketController.fetchAgentMarketTargetShipok,
            salesMarketController.fetchAgentMarketNewDeposit, 
            importExportDataController.salesTeamPerformanceExportToExcel
           )    


router.get('/agent_market_target_shipok_new_deposit_year_export', authenticateToken ,authorizeRoles('admin', 'poweruser'),
     (req, res, next) => {
        req.export_to_excel = true 
        req.year_only = true 
        next()
     },
     salesMarketController.fetchAgentMarketTargetShipokYear,
     salesMarketController.fetchAgentMarketNewDepositYear,
     importExportDataController.salesTeamPerformanceExportToExcel
   )



  router.get('/custom_search_export/target', authenticateToken, authorizeRoles('admin', 'poweruser'), 
    (req, res, next) => {
        req.export_to_excel = true
        next()
    }, customSearchController.fetchCustomSearch, importExportDataController.fetchSalesAgentsTargetExportToExcel
 
 )


    return router

}