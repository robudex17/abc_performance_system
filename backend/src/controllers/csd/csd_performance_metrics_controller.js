
const pool = require('../../config/db')
const { validationResult, body } = require('express-validator')

const { parseYearMonth } = require('../helper_scripts/global_variables_and_functions')

const { fetch_queries, add_queries, update_queries, delete_queries }  = require(`./csd_metrics_queries`)

let array_of_values = []
let success_message = ""
let erorr_message = ""
let not_found_message



exports.fetchCsdPerformanceMetrics = async (req, res, next) => {

 

     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const current_user = req.user

    const export_to_excel = req.export_to_excel
    const metrics_type = req.params.metrics_type
    const employee_id = req.params.employee_id
   
    // later I will use this as dynamic maybe I will put in params or on the query
    let department_code = 'csd'
    

    let year_month 
    
    if(!req.query.year_month){
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
        year_month = `${currentYear}-${currentMonth}`
    }else{
        year_month = req.query.year_month
    }

        // ✅ Validate input
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
    return res.status(400).json({
        message: 'Invalid year_month format. Expected YYYY-MM'
    });
    }

    try {

        const metricsData  = await this.generateCsdPerformanceMetrics(year_month, 'all', department_code, metrics_type, employee_id, current_user)

        res.status(200).json(metricsData)

    }catch(error){
        console.error('Error fetching CSD performance metrics', error)
        res.status(500).json({error: 'Database Error, Cannot Fetch CSD performance metrics'})
    }
        

}


exports.addCsdPerformanceMetrics = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

   const employee_id = req.params.employee_id
   let year_month 

   const metrics_type = req.params.metrics_type 
   const { avg_response_minutes, response_count, resolved_tickets, error_count,
           customer_not_good, customer_just_ok , customer_awesome,
           calibration_not_good, calibration_just_ok,  calibration_awesome

        } = req.body



  if(!req.query.year_month){
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
        year_month = `${currentYear}-${currentMonth}`
    }else{
        year_month = req.query.year_month
    }

        // ✅ Validate input
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
    return res.status(400).json({
        message: 'Invalid year_month format. Expected YYYY-MM'
    });
    }

 
    switch (metrics_type){
        case "email_response_time":


            if( avg_response_minutes === '' || typeof(avg_response_minutes) != 'number' ){
                console.log('Invalid avg_response_minutes:', avg_response_minutes);
                return res.status(400).json({
                    message: 'avg_response_minutes can not be empty for email_response_time metrics type'
                })
            }    
            array_of_values = [avg_response_minutes, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`
            break
        case "email_response_count":

            if(response_count === '' || resolved_tickets === '' || typeof(response_count) != 'number' || typeof(resolved_tickets) != 'number' ){
                console.log('Invalid response_count or resolved_tickets:', response_count, resolved_tickets, typeof(response_count),typeof(resolved_tickets));
                return res.status(400).json({
                    message: 'response_count and resolved_tickets are required for email_response_count metrics type'
                })
            }          
 
            array_of_values = [response_count, resolved_tickets, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`
            break
        case "error_report": 
            if(error_count === '' || typeof(error_count) != 'number' ){
                console.log('Invalid error_count:', error_count);
                return res.status(400).json({message: 'error_count can not be empty for error_report metrics type' })
            }       
            array_of_values = [100, error_count, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`
            break
        case "customer_satisfaction_report": 

                if( (customer_not_good === '' || typeof(customer_not_good) != 'number') || (customer_just_ok === '' || typeof(customer_just_ok) != 'number') || (customer_awesome === '' || typeof(customer_awesome) != 'number') ){            
                    console.log('Invalid customer satisfaction values:', customer_not_good, customer_just_ok, customer_awesome);
                    return res.status(400).json({
                        message: 'customer_not_good, customer_just_ok and customer_awesome are required for customer_satisfaction_report metrics type'
                    })
              }
            array_of_values = [customer_not_good, customer_just_ok , customer_awesome, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`
            break 
        case "call_email_calibration": 

                if( (calibration_not_good === '' || typeof(calibration_not_good) != 'number') || (calibration_just_ok === '' || typeof(calibration_just_ok) != 'number') || (calibration_awesome === '' || typeof(calibration_awesome) != 'number') ){            
                    console.log('Invalid call_email_calibration values:', calibration_not_good, calibration_just_ok, calibration_awesome);
                    return res.status(400).json({   message: 'calibration_not_good, calibration_just_ok and calibration_awesome are required for call_email_calibration metrics type' })
                }
            array_of_values =  [calibration_not_good, calibration_just_ok,  calibration_awesome, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`
            break               
            
        default:
            console.log('Unkown Metrics Type')
            break
    }
     

     try {
       
        const [result]  = await pool.execute(add_queries[metrics_type],array_of_values)

        res.status(201).json({
            message: `${success_message}`
        })
        console.log(result)
        return
        
    }catch(error){
        console.error(`${erorr_message}`, error)
        res.status(500).json({error: `Database Error, ${erorr_message}`})
    }  


 }



exports.updateCsdPerformanceMetrics  = async (req,res, io) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const employee_id = req.params.employee_id
    const {avg_response_minutes, response_count, resolved_tickets, error_count,
            customer_not_good, customer_just_ok , customer_awesome,
            calibration_not_good, calibration_just_ok,  calibration_awesome
          } = req.body


    const metrics_type = req.params.metrics_type

   

    let year_month  

    if(!req.query.year_month){
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
            year_month = `${currentYear}-${currentMonth}`
    }else{
            year_month = req.query.year_month
     }

            // ✅ Validate input
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
        return res.status(400).json({
            message: 'Invalid year_month format. Expected YYYY-MM'
        });
    }


   
 
   
    switch (metrics_type){
        case "email_response_time":
            array_of_values = [avg_response_minutes,  employee_id, year_month]
            success_message = `Agent ${metrics_type} is updated`
            erorr_message = `Error Updating ${metrics_type} records`
            not_found_message = `Agent ${metrics_type} Time Not Found`
            break
        case "email_response_count":
            array_of_values =[response_count, resolved_tickets,  employee_id, year_month]
            success_message = `Agent ${metrics_type} is updated`
            erorr_message = `Error Updating ${metrics_type} records`
            not_found_message = `Agent ${metrics_type} Time Not Found`
            break
        case "error_report":
            array_of_values =[error_count,  employee_id, year_month]
            success_message = `Agent ${metrics_type} is updated`
            erorr_message = `Error Updating ${metrics_type} records`
            not_found_message = `Agent ${metrics_type} Time Not Found`            
            break
        case "customer_satisfaction_report":
            array_of_values =[ customer_not_good, customer_just_ok , customer_awesome,  employee_id, year_month]
            
            success_message = `Agent ${metrics_type} is updated`
            erorr_message = `Error Updating ${metrics_type} records`
            not_found_message = `Agent ${metrics_type} Time Not Found`   
            
            break     
        case "call_email_calibration":
            array_of_values =[calibration_not_good, calibration_just_ok,  calibration_awesome,  employee_id, year_month]
            success_message = `Agent ${metrics_type} is updated`
            erorr_message = `Error Updating ${metrics_type} records`
            not_found_message = `Agent ${metrics_type} Time Not Found` 

  
            break               
            
        default:
            console.log('Unknown Metrics Type')
            break;
    }

    try {
      
        console.log(array_of_values)
        const [result]  = await pool.execute(update_queries[metrics_type], array_of_values)
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: `${not_found_message}`})
        }

        
 

        res.status(201).json({
            message: ` ${metrics_type} is updated`
        })
        
    }catch(error){
        console.error(`${erorr_message}`, error)
        res.status(500).json({error: `${erorr_message}`})
    }  
}

exports.deleteACsdPerformanceMetrics  = async (req, res, next) => {
    
    const employee_id = req.params.employee_id
    const { year_month } = req.query

  

    try {
        const query = "DELETE FROM average_email_response_time WHERE employee_id=? AND year_month=?"
        const [result] = await pool.execute(query, [employee_id, year_month])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Email Response Time Not found'})
        }

        res.status(200).send({ message: 'Agent Email Response Time deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent email response time:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Email Response Time'})
    }
}


exports.generateCsdPerformanceMetrics  = async (year_month, scope, department_code, metrics_type, employee_id,current_user) => {
     
    let {month, year} = parseYearMonth(year_month)

    switch (metrics_type){
        case "all": 
         array_of_values = [  year_month, year_month, // assignment snapshot
                          year_month, year_month, // employment snapshot
                          year_month, // csd evaluation
                          year_month, // average email response
                          year_month, // email response count
                          year_month, // calls
                          year_month, // error report
                          year_month, // calibration result
                          year_month, // customer satisfaction
                          year_month  // attrition rate
                       ]
         
         break
        default: 
         console.log('Unknown Metrics ')
        return res.status(400).json({
            message: 'Inknown Metrics'
         });
         break
    }
    let filter = ""
    if( current_user.role == 'admin'  || (current_user.role == 'manager' &&  [10, 9].includes(current_user.position_level))){
        switch (scope){

            case "all":
                filter = ""
                break 

            case "agent":
                filter = "AND p.level IN (1,2,3)"
                break 
            case  "team_leader":
            case  "team":
                filter = "AND p.level  IN (1,2,3,8)"
                break
            case "single":
                
                filter = `AND e.id=${employee_id}`
                break    
        
        }
    }

    if (current_user.role == 'manager' &&  [8].includes(current_user.position_level) ){

        switch (scope){

            case "agent":
            case  "team_leader":
            case  "team":    
                filter = `AND p.level IN (1,2,3) AND ea.manager_id = ${current_user.id}`
                break 
            case "single":
                
                filter = `AND e.id=${employee_id}`
                break    
        
        }        
    }


      if (current_user.role == 'user' &&  [1,2,3].includes(current_user.position_level) ){

        switch (scope){
            case "single":
                
                filter = `AND e.id=${employee_id}`
                break    
        
        }        
    }


    
   
    try {
       
      const [csdPerformanceMetricsResults] = await pool.execute(
        `
        ${fetch_queries[metrics_type]} WHERE d.code = '${department_code}' ${filter}

        `,array_of_values
      );
   

    
     let employee_to_generate_metrics  =  await csdPerformanceMetricsResults

  

     let assistance_manager_metrics = []
     let agents_metrics = []

   if(scope == 'all'){
         employee_to_generate_metrics  = csdPerformanceMetricsResults.filter(a => a.position_level != 10  && a.position_level != 9)

        assistance_manager_metrics = csdPerformanceMetricsResults.filter(a => a.position_level == 9)
        agents_metrics =  csdPerformanceMetricsResults.filter(a => a.position_level != 8)

        employee_to_generate_metrics =   employee_to_generate_metrics.sort((a, b) => {

            // remove the level 10 agent

        
            // 1. Primary Sort: Higher position_level first (descending)
            if (b.position_level !== a.position_level) {
                return b.position_level - a.position_level;
            }

            // 2. Secondary Sort: If levels are equal, group by team_id
            return a.team_id - b.team_id;
        });
   }


   if (scope== 'team_leader' || scope == 'team'){ 
     employee_to_generate_metrics  = csdPerformanceMetricsResults.filter(a => a.position_level == 8)
     agents_metrics =  csdPerformanceMetricsResults.filter(a => a.position_level != 8)

   }




    //compute the total outbound , inbound, and missedcalls before the  iteration  and assign the value to each agent
    const total_inbound_calls = csdPerformanceMetricsResults.reduce((acc, agent) => acc + Number(agent.inbound_calls || 0), 0);
    const total_outbound_calls = csdPerformanceMetricsResults.reduce((acc, agent) => acc + Number(agent.outbound_calls || 0), 0);


      //GET THE EQUIVALENT POINTS  TABLES
    const  [avgEmailResponseTimePoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM  average_email_response_time_score'
        )

    const  [emailResponseCountPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM  email_responses_count_score'
        )
    const  [customersSatisfactionCsrPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM   customer_satisfaction_csr_score'
        )

    const  [customersSatisfactionFpcPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM   customer_satisfaction_fpc_score'
        ) 

    const  [errorReportPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM  error_report_score'
        ) 

    const  [callAndEmailCalibrationPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM  call_email_calibration_score'
        ) 

    const  [inboundOutboundCallPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM inbound_outbound_call_score'
        ) 

    const  [missedCallPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM missed_call_score'
        ) 

    const  [teamAttritionPoints] =  await pool.execute(
            'SELECT min_value, max_value, score FROM team_attrition_rate_score'
        ) 

    const  [csdPerformanceScore] =  await pool.execute(
            'SELECT min_value, max_value, description FROM csd_performance_score'
        ) 
       
    const getPointsAndPercentage =   async(value, lookup_points_table, percentage) => {
      
          let points = lookup_points_table.find(el => value >= el.min_value &&  value <= el.max_value).score

   
            let points_percentage = points * percentage

           return {
            points, 
            points_percentage
          }
       }

       

     
            
    for ( const agent of employee_to_generate_metrics ){


                if(typeof(agent['avg_response_minutes']) == 'undefined' || agent['avg_response_minutes'] === null){
                    // agent['avg_response_minutes'] = 0
                    console.log(`Agent ${agent.firstname} has no average response minutes data.`)
                    agent['aert_equivalent_points'] = null
                    agent['aert_equivalent_points_percentage'] = null
                }else{
                    const computedPointsPercentage = await getPointsAndPercentage(agent['avg_response_minutes'], avgEmailResponseTimePoints, 1.5)
                    agent['aert_equivalent_points'] = computedPointsPercentage.points

                agent['aert_equivalent_points_percentage'] =  computedPointsPercentage.points_percentage
                }

            
                agent['response_count'] 
                agent['resolved_tickets']

                const resolved = Number(agent['resolved_tickets']) || 0
                const total_response_count = Number(agent['response_count']) || 0;

            

                // Check if resolved is greater than 0 to avoid Infinity
                agent['resolved_tickets_percentage'] = resolved > 0 
                    ? Math.round(((total_response_count - resolved) / resolved) * 100) 
                    : 0; // or 'no-data'

                if(agent['resolved_tickets_percentage'] <= 0){
                agent['erc_equivalent_points'] = 0 
                agent['erc_equivalent_points_percentage'] = 0
                    
                }else{

                const   computedPointsPercentage =  await getPointsAndPercentage(agent['resolved_tickets_percentage'], emailResponseCountPoints, 1)
                agent['erc_equivalent_points'] = computedPointsPercentage.points
                agent['erc_equivalent_points_percentage'] =   computedPointsPercentage.points_percentage 
                }

                    
                agent['error_final_result'] =  agent['initial_result'] - agent['error_count']

                if(agent['error_final_result'] <= 0){
                    agent['er_equivalent_points']  = 0
                    agent['er_equivalent_points_percentage'] = 0
                }else{
                    // for agent level 1 and 3 computation
                    if([1, 3].includes(agent['position_level'])){
                    const computedPointsPercentage =  await getPointsAndPercentage( agent['error_final_result'], errorReportPoints, 2)
                    agent['er_equivalent_points']  = computedPointsPercentage.points 
                    agent['er_equivalent_points_percentage'] = computedPointsPercentage.points_percentage
                }
                // for team leader comptuation 
                if([8].includes(agent['position_level'])){
                    const computedPointsPercentage =  await getPointsAndPercentage( agent['error_final_result'], errorReportPoints, 1.5)
                    agent['er_equivalent_points']  = computedPointsPercentage.points 
                
                    agent['er_equivalent_points_percentage'] = computedPointsPercentage.points_percentage
                }

                }


            

                //Customer Satisfaction Report computation
                
                const csr_not_good = agent['customer_not_good']
                const csr_just_ok =  agent['customer_just_ok']
                const csr_awesome =  agent['customer_awesome']

                agent['csr_total_feedback'] = Number(csr_not_good + csr_just_ok + csr_awesome  ) || 0
                agent['csr_result_csr'] = Math.round(Number(((csr_just_ok/2)+csr_awesome)/(csr_not_good+(csr_just_ok/2)+csr_awesome) * 100)) || 0
            
                //agent['csr_result_fpc'] = Math.round(Number((agent['csr_total_feedback'] / agent['resolved_tickets']) * 100)) || 0

                agent['csr_result_fpc'] =  resolved > 0 ? Math.round(Number( (agent['csr_total_feedback'] / resolved) * 100)) : 0

                
                
                let computedPointsPercentageCsr = await getPointsAndPercentage(agent['csr_result_csr'], customersSatisfactionCsrPoints, 0.8)
                agent['csr_result_csr_equivalent_points']  = computedPointsPercentageCsr.points || 0
                agent['csr_result_csr_equivalent_points_percentage'] = computedPointsPercentageCsr.points_percentage || 0

                let computedPointsPercentageFpc  = await getPointsAndPercentage( agent['csr_result_fpc'] , customersSatisfactionFpcPoints, 0.2)
                
                agent['csr_result_fpc_equivalent_points'] = computedPointsPercentageFpc.points || 0
                agent['csr_result_fpc_equivalent_points_percentage']  = computedPointsPercentageFpc.points_percentage || 0

                

                agent['csr_result_csr_fpc_equivalent_points_percentage'] = ( ( (agent['csr_result_csr_equivalent_points_percentage']) + ( agent['csr_result_fpc_equivalent_points_percentage']) *2 )*2 )



                //email and call calibration computation

                const calibration_not_good = Number(agent['calibration_not_good']) || 0
                const calibration_just_ok =  Number(agent['calibration_just_ok']) || 0
                const calibration_awesome =  Number(agent['calibration_awesome']) || 0


            

                if([1, 3].includes(agent['position_level'])){
                    agent['call_email_calibration_result'] =  Math.round(Number(((calibration_just_ok/2)+calibration_awesome)/(calibration_not_good+(calibration_just_ok/2)+calibration_awesome) * 100)) || 0
                    const computedPointsPercentageCalibration = await getPointsAndPercentage(agent['call_email_calibration_result'], callAndEmailCalibrationPoints, 2)
                    agent['call_email_calibration_equivalent_points']  = computedPointsPercentageCalibration.points || 0
                    agent['call_email_calibration_equivalent_points_percentage'] = computedPointsPercentageCalibration.points_percentage || 0
                }

                if([8].includes(agent['position_level'])){  
                    agent['call_email_calibration_result'] =  100
                    const computedPointsPercentageCalibration = await getPointsAndPercentage(agent['call_email_calibration_result'], callAndEmailCalibrationPoints, 1.5)
                    agent['call_email_calibration_equivalent_points']  = computedPointsPercentageCalibration.points || 0
                    agent['call_email_calibration_equivalent_points_percentage'] = computedPointsPercentageCalibration.points_percentage || 0

                }

                //attrition rate computation  for team leaders only 

            
                //   ar.opening_hc,
                // ar.closing_hc,
                // ar.no_of_resignation

                if([8].includes(agent['position_level'])){
                
                    const active_agents = agents_metrics.filter(
                    a => a.team_id == agent.team_id &&
                        a.manager_id == agent.id &&
                        a.employee_status == 'Hired'
                    );

                    const inactive_agents = agents_metrics.filter(
                    a => a.team_id == agent.team_id &&
                        a.manager_id == agent.id &&
                        a.employee_status == 'Resigned'
                    );

                    const activeCount = active_agents.length;
                    const inactiveCount = inactive_agents.length;

                    agent['opening_hc'] = activeCount
                    agent['closing_hc'] = activeCount - inactiveCount
                    agent['no_of_resignation'] = inactiveCount

                    agent['attrition_result'] =  Math.round((inactiveCount / (activeCount + inactiveCount) / 2) * 100)

                    const computedPointsPercentageAttrition = await getPointsAndPercentage(agent['attrition_result'], teamAttritionPoints, 1)
                    agent['attrition_equivalent_points']  = computedPointsPercentageAttrition.points || 0
                    agent['attrition_equivalent_points_percentage'] = computedPointsPercentageAttrition.points_percentage * 2 || 0

                
                }   


                agent['total_outbound_calls'] = total_outbound_calls
                agent['total_inbound_calls'] = total_inbound_calls
            

                agent['agent_inbound_result'] =  Math.round(Number((agent['inbound_calls'] / total_inbound_calls) * 100)) || 0
                agent['agent_outbound_result'] =  Math.round(Number((agent['outbound_calls'] / total_outbound_calls) * 100)) || 0
                agent['missed_calls'] =  Math.floor(Number((agent['total_missed_calls'] / employee_to_generate_metrics.length))) || 0

                agent['agent_missed_result'] =  Math.round(Number((agent['missed_calls'] / agent['inbound_calls']) * 100)) || 0

                const inboundResultPoints = await getPointsAndPercentage(agent['agent_inbound_result'], inboundOutboundCallPoints, 1)

                agent['ioc_equivalent_points'] = inboundResultPoints.points || 0
                agent['ioc_equivalent_points_percentage'] = inboundResultPoints.points_percentage || 0

                const outboundResultPoints = await getPointsAndPercentage(agent['agent_outbound_result'], inboundOutboundCallPoints, 1)
                agent['ooc_equivalent_points'] = outboundResultPoints.points || 0
                agent['ooc_equivalent_points_percentage'] = outboundResultPoints.points_percentage || 0

                const missedCallPointsResult = await getPointsAndPercentage(agent['agent_missed_result'], missedCallPoints, 1)
                agent['mc_equivalent_points'] = missedCallPointsResult.points || 0
                agent['mc_equivalent_points_percentage'] = missedCallPointsResult.points_percentage || 0  
                
                
                agent['month'] = month 
                agent['year'] = year
                agent['year_month'] = year_month



                agent['total_performance_score_percentage'] =  Number((agent['aert_equivalent_points_percentage'] || 0) + 
                (agent['erc_equivalent_points_percentage'] || 0) + 
                (agent['er_equivalent_points_percentage'] || 0) + 
                (agent['csr_result_csr_equivalent_points_percentage'] || 0) + 
                (agent['csr_result_fpc_equivalent_points_percentage'] || 0) + 
                (agent['call_email_calibration_equivalent_points_percentage'] || 0) + 
                (agent['attrition_equivalent_points_percentage'] || 0) +
                (agent['ioc_equivalent_points_percentage'] || 0) +
                (agent['ooc_equivalent_points_percentage'] || 0) +
                (agent['mc_equivalent_points_percentage'] || 0)
                ).toFixed(2)


                agent['total_performance_score_description'] = csdPerformanceScore.find(score => agent['total_performance_score_percentage'] >= score.min_value &&  agent['total_performance_score_percentage'] <= score.max_value).description

                

    }

    


     let final_results = []

    if(scope == 'all'){
        for (const manager of assistance_manager_metrics) {
             manager['month'] = month 
             manager['year'] = year
             manager['year_month'] = year_month
            // =====================================================
            // AVG RESPONSE MINUTES
            // =====================================================

        
           

            manager['submitted_array'] = employee_to_generate_metrics.map(a => a.submitted).filter(el => el !== null && el !== undefined)
            manager['is_completed']  =  manager['submitted_array'].every(item => item === 1);

           
            const avg_response_minutes = employee_to_generate_metrics
                .map(a => a.avg_response_minutes)
                .filter(el => el !== null && el !== undefined)

            manager['avg_response_minutes'] =
                avg_response_minutes.reduce((sum, val) => sum + val, 0) /
                avg_response_minutes.length || 0


            // =====================================================
            // AERT
            // =====================================================

            const aert_equivalent_points = employee_to_generate_metrics
                .map(a => a.aert_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['aert_equivalent_points'] =
                aert_equivalent_points.reduce((sum, val) => sum + val, 0) /
                aert_equivalent_points.length || 0


            const aert_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.aert_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['aert_equivalent_points_percentage'] =
                aert_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                aert_equivalent_points_percentage.length || 0


            // =====================================================
            // RESOLVED TICKETS
            // =====================================================

            const resolved_tickets = employee_to_generate_metrics
                .map(a => a.resolved_tickets)
                .filter(el => el !== null && el !== undefined)

            manager['resolved_tickets'] =
                resolved_tickets.reduce((sum, val) => sum + val, 0) /
                resolved_tickets.length || 0


            const response_count = employee_to_generate_metrics
                .map(a => a.response_count)
                .filter(el => el !== null && el !== undefined)

            manager['response_count'] =
                response_count.reduce((sum, val) => sum + val, 0) /
                response_count.length || 0


            const resolved_tickets_percentage = employee_to_generate_metrics
                .map(a => a.resolved_tickets_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['resolved_tickets_percentage'] =
                resolved_tickets_percentage.reduce((sum, val) => sum + val, 0) /
                resolved_tickets_percentage.length || 0


            // =====================================================
            // ERC
            // =====================================================

            const erc_equivalent_points = employee_to_generate_metrics
                .map(a => a.erc_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['erc_equivalent_points'] =
                erc_equivalent_points.reduce((sum, val) => sum + val, 0) /
                erc_equivalent_points.length || 0


            const erc_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.erc_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['erc_equivalent_points_percentage'] =
                erc_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                erc_equivalent_points_percentage.length || 0


            // =====================================================
            // ERROR REPORT
            // =====================================================

            const error_final_result = employee_to_generate_metrics
                .map(a => a.error_final_result)
                .filter(el => el !== null && el !== undefined)

            manager['error_final_result'] =
                error_final_result.reduce((sum, val) => sum + val, 0) /
                error_final_result.length || 0


            const er_equivalent_points = employee_to_generate_metrics
                .map(a => a.er_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['er_equivalent_points'] =
                er_equivalent_points.reduce((sum, val) => sum + val, 0) /
                er_equivalent_points.length || 0


            const er_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.er_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['er_equivalent_points_percentage'] =
                er_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                er_equivalent_points_percentage.length || 0


            // =====================================================
            // CUSTOMER SATISFACTION
            // =====================================================

            const csr_total_feedback = employee_to_generate_metrics
                .map(a => a.csr_total_feedback)
                .filter(el => el !== null && el !== undefined)

            manager['csr_total_feedback'] =
                csr_total_feedback.reduce((sum, val) => sum + val, 0) /
                csr_total_feedback.length || 0


            const csr_result_csr = employee_to_generate_metrics
                .map(a => a.csr_result_csr)
                .filter(el => el !== null && el !== undefined)

            manager['csr_result_csr'] =
                csr_result_csr.reduce((sum, val) => sum + val, 0) /
                csr_result_csr.length || 0


            const csr_result_fpc = employee_to_generate_metrics
                .map(a => a.csr_result_fpc)
                .filter(el => el !== null && el !== undefined)

            manager['csr_result_fpc'] =
                csr_result_fpc.reduce((sum, val) => sum + val, 0) /
                csr_result_fpc.length || 0


            const csr_result_csr_equivalent_points = employee_to_generate_metrics
                .map(a => a.csr_result_csr_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['csr_result_csr_equivalent_points'] =
                csr_result_csr_equivalent_points.reduce((sum, val) => sum + val, 0) /
                csr_result_csr_equivalent_points.length || 0


            const csr_result_csr_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.csr_result_csr_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['csr_result_csr_equivalent_points_percentage'] =
                csr_result_csr_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                csr_result_csr_equivalent_points_percentage.length || 0

            const csr_result_fpc_equivalent_points = employee_to_generate_metrics
                .map(a => a.csr_result_fpc_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['csr_result_fpc_equivalent_points'] =
                csr_result_fpc_equivalent_points.reduce((sum, val) => sum + val, 0) /
                csr_result_fpc_equivalent_points.length || 0


            const csr_result_fpc_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.csr_result_fpc_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['csr_result_fpc_equivalent_points_percentage'] =
                csr_result_fpc_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                csr_result_fpc_equivalent_points_percentage.length || 0

            const csr_result_csr_fpc_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.csr_result_csr_fpc_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)   

            manager['csr_result_csr_fpc_equivalent_points_percentage'] = csr_result_csr_fpc_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /  csr_result_csr_fpc_equivalent_points_percentage.length || 0     

       


            // =====================================================
            // CALIBRATION
            // =====================================================

            const call_email_calibration_result = employee_to_generate_metrics
                .map(a => a.call_email_calibration_result)
                .filter(el => el !== null && el !== undefined)

            manager['call_email_calibration_result'] =
                call_email_calibration_result.reduce((sum, val) => sum + val, 0) /
                call_email_calibration_result.length || 0

            const call_email_calibration_equivalent_points = employee_to_generate_metrics
                .map(a => a.call_email_calibration_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['call_email_calibration_equivalent_points'] =
                call_email_calibration_equivalent_points.reduce((sum, val) => sum + val, 0) /
                call_email_calibration_equivalent_points.length || 0


            const call_email_calibration_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.call_email_calibration_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)



            manager['call_email_calibration_equivalent_points_percentage'] =
                call_email_calibration_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                call_email_calibration_equivalent_points_percentage.length || 0


            // =====================================================
            // ATTRITION
            // =====================================================
            
            const attrition_result = employee_to_generate_metrics
                .map(a => a.attrition_result)
                .filter(el => el !== null && el !== undefined)

            manager['attrition_result'] =
                attrition_result.reduce((sum, val) => sum + val, 0) /
                attrition_result.length || 0

            const attrition_equivalent_points = employee_to_generate_metrics
                .map(a => a.attrition_equivalent_points)
                .filter(el => el !== null && el !== undefined)

            manager['attrition_equivalent_points'] =  
                attrition_equivalent_points.reduce((sum, val) => sum + val, 0) / 
                attrition_equivalent_points.length || 0  

            const attrition_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.attrition_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['attrition_equivalent_points_percentage'] =
                attrition_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                attrition_equivalent_points_percentage.length || 0


            // =====================================================
            // INBOUND / OUTBOUND
            // =====================================================
            const inbound_result = employee_to_generate_metrics
            .map(a => a.agent_inbound_result)
            .filter(el => el !== null && el !== undefined)
            manager['agent_inbound_result'] = inbound_result.reduce((sum, val) => sum + val, 0) / inbound_result.length || 0

            const outbound_result = employee_to_generate_metrics
            .map(a => a.agent_outbound_result)
            .filter(el => el !== null && el !== undefined)
            manager['agent_outbound_result'] = outbound_result.reduce((sum, val) => sum + val, 0) / outbound_result.length || 0

            const missed_call_result = employee_to_generate_metrics
            .map(a => a.agent_missed_result)
            .filter(el => el !== null && el !== undefined)
            manager['agent_missed_result'] = missed_call_result.reduce((sum, val) => sum + val, 0) / missed_call_result.length || 0    

            const ioc_equivalent_points = employee_to_generate_metrics
            .map(a => a.ioc_equivalent_points)
            .filter(el => el !== null && el !== undefined)

            manager['ioc_equivalent_points'] = ioc_equivalent_points.reduce((sum, val) => sum + val, 0) /  ioc_equivalent_points.length || 0

            const ioc_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.ioc_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['ioc_equivalent_points_percentage'] =
                ioc_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                ioc_equivalent_points_percentage.length || 0

            const ooc_equivalent_points = employee_to_generate_metrics
                .map(a => a.ooc_equivalent_points)
                .filter(el => el !== null && el !== undefined)
                
            manager['ooc_equivalent_points'] =
                ooc_equivalent_points.reduce((sum, val) => sum + val, 0) /
                ooc_equivalent_points.length || 0    


            const ooc_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.ooc_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

  

            manager['ooc_equivalent_points_percentage'] =
                ooc_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                ooc_equivalent_points_percentage.length || 0


            // =====================================================
            // MISSED CALL
            // =====================================================

            const mc_equivalent_points = employee_to_generate_metrics
                .map(a => a.mc_equivalent_points)
                .filter(el => el !== null && el !== undefined)


            manager['mc_equivalent_points'] =
                mc_equivalent_points.reduce((sum, val) => sum + val, 0) /
                mc_equivalent_points.length || 0

            const mc_equivalent_points_percentage = employee_to_generate_metrics
                .map(a => a.mc_equivalent_points_percentage)
                .filter(el => el !== null && el !== undefined)

            manager['mc_equivalent_points_percentage'] =
                mc_equivalent_points_percentage.reduce((sum, val) => sum + val, 0) /
                mc_equivalent_points_percentage.length || 0


            // =====================================================
            // FINAL SCORE
            // =====================================================

            manager['total_performance_score_percentage'] = Number(
                (
                    (manager['aert_equivalent_points_percentage'] || 0) +
                    (manager['erc_equivalent_points_percentage'] || 0) +
                    (manager['er_equivalent_points_percentage'] || 0) +
                    (manager['csr_result_csr_equivalent_points_percentage'] || 0) +
                    (manager['csr_result_fpc_equivalent_points_percentage'] || 0) +
                    (manager['call_email_calibration_equivalent_points_percentage'] || 0) +
                    (manager['attrition_equivalent_points_percentage'] || 0) +
                    (manager['ioc_equivalent_points_percentage'] || 0) +
                    (manager['ooc_equivalent_points_percentage'] || 0) +
                    (manager['mc_equivalent_points_percentage'] || 0)
                ).toFixed(2)
            )

            manager['total_performance_score_description'] =
                csdPerformanceScore.find(
                    score =>
                        manager['total_performance_score_percentage'] >= score.min_value &&
                        manager['total_performance_score_percentage'] <= score.max_value
                )?.description || 'No Rating'

        }

      

        final_results  = [
            ...assistance_manager_metrics,
            ...employee_to_generate_metrics
        ]

        return final_results

    }


    if (scope == 'team') {
        final_results = await groupCsdMetricsByTeam(employee_to_generate_metrics,csdPerformanceScore)
        
        console.log(final_results)
        return final_results 

    }

    if(scope == 'agent' || scope == 'team_leader'  ){
        return employee_to_generate_metrics
    }

async function groupCsdMetricsByTeam (generated_metrics, csdPerformanceScore) {

    const grouped_by_team = {};

    // metrics to average
    const metric_fields = [
        'avg_response_minutes',
        'response_count',
        'resolved_tickets',
        'inbound_calls',
        'outbound_calls',
        'total_missed_calls',
        'initial_result',
        'error_count',
        'calibration_result_id',
        'calibration_not_good',
        'calibration_just_ok',
        'calibration_awesome',
        'customer_satisfaction_id',
        'customer_not_good',
        'customer_just_ok',
        'customer_awesome',
        'opening_hc',
        'closing_hc',
        'no_of_resignation',
        'attrition_result',
        'attrition_equivalent_points',
        'attrition_equivalent_points_percentage',
        'aert_equivalent_points',
        'aert_equivalent_points_percentage',
        'resolved_tickets_percentage',
        'erc_equivalent_points',
        'erc_equivalent_points_percentage',
        'error_final_result',
        'er_equivalent_points',
        'er_equivalent_points_percentage',
        'csr_total_feedback',
        'csr_result_csr',
        'csr_result_fpc',
        'csr_result_csr_equivalent_points',
        'csr_result_csr_equivalent_points_percentage',
        'csr_result_fpc_equivalent_points',
        'csr_result_fpc_equivalent_points_percentage',
        'csr_result_csr_fpc_equivalent_points_percentage',
        'call_email_calibration_result',
        'call_email_calibration_equivalent_points',
        'call_email_calibration_equivalent_points_percentage',
        'total_outbound_calls',
        'total_inbound_calls',
        'agent_inbound_result',
        'agent_outbound_result',
        'missed_calls',
        'agent_missed_result',
        'ioc_equivalent_points',
        'ioc_equivalent_points_percentage',
        'ooc_equivalent_points',
        'ooc_equivalent_points_percentage',
        'mc_equivalent_points',
        'mc_equivalent_points_percentage',
        'total_performance_score_percentage'

    ];

        
    // =========================
    // 1. GROUP + SUM PHASE
    // =========================
    generated_metrics.forEach(agent => {

        const team_name = agent.team_name;
        const team_id = agent.team_id;

        if (!grouped_by_team[team_name]) {

            grouped_by_team[team_name] = {
                team_name,
                team_id,
                team_leader_name: '',
                image_link: '',
                department_code: '',

                month: agent.month,
                year: agent.year,
                year_month: agent.year_month,

                head_count: 0,
                teams: [],
                submitted_array: [],
                is_completed: false,
                total_performance_score_percentage: 0,
                total_performance_score_description: ''
            };

            metric_fields.forEach(field => {
                grouped_by_team[team_name][field] = 0;
            });
        }

        const team = grouped_by_team[team_name];

        // team leader
        if (agent.position_level == 8) {
            team.team_leader_name = agent.db_name;
            team.image_link = agent.image_link;
            team.team_name = agent.team_name
            team.department_code = agent.department_code
        }

        team.head_count++;
        team.teams.push(agent);
        team.submitted_array.push(agent.submitted)

        // sum metrics
        metric_fields.forEach(field => {
            team[field] += parseFloat(agent[field] || 0);
        });

    });

    // =========================
    // 2. AVERAGE + CALC PHASE
    // =========================
    const groupedArray = Object.values(grouped_by_team);

    groupedArray.forEach(team => {

        // compute averages
        metric_fields.forEach(field => {
            team[field] = Number(
                (team[field] / (team.head_count || 1)).toFixed(2)
            );
        });

        // completion check
        team.is_completed = team.submitted_array.every(item => item === 1);

        // performance description
        if (!team.is_completed) {
            team.total_performance_score_description = 'INCOMPLETE RATING';
        } else {
            const score = parseFloat(team.total_performance_score_percentage || 0);

            team.total_performance_score_description =
                csdPerformanceScore.find(s =>
                    score >= s.min_value &&
                    score <= s.max_value
                )?.description || 'NO MATCH FOUND';
        }
    });

    // =========================
    // 3. BEST TEAM TAGGING
    // =========================
    const topScore = Math.max(
        ...groupedArray
            .filter(t => t.is_completed)
            .map(t => parseFloat(t.total_performance_score_percentage || 0))
    );

   

    const finalResult = groupedArray.map(team => ({
        ...team,
        tag:
            team.is_completed &&
            parseFloat(team.total_performance_score_percentage || 0) === topScore
                ? 'BEST TEAM'
                : ''
    }));

    // =========================
    // 4. SORTING
    // =========================
    finalResult.sort(
        (a, b) =>
            parseFloat(b.total_performance_score_percentage || 0) -
            parseFloat(a.total_performance_score_percentage || 0)
    );

    finalResult.forEach(team => {
        team.teams.sort((a, b) => (b.agent_type || 0) - (a.agent_type || 0));
    });

    return finalResult;
};
          

    }catch(error){
        console.error('Error fetching CSD performance metrics', error)
        
    }   

}


//This is for submitting the sales evaluation  
exports.submitCsdPerformanceMetrics= async (req, res, next) => {

  const employee_id  = req.params.employee_id 

  const submit_type = req.params.submit_type

  const table = {
    'metrics': 'csd_performance_status',
    'evaluation': 'csd_evaluation_status'
  }



  if (employee_id === 'all') {
     // delete all records first base on month and year
     // then insert new records
      const payload = req.body; // array of agents

      const year_month = payload[0].year_month
      
      if (!Array.isArray(payload) || payload.length === 0) {
        return res.status(400).json({ error: "Invalid payload" });
      }
   
    
     
      try {
          // 1. Delete existing rows for that month & year
          await pool.query(
            `DELETE FROM ${table[submit_type]} WHERE \`year_month\` =? `,
            [year_month]
          );

        const values = payload.map(item => [
            item.employee_id,
            item.dbname,
            item.year_month || null,
            item.submitted
        ]);

        const [result] = await pool.query(
            `
            INSERT INTO ${table[submit_type]}
           (\`employee_id\`, \`dbname\`, \`year_month\`, \`submitted\`)
            VALUES ?
            `,
            [values]
        );

        res.json({
            success: true,
            deletedOld: true,
            inserted: result.affectedRows
        });          


        } catch (error) {
          console.error("Error in submit-all:", error);
          res.status(500).json({ error: "Database operation failed" });
        }

  }else{
    // insert new record base on month and year
    const {dbname, year_month, submitted } = req.body

   

    try {
      const [result] = await pool.execute(
        `INSERT INTO  ${table[submit_type]}  (employee_id, dbname, \`year_month\`, submitted)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE submitted = VALUES(submitted)`,
        [employee_id, dbname, year_month, submitted]
      );
              res.status(201).json({
            message: `Performance Metrics  employee_id: ${employee_id} are created or recorded`
        });
    } catch (error) {
      console.error('Error inserting csd performance metrics data:', error);
      res.status(500).json({ error: 'Error inserting csd performance metrics data' });
    }
  }
}

//This is for reviewing the sales evaluation 
exports.reviewCsdPerformanceMetrics = async (req, res, next) => {

  const review_type = req.params.review_type

   const table = {
    'metrics': 'csd_performance_status',
    'evaluation': 'csd_evaluation_status'
   }

  
    
   const employee_id  = req.params.employee_id
   const { year_month } = req.body


   let successMessage
   if(employee_id == 'all'){
    successMessage = `Performance Metrics  Data for all agents are marked for review`
   }else{
    successMessage = `Performance Metrics Data for ${employee_id} is marked for review`
   }
  

    try {
        if(employee_id == 'all'){
            const query = `DELETE FROM  ${table[review_type]} WHERE  \`year_month\`=? `
            const [result] = await pool.execute(query, [year_month])
            return res.status(200).send({ message: successMessage });
    
        }
        const query = `DELETE FROM  ${table[review_type]} WHERE employee_id=? AND \`year_month\`=? `
        const [result] = await pool.execute(query, [employee_id, year_month])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Metrics Not found'})
        }

        res.status(200).send({ message:  successMessage });
    }
    catch(error) {
        console.error('Error marked for review:', error)
        res.status(500).json({error: 'Database Error, Cannot marked for review'})
    }
}









