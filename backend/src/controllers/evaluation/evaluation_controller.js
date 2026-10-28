const pool = require('../../config/db')
const { validationResult, body } = require('express-validator')

const { parseYearMonth } = require('../helper_scripts/global_variables_and_functions')
const { attachReceivedFeedback } = require('./received_feedback')
const { isResignedInMonth } = require('../../middleware/evaluation_lock')
const { applyComputedPerformance, applySubmitDependencies, getSubmitBlockers, getReviewBlockers } = require('./performance_resolver')
const { attachLeadership } = require('./leadership_scores')
const { readDepartment, badDepartment, isExcludedFromEvaluation } = require('./department_scope')

const { fetch_eval_queries, delete_eval_queries, update_eval_queries, add_eval_queries }  = require(`./metrics_queries`)

let array_of_values = []
let success_message = ""
let erorr_message = ""
let not_found_message


// Who gives the feedback_by_admin: taken from the login token first (nobody can save a feedback in the name
// of another admin), then from what the page sent. admin_id, admin_dbname and admin_role can be NULL in the table,
// so an unknown value is saved as NULL (undefined can not be bound to a query).
const getAdminIdentity = async (req, fromBody) => {
    const adminId = req.user?.login_id ?? fromBody.admin_id ?? null
    let adminDbname = req.user?.db_name ?? fromBody.admin_dbname ?? null

    // old tokens have no db_name: read it from the employees (or standard users) table
    if (!adminDbname && adminId) {
        const [employee] = await pool.execute('SELECT db_name FROM employees WHERE id = ?', [adminId])
        if (employee.length > 0) {
            adminDbname = employee[0].db_name
        } else {
            const [standardUser] = await pool.execute('SELECT db_name FROM standard_users WHERE id = ?', [adminId])
            adminDbname = standardUser.length > 0 ? standardUser[0].db_name : null
        }
    }

    return {
        admin_id: adminId,
        admin_dbname: adminDbname,
        admin_role: req.user?.role ?? fromBody.admin_role ?? null,
    }
}


// Performance must not be 0 and at least one of Feedback (Admin), (QA), (Immediate Head), (Members) must have a value.
// A leader (position level 7 - 10) also needs the Leadership Individual Performance (the evaluation of the head).
const isReadyToSubmit = (agent) =>
    Number(agent.performance) > 0 &&
    (!agent.leadership_required || Number(agent.leadership_score) > 0) &&
    [agent.feedback_by_admin, agent.feedback_by_qa, agent.feedback_by_immediate_head, agent.feedback_by_members]
        .some(value => Number(value) > 0)

exports.fetchCsdEvaluation = async (req, res, next) => {

     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const current_user = req.user

    const export_to_excel = req.export_to_excel
    const eval_type = req.params.eval_type
    const employee_id = req.params.employee_id

    
    
   
    // csd (default) or collection: ?department=collection
    const department_code = readDepartment(req)
    if (!department_code) return badDepartment(res)
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

   // local on purpose: a module level variable would be shared by all the requests
   let array_of_values, success_message, erorr_message


   const {
         performance, new_count , admin_dbname, admin_id, admin_role, feedback_by_admin, db_name,
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
        case "performance":
        const perfStr = String(performance ?? '').trim();

            // Accepts 85, 85.5, 99.99, .5 — rejects '', 'abc', '12abc', '1e5', etc.
            if (perfStr === '' || !/^(\d+(\.\d+)?|\.\d+)$/.test(perfStr)) {
                console.log('Invalid performance:', performance);
                return res.status(400).json({
                    message: 'Invalid performance value. Expected a number.'
                });
            }

         const perfValue = parseFloat(perfStr);

            if (perfValue > 100) {
                return res.status(400).json({
                    message: 'Performance value cannot be greater than 100.'
                });
            }
            // 0 is not a performance: nothing is stored (and an old 0 record is removed)
            if (perfValue === 0) {
                await pool.execute(delete_eval_queries.performance, [employee_id, year_month])
                return res.status(200).json({ message: `Performance 0 is not stored for employee_id: ${employee_id}` })
            }
            array_of_values = [performance, year_month, employee_id]
            success_message = `${performance} ${eval_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${eval_type} records`
            break
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

        case "feedback_by_admin": {
            // the page sends the text of the input, so "4.5" (string) is valid, like in the update
            const feedbackStr = String(feedback_by_admin ?? '').trim()

            if (feedbackStr === '' || !/^(\d+(\.\d+)?|\.\d+)$/.test(feedbackStr) || Number(feedbackStr) <= 0 || Number(feedbackStr) > 5) {
                console.log('Invalid  feedback:', feedback_by_admin );
                return res.status(400).json({
                    message: `${eval_type} must be a number greater than 0 and not greater than 5`
                })
            }

            const feedbackValue = Number(feedbackStr)
            const adminIdentity = await getAdminIdentity(req, { admin_id, admin_dbname, admin_role })

            // the name of the employee is read from the database when the page did not send it
            let employeeDbName = db_name
            if (!employeeDbName) {
                const [employee] = await pool.execute('SELECT db_name FROM employees WHERE id = ?', [employee_id])
                if (employee.length === 0) {
                    return res.status(404).json({ message: `Employee ${employee_id} not found` })
                }
                employeeDbName = employee[0].db_name
            }

            // feedback_by_admin( employee_id, db_name, admin_id, admin_dbname, admin_role, year_month, feedback )
            array_of_values = [employee_id, employeeDbName, adminIdentity.admin_id, adminIdentity.admin_dbname, adminIdentity.admin_role, year_month, feedbackValue]
            success_message = `${feedbackValue} ${eval_type} for employee_id: ${employee_id} are created or recorded`
            erorr_message = `Error inserting new ${eval_type} records`
            break
        }

        default:
            console.log('Unkown Metrics Type')
            return res.status(400).json({ message: `Unknown evaluation type: ${eval_type}` })
    }
     

     try {
       
        const [result]  = await pool.execute(add_eval_queries[eval_type],array_of_values)

        res.status(201).json({
            message: `${success_message}`
        })
        console.log(result)
        return

    }catch(error){
        // one record per employee per month (the primary key of feedback_by_admin is employee_id + year_month)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: `${eval_type} for ${year_month} already exists, please edit it instead` })
        }

        console.error(`${erorr_message}`, error)
        res.status(500).json({error: `Database Error, ${erorr_message}`})
    }


 }


exports.updateCsdEvaluation  = async (req,res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const employee_id = req.params.employee_id

    // local on purpose: a module level variable would be shared by all the requests
    let array_of_values, success_message, erorr_message, not_found_message

    const {
            performance, new_count,  admin_dbname, admin_id, admin_role, feedback_by_admin, db_name,
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
        case "performance":
            
        const perfStr = String(performance ?? '').trim();

            // Accepts 85, 85.5, 99.99, .5 — rejects '', 'abc', '12abc', '1e5', etc.
            if (perfStr === '' || !/^(\d+(\.\d+)?|\.\d+)$/.test(perfStr)) {
                console.log('Invalid performance:', performance);
                return res.status(400).json({
                    message: 'Invalid performance value. Expected a number.'
                });
            }

         const perfValue = parseFloat(perfStr);

            if (perfValue > 100) {
                return res.status(400).json({
                    message: 'Performance value cannot be greater than 100.'
                });
            }
            // updating to 0 deletes the record completely (Performance 0 means not set)
            if (perfValue === 0) {
                await pool.execute(delete_eval_queries.performance, [employee_id, year_month])
                return res.status(200).json({ message: ` ${eval_type} is removed` })
            }
            array_of_values = [performance,  employee_id, year_month]
            success_message = `Agent ${eval_type} is updated`
            erorr_message = `Error Updating ${eval_type} records`
            not_found_message = `Agent ${eval_type} Time Not Found`
            break 

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
            
        case "feedback_by_admin" : {

            const fbaStr = String(feedback_by_admin ?? '').trim();

            // Accepts 85, 85.5, 99.99, .5 — rejects '', 'abc', '12abc', '1e5', etc.
            if (fbaStr === '' || !/^(\d+(\.\d+)?|\.\d+)$/.test(fbaStr)) {
                console.log('Invalid feedback:', feedback_by_admin);
                return res.status(400).json({
                    message: 'Invalid feedback value. Expected a number.'
                });
            }

            const fbaValue = parseFloat(fbaStr);

            if (fbaValue <= 0 || fbaValue > 5) {
                return res.status(400).json({
                    message: `${eval_type} must be a number greater than 0 and not greater than 5`
                });
            }

            const adminIdentity = await getAdminIdentity(req, { admin_id, admin_dbname, admin_role })

            // db_name is the name of the employee: keep the saved one when the page did not send it
            let employeeDbName = db_name
            if (!employeeDbName) {
                const [employee] = await pool.execute('SELECT db_name FROM employees WHERE id = ?', [employee_id])
                employeeDbName = employee.length > 0 ? employee[0].db_name : null
            }

            // UPDATE feedback_by_admin SET db_name, admin_id, admin_dbname, admin_role, feedback WHERE employee_id AND year_month
            array_of_values = [employeeDbName, adminIdentity.admin_id, adminIdentity.admin_dbname, adminIdentity.admin_role, fbaValue, employee_id, year_month]
            success_message = `Agent ${eval_type} is updated`
            erorr_message = `Error Updating ${eval_type} records`
            not_found_message = `Agent ${eval_type} Time Not Found`
            break
        }

        default:
            console.log('Unknown Evaluation Type')
            return res.status(400).json({ message: `Unknown evaluation type: ${eval_type}` })
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

    // local on purpose: a module level variable would be shared by all the requests
    let array_of_values, success_message, erorr_message, not_found_message

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
        case "performance":
        case "absences":
        case "tardiness":
        case "memo":
        case "feedback_by_admin":

            array_of_values = [employee_id, year_month]
            success_message = `Agent ${eval_type} is deleted`
            erorr_message = `Error deleting ${eval_type} records`
            not_found_message = `Agent ${eval_type}  Not Found`
            break

        default:
            console.log('Unknown Evalulation Type')
            return res.status(400).json({ message: `Unknown evaluation type: ${eval_type}` })
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
 
    // let  performance_data ;


    switch (eval_type){
        case "all": 
         array_of_values = [ year_month, year_month, // assignment snapshot
                          year_month, year_month, // employment snapshot
                          year_month, // csd evaluation
                          year_month, // performance
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
     //scope can be all, agent, team_leader, team
    switch (scope){

        case "all":
            filter = ""
            // performance_data  =  await csdMetricsController.generateCsdPerformanceMetrics(year_month, 'all', department_code, metrics_type, employee_id,current_user)
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
        ${fetch_eval_queries[eval_type]} WHERE d.code = ? ${filter}

        `,[...array_of_values, department_code]
      );
   
     
    //  performance_data = performance_data.map(agent => {
    //    return{id: agent.id , total_performance_score_percentage: agent.total_performance_score_percentage, submitted_performance: agent.submitted}
    //  })
    //  let employee_to_evaluate  =  csdEvaluationResults.map(agent => {
    //     const matching_agent = performance_data.find(a => a.id === agent.id)

    //     return {...agent, ... matching_agent}
    //  })

     // the staff that is not in the evaluation of the department (the Purchasing Manager of Japan), see department_scope.js
     const excludedIds = new Set(csdEvaluationResults.filter(row => isExcludedFromEvaluation(department_code, row)).map(row => Number(row.id)))

     let employee_to_evaluate  =  csdEvaluationResults.filter(row => !excludedIds.has(Number(row.id))).sort((a, b) => {

            // remove the level 10 agent

        
            // 1. Primary Sort: Higher position_level first (descending)
            if (b.position_level !== a.position_level) {
                return b.position_level - a.position_level;
            }

            // 2. Secondary Sort: If levels are equal, group by team_id
            return a.team_id - b.team_id;
        });

     for ( const agent of  employee_to_evaluate ){
        agent['year_month'] = year_month
        agent['year'] = year
        agent['month'] = month
     }

     // the performance of the assistant team leaders, team leaders, assistant managers and the manager is the average of
     // their subordinates (it is not typed), see performance_resolver.js
     await applyComputedPerformance(employee_to_evaluate, year_month)

     // the Leadership Individual Performance (questionnaire) of the leaders, the other part of their Performance
     await attachLeadership(employee_to_evaluate, year_month)

     // the feedback of the QA, the immediate head and the members (view only on the CSD Evaluation page)
     await attachReceivedFeedback(employee_to_evaluate, year_month, excludedIds)

     // submit status: ready when Performance is not 0 and at least one of the four feedback has a value
     for (const agent of employee_to_evaluate) {
        agent['submitted'] = Number(agent.eval_submitted) === 1 ? 1 : 0
        agent['ready_to_submit'] = isReadyToSubmit(agent)
     }

     // the submit order of the computed Performance: submit_waiting_for (the subordinates to submit first) and review_locked_by (the submitted head)
     await applySubmitDependencies(employee_to_evaluate, year_month)



      //GET THE EQUIVALENT POINTS  TABLES
    // const  [performanceScore] =  await pool.execute(
    //         'SELECT min_value, max_value, score FROM   performance_score'
    //     )

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

 
            
    // for ( const agent of  employee_to_evaluate ){

    //      if(agent.submitted_performance == 0){
    //         agent.performance_score = 0 
    //      }else {
    //         agent.performance_score =  performanceScore.find(el => agent['total_performance_score_percentage'] >= el.min_value &&  agent['total_performance_score_percentage'] <= el.max_value)?.score || 0
    //      }

    //     // let agent_absence_score;

    //     //  if(agent['absences'] === 0){
    //     //        agent_absence_score = 5
    //     // }else{
    //     //     aagent_absence_score = absenceScore.find(el => el.absence_count == agent.absences )?.score || 0
    //     // }
         
    //     //  agent['absence_score'] = agentAbsenceScore
          
      
              
    //     //   let agent_tardiness_score
    //     //   if (agent['tardiness'] === 0){
    //     //       agent_tardiness_score = 5
    //     //   }else {
    //     //     agent_tardiness_score = tardinessScore.find(el => el.tardiness_count == agent.tardiness)?.score || 0
          
    //     //   }
  
    //     //   agent['tardiness_score'] = agentTardinessScore
          
              
    //     //  let agent_memo_score
    //     //  if (agent['memo'] === 0){
    //     //    agent_memo_score = 5
    //     //  }else {
    //     //   agent_memo_score = memoScore.find(el => el.memo_count == agent.memo)?.score || 0
      
    //     // }

    //     // agent['memo_score'] = agentMemoScore    
    //     agent['year_month'] = year_month
    //     agent['year'] = year
    //     agent['month'] = month
      
    //  }


    return employee_to_evaluate
   

    }catch(error){
        console.error('Error fetching CSD performance metrics', error)
        
    }   

}


// Submit the CSD evaluation of the month: admin only (routes/evaluation/evaluation_routes.js).
// employee_id 'all' submits everybody (the Submit button of the CSD & Collection Manager and the Submit All button),
// it needs all the rows to be ready. What is ready is decided here, not by what the page sends.
// Table: csd_evaluation_status( employee_id, dbname, year_month, submitted )
const readStatusYearMonth = (req) => {
    const yearMonth = req.body?.year_month || req.query.year_month
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth || '')) return null
    return yearMonth
}

exports.submitCsdEvaluation = async (req, res, next) => {
    const employeeId = req.params.employee_id
    const yearMonth = readStatusYearMonth(req)
    if (!yearMonth) return res.status(400).json({ message: 'year_month must be in YYYY-MM format' })

    const today = new Date()
    if (yearMonth > `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`) {
        return res.status(400).json({ message: 'Submitting the evaluation of a future month is prohibited' })
    }

    // the department of the evaluation (csd, or collection): 'all' is everybody of THAT department
    const department = readDepartment(req)
    if (!department) return badDepartment(res)

    let connection
    try {
        const evaluation = await exports.generateCsdEvaluation(yearMonth, 'all', department, 'all', 'all', null, req.user)
        const targets = employeeId === 'all' ? evaluation : evaluation.filter(agent => String(agent.id) === String(employeeId))

        if (targets.length === 0) return res.status(404).json({ message: `Employee ${employeeId} not found in the CSD evaluation of ${yearMonth}` })

        const notReady = targets.filter(agent => !agent.ready_to_submit)
        if (notReady.length > 0) {
            return res.status(400).json({ message: `Not ready to submit: ${notReady.map(agent => agent.db_name).join(', ')}. Performance must not be 0 and at least one Feedback must have a value` })
        }

        // a computed Performance (e.g. the CSD & Collection Manager) is submitted after all his/her subordinates, of any department
        const blockers = await getSubmitBlockers(targets.map(agent => agent.id), yearMonth)
        if (blockers.length > 0) {
            return res.status(409).json({ message: `Submit first: ${blockers.map(blocker => `${blocker.employee} needs ${blocker.waiting.join(', ')} to be submitted`).join('; ')}` })
        }

        connection = await pool.getConnection()
        await connection.beginTransaction()
        for (const agent of targets) {
            await connection.execute('DELETE FROM csd_evaluation_status WHERE employee_id = ? AND `year_month` = ?', [agent.id, yearMonth])
            await connection.execute(
                'INSERT INTO csd_evaluation_status (employee_id, dbname, `year_month`, submitted) VALUES (?, ?, ?, 1)',
                [agent.id, agent.db_name, yearMonth]
            )
        }
        await connection.commit()

        res.status(201).json({ message: `CSD evaluation of ${employeeId} (${yearMonth}) is submitted`, submitted: targets.length })
    } catch (error) {
        if (connection) await connection.rollback()
        console.error('Error submitting the CSD evaluation:', error)
        res.status(500).json({ error: 'Database Error, Cannot submit the CSD evaluation' })
    } finally {
        if (connection) connection.release()
    }
}

// Review = delete the submitted status, the data can be changed again (not for the resigned staff, see the lock middleware).
exports.reviewCsdEvaluation = async (req, res, next) => {
    const employeeId = req.params.employee_id
    const yearMonth = readStatusYearMonth(req)
    if (!yearMonth) return res.status(400).json({ message: 'year_month must be in YYYY-MM format' })

    const department = readDepartment(req)
    if (!department) return badDepartment(res)

    try {
        if (employeeId === 'all') {
            // only the employees of THIS department: the status table is shared by CSD and Collection
            const evaluation = await exports.generateCsdEvaluation(yearMonth, 'all', department, 'all', 'all', null, req.user)
            // a resigned employee is never reviewed: the evaluation stays submitted, nothing of him/her can change
            const resigned = evaluation.filter(agent => agent.employee_status === 'Resigned')
            const ids = evaluation.filter(agent => agent.employee_status !== 'Resigned').map(agent => agent.id)
            const lockedAll = await getReviewBlockers(ids, yearMonth)
            if (lockedAll.length > 0) return res.status(409).json({ message: `Review ${[...new Set(lockedAll.map(blocker => blocker.head))].join(', ')} first: ${lockedAll.map(blocker => blocker.employee).join(', ')} can not be reviewed while the evaluation of the head is submitted` })
            if (ids.length > 0) {
                await pool.query('DELETE FROM csd_evaluation_status WHERE `year_month` = ? AND employee_id IN (?)', [yearMonth, ids])
            }
            const note = resigned.length > 0 ? ` (${resigned.length} resigned employee${resigned.length === 1 ? '' : 's'} stay${resigned.length === 1 ? 's' : ''} submitted)` : ''
            return res.status(200).json({ message: `${department.toUpperCase()} evaluation of ${yearMonth} is marked for review${note}`, resigned_skipped: resigned.length })
        }

        if (await isResignedInMonth(employeeId, yearMonth)) {
            return res.status(409).json({ message: 'The evaluation of a resigned employee can not be reviewed' })
        }

        const locked = await getReviewBlockers([employeeId], yearMonth)
        if (locked.length > 0) {
            return res.status(409).json({ message: `Review ${locked[0].head} first: ${locked[0].employee} can not be reviewed while the evaluation of ${locked[0].head} is submitted (the Performance of ${locked[0].head} is made of ${locked[0].employee})` })
        }

        const [result] = await pool.execute('DELETE FROM csd_evaluation_status WHERE employee_id = ? AND `year_month` = ?', [employeeId, yearMonth])
        if (result.affectedRows === 0) return res.status(404).json({ message: 'The evaluation is not submitted' })

        res.status(200).json({ message: `CSD evaluation of ${employeeId} (${yearMonth}) is marked for review` })
    } catch (error) {
        console.error('Error marking the CSD evaluation for review:', error)
        res.status(500).json({ error: 'Database Error, Cannot mark the CSD evaluation for review' })
    }
}
