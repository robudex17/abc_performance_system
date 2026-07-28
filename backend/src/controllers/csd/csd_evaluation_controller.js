const csdMetricsController   = require('./csd_performance_metrics_controller')

const pool = require('../../config/db')
const { validationResult, body } = require('express-validator')

const { parseYearMonth } = require('../helper_scripts/global_variables_and_functions')

const { fetch_eval_queries, delete_eval_queries, update_eval_queries, add_eval_queries }  = require(`./csd_metrics_queries`)

let array_of_values = []
let success_message = ""
let erorr_message = ""
let not_found_message



exports.fetchCsdEvaluation = async (req, res, next) => {

     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const current_user = req.user

    const export_to_excel = req.export_to_excel
    const eval_type = req.params.eval_type
    const employee_id = req.params.employee_id
    
   
    // later I will use this as dynamic maybe I will put in params or on the query
    let department_code = 'csd'
    let metrics_type = 'all'

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

        const evaluation_data = await  this.generateCsdEvaluation(year_month, 'all', department_code, metrics_type, eval_type, employee_id, current_user)

        res.status(200).json(evaluation_data)

    }catch(error){
        console.error('Error fetching CSD performance metrics', error)
        res.status(500).json({error: 'Database Error, Cannot Fetch CSD performance metrics'})
    }
        

}




exports.addCsdEvaluation = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

   const employee_id = req.params.employee_id
   let year_month 

   const eval_type = req.params.eval_type 
   const {
         new_count , admin_dbname, admin_id, admin_role, feedback_by_admin, db_name,
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

 
    switch (eval_type){
        case "absences":
        case "tardiness":
        case "memo":

            if( new_count === '' || typeof(new_count) != 'number' ){
                console.log('Invalid count:', new_count);
                return res.status(400).json({
                    message: `count can not be empty for ${eval_type}`
                })
            }
            const description =  `Adding ${new_count} ${eval_type} for employee_id: ${employee_id} for year_month: ${year_month}`    
            array_of_values = [new_count, year_month, employee_id,description]
            success_message = `${new_count} ${eval_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${eval_type} records`
            break

        case "feedback_by_admin": 

            if( feedback_by_admin == '' || typeof(feedback_by_admin) != 'number' || feedback_by_admin > 5 ){
                console.log('Invalid  feedback:', feedback_by_admin );
                return res.status(400).json({
                    message: `count can not be empty value of 0 or greater than 5 for  ${eval_type}`
                })
            }
            
            array_of_values = [employee_id, db_name, admin_id, admin_dbname, admin_role, year_month, feedback_by_admin]
            success_message = `${new_count} ${eval_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${eval_type} records`

            
        default:
            console.log('Unkown Metrics Type')
            break
    }
     

     try {
       
        const [result]  = await pool.execute(add_eval_queries[eval_type],array_of_values)

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


exports.updateCsdEvaluation  = async (req,res, io) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const employee_id = req.params.employee_id
    const {
            new_count,  admin_dbname, admin_id, admin_role, feedback_by_admin, db_name,
          } = req.body


    const eval_type = req.params.eval_type

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


    switch (eval_type){
        case "absences":
        case "tardiness":
        case "memo":
        
            if( new_count === '' || typeof(new_count) != 'number' ){
                console.log('Invalid count:', new_count);
                return res.status(400).json({
                    message: 'count can not be empty for ${eval_type}'
                })
            }  
            const description = `Updating ${new_count} ${eval_type} for employee_id: ${employee_id} for year_month: ${year_month}`;
            array_of_values = [new_count, description, employee_id, year_month]
            success_message = `Agent ${eval_type} is updated`
            erorr_message = `Error Updating ${eval_type} records`
            not_found_message = `Agent ${eval_type} Time Not Found`
            break 
            
        case "feedback_by_admin" :
             if( feedback_by_admin == ''  || feedback_by_admin > 5 ){
                console.log('Invalid  feedback:', feedback_by_admin );
                return res.status(400).json({
                    message: `count can not be empty value of 0 or greater than 5 for  ${eval_type}`
                })
            }

      
            array_of_values = [db_name, admin_id, admin_dbname, admin_role, feedback_by_admin, employee_id, year_month]
            success_message = `Agent ${eval_type} is updated`
            erorr_message = `Error Updating ${eval_type} records`
            not_found_message = `Agent ${eval_type} Time Not Found`
            break  
            
        default:
            console.log('Unknown Evaluation Type')
            break;
    }

    try {
      
        
        const [result]  = await pool.execute(update_eval_queries[eval_type], array_of_values)
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: `${not_found_message}`})
        }

        
 

        res.status(201).json({
            message: ` ${eval_type} is updated`
        })
        
    }catch(error){
        console.error(`${erorr_message}`, error)
        res.status(500).json({error: `${erorr_message}`})
    }  
}

exports.deleteCsdEvaluation  = async (req, res, next) => {
    
    const employee_id = req.params.employee_id
   

    const eval_type = req.params.eval_type
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

   switch (eval_type){
        case "absences":
        case "tardiness":
        case "memo":
    
            array_of_values = [employee_id, year_month]
            success_message = `Agent ${eval_type} is deleted`
            erorr_message = `Error deleting ${eval_type} records`
            not_found_message = `Agent ${eval_type}  Not Found`
            break   
            
        default:
            console.log('Unknown Evalulation Type')
            break;
    }

    try {
      
        const [result]  = await pool.execute(delete_eval_queries[eval_type], array_of_values)
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: `${not_found_message}`})
        }

        
        res.status(201).json({
            message: ` ${eval_type} is deleted`
        })
        
    }catch(error){
        console.error(`${erorr_message}`, error)
        res.status(500).json({error: `${erorr_message}`})
    }  
  

}


exports.generateCsdEvaluation  = async (year_month, scope, department_code,  metrics_type, eval_type, employee_id,current_user) => {
     
    let {month, year} = parseYearMonth(year_month)
 
    let  performance_data ;


    switch (eval_type){
        case "all": 
         array_of_values = [ year_month, year_month, // assignment snapshot
                          year_month, year_month, // employment snapshot
                          year_month, // csd evaluation
                          year_month, // absences
                          year_month, // tardiness
                          year_month, // memo
                          year_month, // feedback_by_admin
                        
                       ]
         
         break
        default: 
         console.log('Unknown Evaluation ')
        return res.status(400).json({
            message: 'Inknown Metrics'
         });
         break
    }
    
    switch (scope){

        case "all":
            filter = ""
            performance_data  =  await csdMetricsController.generateCsdPerformanceMetrics(year_month, 'all', department_code, metrics_type, employee_id,current_user)
            break 

        case "agent":
            filter = "AND p.level IN (1,2,3)"
            break 
        case  "team_leader":
        case  "team":
            filter = "AND p.level  IN (1,2,3,8)"
            break
       
    }

  
   
    try {
       
      const [csdEvaluationResults] = await pool.execute(
        `
        ${fetch_eval_queries[eval_type]} WHERE d.code = '${department_code}' ${filter}

        `,array_of_values
      );
   
     
     performance_data = performance_data.map(agent => {
       return{id: agent.id , total_performance_score_percentage: agent.total_performance_score_percentage, submitted_performance: agent.submitted}
     })
     let employee_to_evaluate  =  csdEvaluationResults.map(agent => {
        const matching_agent = performance_data.find(a => a.id === agent.id)

        return {...agent, ... matching_agent}
     })

      employee_to_evaluate  =  employee_to_evaluate.sort((a, b) => {

            // remove the level 10 agent

        
            // 1. Primary Sort: Higher position_level first (descending)
            if (b.position_level !== a.position_level) {
                return b.position_level - a.position_level;
            }

            // 2. Secondary Sort: If levels are equal, group by team_id
            return a.team_id - b.team_id;
        });

  



      //GET THE EQUIVALENT POINTS  TABLES
    const  [performanceScore] =  await pool.execute(
            'SELECT min_value, max_value, score FROM   performance_score'
        )

    // const  [absenceScore] =  await pool.execute(
    //         'SELECT  absence_count, score FROM  absences_score'
    //     )
    // const  [tardinessScore] =  await pool.execute(
    //         'SELECT tardiness_count , score FROM   tardiness_score'
    //     )

    // const  [memoScore] =  await pool.execute(
    //         'SELECT  memo_count, score FROM    memorandum_score'
    //     ) 

    // const  [evaluationScore] =  await pool.execute(
    //         'SELECT  performance,  absence, tardiness ,  memorandum_recieved,  feedback FROM  evaluation_criteria '
    //     ) 

 
            
    for ( const agent of  employee_to_evaluate ){

         if(agent.submitted_performance == 0){
            agent.performance_score = 0 
         }else {
            agent.performance_score =  performanceScore.find(el => agent['total_performance_score_percentage'] >= el.min_value &&  agent['total_performance_score_percentage'] <= el.max_value)?.score || 0
         }

        // let agent_absence_score;

        //  if(agent['absences'] === 0){
        //        agent_absence_score = 5
        // }else{
        //     aagent_absence_score = absenceScore.find(el => el.absence_count == agent.absences )?.score || 0
        // }
         
        //  agent['absence_score'] = agentAbsenceScore
          
      
              
        //   let agent_tardiness_score
        //   if (agent['tardiness'] === 0){
        //       agent_tardiness_score = 5
        //   }else {
        //     agent_tardiness_score = tardinessScore.find(el => el.tardiness_count == agent.tardiness)?.score || 0
          
        //   }
  
        //   agent['tardiness_score'] = agentTardinessScore
          
              
        //  let agent_memo_score
        //  if (agent['memo'] === 0){
        //    agent_memo_score = 5
        //  }else {
        //   agent_memo_score = memoScore.find(el => el.memo_count == agent.memo)?.score || 0
      
        // }

        // agent['memo_score'] = agentMemoScore    
        agent['year_month'] = year_month
        agent['year'] = year
        agent['month'] = month
      
     }


    return employee_to_evaluate
   

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









