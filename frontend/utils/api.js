//const HTTPADDR = `http://localhost:8080/api`

import Csd_performance_metrics from "~/pages/csd/csd_performance_metrics.vue"

const config = useRuntimeConfig()

const HTTPADDR = config.public.apiUrl

// const HTTPADDR = `http://localhost:8080/api`
const API = {
    salesAgents: `${HTTPADDR}/sales_agents`,
    fetchSaleAgentTargetShipok: `${HTTPADDR}/agent_target_shipok`,
    fetchSaleAgentNewDeposit:  `${HTTPADDR}/agent_deposit`,
    fetchSalesAgentAbsences:  `${HTTPADDR}/agent_absent`,
    fetchSalesAgentMemo: `${HTTPADDR}/agent_memo`,
    fetchSalesAgentTardiness: `${HTTPADDR}/agent_tardiness`,
    fetchSalesAgentFeedbackByAdmin: `${HTTPADDR}/feedback_by_admin`,
    fetchAgentMarket:  `${HTTPADDR}/agent_market`,
    fetchManagers: `${HTTPADDR}/managers`,
    salesAgentsEvaluation: `${HTTPADDR}/sales_evaluation_data`,

    admin_users:  `${HTTPADDR}/admin_users`,
    
    fethSalesLearderboard : `${HTTPADDR}/sales_leaderboard`,
    fetchAgentPerformance: `${HTTPADDR}/agent_performance`,
    fetchDashboard: `${HTTPADDR}/sales_dashboard`,

    fetchAnalytics:  `${HTTPADDR}/analytics`,

    agentTargetShipok:  `${HTTPADDR}/agent_target_shipok`,
    agentDeposit: `${HTTPADDR}/agent_deposit`,

    markets: `${HTTPADDR}/markets`,
    teams: `${HTTPADDR}/teams`,

    agentAttendance: {
        absence: `${HTTPADDR}/agent_absent`,
        tardiness: `${HTTPADDR}/agent_tardiness`,
        memo: `${HTTPADDR}/agent_memo`,
    },

    feedback: {
        sales: `${HTTPADDR}/feedback_by_sales`,
        qa: `${HTTPADDR}/feedback_by_qa`,
        none_sales: `${HTTPADDR}/feedback_by_nonesales`
    },

    agentFeedback: `${HTTPADDR}/feedback_by_admin`,
    enableDisableDeleteSalesFeedback: `${HTTPADDR}/enable_disable_delete_feedback_by_admin`,
    enableDisableUpdateAndDeleteNoneSalesFeedback: `${HTTPADDR}/enable_disable_delete_nonesales_feedback_by_admin`,

    sales_login: `${HTTPADDR}/sales_login`,
    sales_logout: `${HTTPADDR}/sales_logout`,
    sales_register: `${HTTPADDR}/sales_register`,
    sales_update_login :  `${HTTPADDR}/sales_update_login`,    
    refreshToken: `${HTTPADDR}/refresh_token`,

    employee_login: `${HTTPADDR}/employee_login`,
    employee_logout: `${HTTPADDR}/employee_logout`,
    employee_register: `${HTTPADDR}/employee_register`,
    employee_update_login :  `${HTTPADDR}/employee_update_login`,  

    admin_users_login: `${HTTPADDR}/admin_users_login`,
    admin_users_logout: `${HTTPADDR}/admin_users_logout`,
    admin_users_update_login :  `${HTTPADDR}/admin_users_update_login`,    
    admin_users_register: `${HTTPADDR}/admin_users_register`,

    fetch_market_target_shipok: `${HTTPADDR}/agent_market_target_shipok`,
    fetch_market_new_deposit: `${HTTPADDR}/agent_market_new_deposit`,
    
    fetch_market_target_shipok_year: `${HTTPADDR}/agent_market_target_shipok_year`,
    fetch_market_new_deposit_year: `${HTTPADDR}/agent_market_new_deposit_year`,
    agent_deduction: `${HTTPADDR}/agent_deduction`,

    export: {
        leaderboard: `${HTTPADDR}/sales_leaderboard_export`,
        leaderboardYearly: `${HTTPADDR}/sales_leaderboard_yearly_export`,
        agent_peformance: `${HTTPADDR}/sales_agent_performanace_export`,
        team_performance_monthly :  `${HTTPADDR}/agent_market_target_shipok_new_deposit_export`,
        team_performance_yearly :   `${HTTPADDR}/agent_market_target_shipok_new_deposit_year_export`,
        sales_agents_export: `${HTTPADDR}/sales_agents_export`,
        sales_agents_target_export: `${HTTPADDR}/sales_agents_target_export`,  
        custom_search_target_export: `${HTTPADDR}/custom_search_export/target`,  

    },
    custom_search: `${HTTPADDR}/custom_search`,

  // newly added for production
   salesAgents2: `${HTTPADDR}/prod/sales_agents`,
   teams2: `${HTTPADDR}/prod/teams`,
   fetchManagers2: `${HTTPADDR}/prod/managers`,

   employees: `${HTTPADDR}/employees`,
   employeeAttendance: `${HTTPADDR}/none_sales_attendance`,          // /:type(absences|tardiness|memo)/:employee_id
   noneSalesFeedbackSummary: `${HTTPADDR}/feedback_by_nonesales_summary`, // /:employee_id?year=YYYY

   positions_roles: {
      'positions': `${HTTPADDR}/positions`,
      'roles': `${HTTPADDR}/roles`
   }, 

  departments: `${HTTPADDR}/departments`,

 
  agent_email_response_time:  `${HTTPADDR}/agent_email_response_time`,
  csd_performance_metrics: `${HTTPADDR}/csd_performance_metrics`,
  csd_performance_metrics_submit: `${HTTPADDR}/csd_performance_metrics/submit`,
  csd_performance_metrics_review: `${HTTPADDR}/csd_performance_metrics/review`,

  evaluation_leaderboard : `${HTTPADDR}/evaluation/leaderboard`,
  evaluation_leaderboard_export: `${HTTPADDR}/evaluation/leaderboard_export`,   // Excel of the table view (agent, team_leader), admin and poweruser
  evaluation_agent_performance: `${HTTPADDR}/evaluation/agent_performance`,                 // /monthly, /yearly (+ /:employee_id)
  evaluation_agent_performance_export: `${HTTPADDR}/evaluation/agent_performance_export`,   // Excel of the same pages, admin and poweruser
  evaluation_custom_range: `${HTTPADDR}/evaluation/custom_range`,                     // the average of the submitted months between two months (+ /:employee_id)
  evaluation_custom_range_export: `${HTTPADDR}/evaluation/custom_range_export`,       // Excel of the custom range, admin, poweruser and GOM
  evaluation_team_performance: `${HTTPADDR}/evaluation/team_performance`,                     // /monthly, /yearly (+ /:team_id)
  leadership_evaluations: `${HTTPADDR}/leadership_evaluations`,                // Leadership Individual Performance (the head evaluates the leaders)
  evaluation_qa_feedback: `${HTTPADDR}/evaluation/qa_feedback`,       // QA feedback (a score) of the CSD staff, Quality Analyst only
 evaluation_records: `${HTTPADDR}/evaluation/records`,
  evaluation_status: `${HTTPADDR}/evaluation/status`,   // Submit (POST) / Review (DELETE) of the CSD evaluation, admin only

  csd_entities: {
    'metrics': `${HTTPADDR}/csd_performance_metrics`,
    'evaluation': `${HTTPADDR}/evaluation/records`
 }

   
}

export default API 

