// app.js
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config()

const salesAgentsRoutes = require('./routes/sales_agents_route')
const salesMemoRoutes = require('./routes/sales_memo_route')
const salesAbsencesRoutes = require('./routes/sales_absences_route')
const salesNewDepositRoutes = require('./routes/sales_new_deposit_route')
const salesFeedbackRoutes = require('./routes/sales_feedback_route')
const salesTardinessRoutes = require('./routes/sales_tardiness_route')
// const salesTargetShipokRoutes = require('./routes/sales_target_shipok_route')
const salesLeaderboardRoutes = require('./routes/sales_leaderboard_route')
const salesDashboardRoutes = require('./routes/sales_dashboard_routes')
const salesAnalyticsRoutes = require('./routes/sales_analytics_route')
const salesMarketRoutes = require('./routes/sales_market_route')
const salesTeamRoutes = require('./routes/sales_teams_routes')
const salesManagerRoutes = require('./routes/sales_managers_route')
// const importExportDataRoutes = require('./routes/import_export_data_routes')
const salesLoginRoutes = require('./routes/sales_login_routes')
const standardUsersLoginRoutes = require('./routes/standardusers_login_routes')
const standardUsersRoutes = require('./routes/standardusers_routes')
const salesEvaluationDataRoutes = require('./routes/sales_evaluation_data_routes')
const salesDeductionRoutes = require('./routes/sales_deduction_routes')
const customSearchRoutes = require('./routes/custom_search_routes')


//add common routes
const employeesRoutes = require('./routes/common/employees_routes')
const teamsRoutes = require('./routes/common/teams_routes')
const managerRoutes = require('./routes/common/managers_routes')
const positionRolesRoutes = require('./routes/common/positions_roles_routes')
const departmentsRoutes = require('./routes/common/departments_routes')


//new added for experiment 
const salesAgentsRoutes2 = require('./routes/sales_agents_route2')


const csdPerformanceMetricsRoutes = require('./routes/csd/csd_performance_metrics_routes')
const csdLeadboardRoutes = require('./routes/csd/csd_leaderboard_routes')
const csdEvaluationRoute = require('./routes/csd/csd_evaluation_routes')


const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/sounds', express.static(path.join(__dirname, 'sounds')))

app.use("/api", salesLoginRoutes)
app.use("/api", standardUsersLoginRoutes)
app.use("/api", standardUsersRoutes)
app.use("/api", salesAgentsRoutes)
app.use("/api", salesMemoRoutes)
app.use("/api", salesAbsencesRoutes)
app.use("/api", salesNewDepositRoutes)
app.use("/api", salesFeedbackRoutes)
app.use("/api", salesTardinessRoutes)
// app.use("/api", salesTargetShipokRoutes)
app.use("/api", salesLeaderboardRoutes)
app.use("/api", salesDashboardRoutes)
app.use("/api", salesAnalyticsRoutes)
app.use("/api", salesMarketRoutes)
app.use("/api", salesTeamRoutes)
app.use("/api", salesManagerRoutes)
app.use('/api',salesEvaluationDataRoutes)
app.use('/api', salesDeductionRoutes)
app.use("/api", customSearchRoutes)



//new added 
app.use("/api/prod", salesAgentsRoutes2)
app.use("/api/prod", teamsRoutes)  // common routes for teams, including sales teams and other departments
app.use("/api/prod", managerRoutes)  // common routes for managers, including sales managers and other departments
app.use("/api", employeesRoutes)  // common routes for employees, including sales agents and other departments
app.use("/api", positionRolesRoutes)  // common routes for positions and roles, including sales positions/roles and other departments
app.use("/api", departmentsRoutes)  // common routes for departments, including sales teams and other departments


app.use('/api', csdPerformanceMetricsRoutes)
app.use('/api',  csdLeadboardRoutes)
app.use('/api', csdEvaluationRoute)



// app.use("/api", importExportDataRoutes(io))  // in test, we can pass fake io if needed

// OPTIONAL: test-only route
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong' })
})

module.exports = app
