const e = require('express');
const pool = require('../../config/db')
const { validationResult } = require('express-validator')

const { parseYearMonth } = require('../helper_scripts/global_variables_and_functions')

const { fetch_queries, add_queries, update_queries }  = require(`./csd_metrics_queries`)

let array_of_values = []
let success_message = ""
let erorr_message = ""
let not_found_message


exports.fetchCsdPerfomanceMetrics = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    

    const export_to_excel = req.export_to_excel
    const metrics_type = req.params.metrics_type
   
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

 
    let csd_agents;
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
   
    try {
       
      const [csdPerformanceMetricsResults] = await pool.execute(
        `
        ${fetch_queries[metrics_type]} WHERE d.code = '${department_code}'

        `,array_of_values
      );

    


    csd_agents_metrics = csdPerformanceMetricsResults.filter(a => a.position_level != 10)


    csd_agents_metrics =   csd_agents_metrics.sort((a, b) => {

            // remove the level 10 agent

        
            // 1. Primary Sort: Higher position_level first (descending)
            if (b.position_level !== a.position_level) {
                return b.position_level - a.position_level;
            }

            // 2. Secondary Sort: If levels are equal, group by team_id
            return a.team_id - b.team_id;
        });


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
       
       const getPointsAndPercentage =   async(value, lookup_points_table, percentage) => {
      
          let points = lookup_points_table.find(el => value >= el.min_value &&  value <= el.max_value).score 
          let points_percentage  = points * percentage

           return {
            points, 
            points_percentage
          }
       }
        
        for ( const agent of csd_agents_metrics){
            if([9].includes(agent['position_level'])){
               const allResponseTimes= csd_agents_metrics.map(a => a.avg_response_minutes).filter(value => value !== null)
               
                if (allResponseTimes.length > 0){
                    const sum = allResponseTimes.reduce((acc, cur) => acc + cur, 0)
                    agent['avg_response_minutes'] = Number((sum/allResponseTimes.length).toFixed(2));
                }else {
                    agent['avg_response_minutes'] = null
                }
            }
            // if([8].includes(agent['position_level'])){
               
            //     //filter team belongs to you
            //     const yourTeam = csd_agents_metrics.filter(a => (a.manager_id == agent.id && a.team_id == agent.team_id) || a.id == agent.id)
            //     const teamResponseTimes = yourTeam.map(a => a.avg_response_minutes).filter(value => value !== null)

            //     if (teamResponseTimes.length > 0){
            //         const sum = teamResponseTimes.reduce((acc, cur) => acc + cur, 0)
            //         agent['avg_response_minutes'] = Number((sum / teamResponseTimes.length).toFixed(2));
            //     }else {
            //         agent['avg_response_minutes'] = null
            //     }
            // }

            if(!agent['avg_response_minutes']){
                agent['avg_response_minutes'] = 'no-data'
                agent['aert_equivalent_points'] = null
                agent['aert_equivalent_points_percentage'] = null
            }else{
                const computedPointsPercentage = await getPointsAndPercentage(agent['avg_response_minutes'], avgEmailResponseTimePoints, 1.5)
                agent['aert_equivalent_points'] = computedPointsPercentage.points

               agent['aert_equivalent_points_percentage'] =  computedPointsPercentage.points_percentage
            }

          
            agent['response_count']
            agent['resolved_tickets']

            const resolved = agent['resolved_tickets'];
            const total_response_count = agent['response_count'];

         

            // Check if resolved is greater than 0 to avoid Infinity
            agent['resolved_tickets_percentage'] = resolved > 0 
                ? Math.round(((total_response_count - resolved) / resolved) * 100) 
                : 0; // or 'no-data'

                console.log(agent['resolved_tickets_percentage'], agent['firstname'], resolved)

            if(agent['resolved_tickets_percentage'] == 0){
              agent['erc_equivalent_points'] = 0 
              agent['erc_equivalent_points_percentage'] = 0
                 
            }else{

              const   computedPointsPercentage =  await getPointsAndPercentage(agent['resolved_tickets_percentage'], emailResponseCountPoints, 1)
              agent['erc_equivalent_points'] = computedPointsPercentage.points
              agent['erc_equivalent_points_percentage'] =   computedPointsPercentage.points_percentage 
            }

                 
            agent['error_final_result'] = agent['initial_result'] - agent['error_count']

            if([1, 3].includes(agent['position_level'])){
                const computedPointsPercentage =  await getPointsAndPercentage( agent['error_final_result'], errorReportPoints, 2)
                agent['er_equivalent_points']  = computedPointsPercentage.points 
                agent['er_equivalent_points_percentage'] = computedPointsPercentage.points_percentage
            }

            if([8].includes(agent['position_level'])){
                const computedPointsPercentage =  await getPointsAndPercentage( agent['error_final_result'], errorReportPoints, 1.5)
                agent['er_equivalent_points']  = computedPointsPercentage.points 
                agent['er_equivalent_points_percentage'] = computedPointsPercentage.points_percentage
            }

            agent['month'] = month 
            agent['year'] = year
           

        }

        
        res.status(200).json(csd_agents_metrics)
          

    }catch(error){
        console.error('Error fetching Agent Email Response Time records', error)
        res.status(500).json({error: 'Database Error, Cannot Fetch Agent Email Response Time'})
    }      
          
    
}



exports.addCsdPerfomanceMetrics = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

   const employee_id = req.params.employee_id
   let year_month 

   const metrics_type = req.params.metrics_type 
   const { avg_response_minutes, response_count, resolved_tickets, error_count} = req.body



  

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
            array_of_values = [avg_response_minutes, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`

        case "email_response_count":
            array_of_values = [response_count, resolved_tickets, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`

        case "error_report": 
            array_of_values = [100, error_count, year_month, employee_id]
            success_message = `New ${metrics_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${metrics_type} records`

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



exports.updateCsdPerfomanceMetrics  = async (req,res, io) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const employee_id = req.params.employee_id
    const {avg_response_minutes, response_count, resolved_tickets, error_count} = req.body
    const metrics_type = req.params.metrics_type

    console.log(req.body)

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
        default:
            console.log('Unknown Metrics Type')
            break;
    }

    try {
      
        
        const [result]  = await pool.execute(update_queries[metrics_type], array_of_values)
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: `${not_found_message}`})
        }

        
 

        res.status(201).json({
            message: ` Agent Email Response Time is updated`
        })
        
    }catch(error){
        console.error(`${erorr_message}`, error)
        res.status(500).json({error: `${erorr_message}`})
    }  
}

exports.deleteACsdPerfomanceMetrics  = async (req, res, next) => {
    
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






