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

    standardUsers:  `${HTTPADDR}/standardusers`,
    
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
    },

    agentFeedback: `${HTTPADDR}/feedback_by_admin`,
    enableDisableDeleteSalesFeedback: `${HTTPADDR}/enable_disable_delete_feedback_by_admin`,

    sales_login: `${HTTPADDR}/sales_login`,
    sales_logout: `${HTTPADDR}/sales_logout`,
    sales_register: `${HTTPADDR}/sales_register`,
    sales_update_login :  `${HTTPADDR}/sales_update_login`,    
    refreshToken: `${HTTPADDR}/refresh_token`,

    standardusers_login: `${HTTPADDR}/standardusers_login`,
    standardusers_logout: `${HTTPADDR}/standardusers_logout`,
    standardusers_update_login :  `${HTTPADDR}/standardusers_update_login`,    
    standardusers_register: `${HTTPADDR}/standardusers_register`,

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

   positions_roles: {
      'positions': `${HTTPADDR}/positions`,
      'roles': `${HTTPADDR}/roles`
   }, 

  departments: `${HTTPADDR}/departments`,

 
  agent_email_response_time:  `${HTTPADDR}/agent_email_response_time`,
  csd_performance_metrics: `${HTTPADDR}/csd_performance_metrics`,
 csd_performance_metrics_submit: `${HTTPADDR}/csd_performance_metrics/submit`,
 csd_performance_metrics_review: `${HTTPADDR}/csd_performance_metrics/review`,

 csd_leaderboard : `${HTTPADDR}/csd_leaderboard`,
 csd_evaluation: `${HTTPADDR}/csd_evaluation`,

 csd_entities: {
    'metrics': `${HTTPADDR}/csd_performance_metrics`,
    'evaluation': `${HTTPADDR}/csd_evaluation`
 }

   
}

export default API 

