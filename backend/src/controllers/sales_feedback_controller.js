const pool = require('../config/db')
const { validationResult } = require('express-validator')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

// First Four controllers are for admin feedback
exports.addNewFeedback = async (req, res, next) => {
    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
   
  
    const feedback = req.body.feedback 
    const feedbackDate = req.body.date
    const feedbackMonth = req.body.month 
    const feedbackYear = req.body.year 

    const agentDbname = req.body.agent_dbname
    const adminId = req.body.admin_id 
    const adminDbname = req.body.admin_dbname
    const adminRole = req.body.admin_role
    const agentId = req.params.agent_id
   
  
        
    try {
        const query = "INSERT INTO feedback ( agent_id, agent_dbname, admin_id, admin_dbname, admin_role,month,year,date,feedback) VALUES (?,?,?,?,?,?,?,?,?)"
        const [result]  = await pool.execute(query, [agentId, agentDbname, adminId, adminDbname, adminRole, feedbackMonth, feedbackYear, feedbackDate,feedback])

        res.status(201).json({
            message: `New Feedback Score for agent_id: ${agentId} are created or recorded`
        })
        
    }catch(error){
        console.error('Error inserting new feedback records', error)
        res.status(500).json({error: 'Database Error, Cannot Feedback'})
    }  



 }

 exports.updateAgentFeedback = async (req, res, next) => {
    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
   

    const agentId = req.params.agent_id

    const feedback = req.body.feedback 
    const feedbackDate = req.body.date
   
    const feedbackMonth = req.body.month 
    const feedbackYear = req.body.year 
    const agentDbname = req.body.agent_dbname
    const adminId = req.body.admin_id 
    const adminDbname = req.body.admin_dbname
    const adminRole = req.body.admin_role 
        
    try {
        const query = "UPDATE feedback SET  admin_id=?, admin_dbname=?, admin_role=?, feedback=?  WHERE agent_id=? AND month=? AND year=?"
        
        const [result]  = await pool.execute(query, [adminId, adminDbname, adminRole,feedback, agentId, feedbackMonth, feedbackYear])
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Feedback Not Found..'})
        }


        res.status(201).json({
            message: `Sales Agent Feedback is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent Feedback records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Agent Feedback '})
    }  

 }

 exports.fetchAgentFeedback = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
    let givenMonth
    let givenYear 
    const currentDate = new Date()

    let fullyear = req.query.fullyear
    const export_to_excel = req.query.export_to_excel
 
    if (!req.query.month ||  req.query.month ==="") {
        
        givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }
    
    // const agentId = req.params.agent_id

    let agentId 

    if(req.params.agent_id){
        agentId = req.params.agent_id
    }else{
        agentId = req.query.agent_id
    }

    // const connection =  await pool.getConnection()
    if(fullyear == 'true' || fullyear == true){
        const [result] = await pool.execute(
            'SELECT * FROM  `feedback` WHERE agent_id=?  AND year=?',[agentId,givenYear]  
        )
        if(export_to_excel){
            req.feeback_admin = result
            next()
        }else{
            res.json(result)
 
        }
    }else{
        const [result] = await pool.execute(
            'SELECT * FROM  `feedback` WHERE agent_id=? AND month=? AND year=?',[agentId,givenMonth,givenYear]  
        )

        if(export_to_excel){
            req.feeback_admin = result
            next()
        }else{
            res.json(result)
 
        }
       
    }
   

 }

 exports.deleteAgentFeedback = async (req, res, next) => {
    
    const agentId = req.params.agent_id
    const feedbackDate = req.query.date 

    const feedbackMonth = req.body.month 
    const feedbackYear = req.body.year 
    const adminId = req.body.admin_id 
    const adminDbname = req.body.admin_dbname
    const adminRole = req.body.admin_role

    try {
        const query = "DELETE FROM feedback WHERE  agent_id=? AND month=? AND year=?"
        const [result] = await pool.execute(query, [agentId, feedbackMonth, feedbackYear])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Feedback Not found'})
        }

        res.status(200).send({ message: 'Agent Feedback deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent feedback:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Feedback'})
    }
 }



exports.enableDisableDeleteAgentFeedback = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
       
       const {
          who_give_feedback_id,
          who_receive_feedback_id,
          can_update,
          month,year,
          feedback_type,
          } = req.body
   
   
    let feedback_table
    let success_message
    let error_message
    let query
    if(feedback_type === "agent_by_lm"){
        feedback_table = 'feedback_agents_by_lm' 

        if(req.method === "PUT"){
            query = `UPDATE ${feedback_table} SET  can_update=${can_update} WHERE lm_id=? AND agent_id=? AND month=? AND year=?`
            success_message = `Sales Agent Feedback is updated`
            error_message = 'Agent Feedback Not Found..Cannot Update Agent Feedback'
        }else if(req.method === "DELETE"){
            query = `DELETE FROM ${feedback_table} WHERE lm_id=? AND agent_id=? AND month=? AND year=?`
            success_message = `Sales Agent Feedback is deleted`
            error_message = 'Agent Feedback Not Found..Cannot Delete Agent Feedback'
        }   

    }else if(feedback_type === "lm_by_agent"){

        feedback_table = 'feedback_lm_by_agents' 
        if(req.method === "PUT"){
            query = `UPDATE ${feedback_table} SET  can_update=${can_update}  WHERE agent_id=? AND lm_id=? AND month=? AND year=?`
            success_message = `Local Manager Feedback is updated`
            error_message = 'Local Manager Feedback Not Found..Cannot Update Local Manager Feedback'
        }else if(req.method === "DELETE"){
            query = `DELETE FROM ${feedback_table} WHERE agent_id=? AND lm_id=? AND month=? AND year=?`
            success_message = `Local Manager Feedback is deleted`
            error_message = 'Local Manager Feedback Not Found..Cannot Delete Local Manager Feedback'
        }

    }else if(feedback_type === "lm_by_um"){
        feedback_table = 'feedback_lm_by_um' 
        if(req.method === "PUT"){
            query = `UPDATE ${feedback_table} SET  can_update=${can_update} WHERE manager_id=? AND lm_id=? AND month=? AND year=?`
            success_message = `Local Manager Feedback is updated`
            error_message = 'Local Manager Feedback Not Found..Cannot Update Local Manager Feedback'
        }else if(req.method === "DELETE"){
            query = `DELETE FROM ${feedback_table} WHERE manager_id=? AND lm_id=? AND month=? AND year=?`
            success_message = `Local Manager Feedback is deleted`
            error_message = 'Local Manager Feedback Not Found..Cannot Delete Local Manager Feedback'
        }
       
    }else if(feedback_type === "um_by_lm"){
        feedback_table = 'feedback_um_by_lm' 
        if(req.method === "PUT"){
            query = `UPDATE ${feedback_table} SET  can_update=${can_update} WHERE lm_id=? AND um_id=? AND month=? AND year=?`
        success_message = `Unit Manager Feedback is updated`
            error_message = 'Unit Manager Feedback Not Found..Cannot Update Unit Manager Feedback'
        }else if(req.method === "DELETE"){
            query = `DELETE FROM ${feedback_table} WHERE lm_id=? AND um_id=? AND month=? AND year=?`
            success_message = `Unit Manager Feedback is deleted`
            error_message = 'Unit Manager Feedback Not Found..Cannot Delete Unit Manager Feedback'
        }
    }


    try {
       

        const [result]  = await pool.execute(query, [who_give_feedback_id, who_receive_feedback_id, month, year])

        if (result.affectedRows === 0){
            return res.status(400).json({message: error_message})
        }


        res.status(201).json({
            message: success_message
        })
        
    }catch(error){
        console.error(error_message, error)
        res.status(500).json({error: 'Database Error' ,error_message})
    }
 }


 // Second Four Controllers are for Sales (Agents, LM and UM)
 exports.addSalesFeedback = async (req, res, next) => {
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
   
    const { who_give_feedback_id,
          who_give_feedback_db_name,
          who_receive_feedback_id,
          who_receive_feedback_db_name, 
          responses,
          feedback_score,
          total_score, 
          percentage, date, month,year,
          feedback_type
          } = req.body
    // const agentId = req.params.agent_id
    let success_message
    let error_message
    let query
    if(feedback_type === "agent_by_lm"){
        query = `INSERT INTO feedback_agents_by_lm (lm_id , lm_dbname, agent_id, agent_dbname, responses, feedback_score, total_score, percentage, date, month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        success_message = `New Feedback for agent_id: ${who_receive_feedback_id} are created or recorded`
        error_message = 'Database Error, Cannot create Agent Feedback'
    }else if(feedback_type === "lm_by_agent"){     
        query = `INSERT INTO feedback_lm_by_agents ( agent_id, agent_dbname, lm_id , lm_dbname,responses, feedback_score, total_score, percentage, date, month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        success_message = `New Feedback for local manager with id : ${who_receive_feedback_id} are created or recorded`
        error_message = 'Database Error, Cannot create Local Manager Feedback'
    }else if(feedback_type === "lm_by_um"){     
        query = `INSERT INTO feedback_lm_by_um (manager_id, manager_dbname, lm_id , lm_dbname,responses, feedback_score, total_score, percentage, date, month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        success_message = `New Feedback for local manager with id : ${who_receive_feedback_id} are created or recorded`
        error_message = 'Database Error, Cannot create Local Manager Feedback'
    }else if(feedback_type === "um_by_lm"){     
        query = `INSERT INTO feedback_um_by_lm ( lm_id , lm_dbname, um_id, um_dbname,responses, feedback_score, total_score, percentage, date, month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        success_message = `New Feedback for unit manager with id : ${who_receive_feedback_id} are created or recorded`
        error_message = 'Database Error, Cannot create Unit Manager Feedback'
    }
        try {

            const responsesJson = JSON.stringify(responses)
            // const query = `INSERT INTO ${feedback_table} (lm_id , lm_dbname, agent_id, agent_dbname, responses, feedback_score, total_score, percentage, date, month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
            const [result]  = await pool.execute(query, [who_give_feedback_id, who_give_feedback_db_name, who_receive_feedback_id, who_receive_feedback_db_name, responsesJson, feedback_score, total_score, percentage, date, month,year])

            res.status(201).json({
                message: success_message
            })
            
        }catch(error){
            console.error('Error inserting new feedback records', error)
            res.status(500).json({error: error_message})
        }  

 }

 exports.updateSalesFeedback = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { who_give_feedback_id,
          who_give_feedback_db_name,
          who_receive_feedback_id,
          who_receive_feedback_db_name, 
          responses,
          feedback_score,
          total_score, 
          percentage,  month,year,
          feedback_type
          } = req.body
   
    let feedback_table
    let success_message
    let error_message
    let query
    let canUpdateQuery
    if(feedback_type === "agent_by_lm"){
        feedback_table = 'feedback_agents_by_lm' 
        query = `UPDATE ${feedback_table} SET  responses=?, feedback_score=?, total_score=?, percentage=?, can_update=0 WHERE lm_id=? AND agent_id=? AND month=? AND year=?`
        canUpdateQuery = `SELECT can_update FROM  ${feedback_table} WHERE lm_id=? AND agent_id=? AND month=? AND year=?`
        success_message = `Sales Agent Feedback is updated`
        error_message = 'Agent Feedback Not Found..Cannot Update Agent Feedback'
    }else if(feedback_type === "lm_by_agent"){
        feedback_table = 'feedback_lm_by_agents' 
        query = `UPDATE ${feedback_table} SET  responses=?, feedback_score=?, total_score=?, percentage=?, can_update=0 WHERE agent_id=? AND lm_id=? AND month=? AND year=?`
        canUpdateQuery = `SELECT can_update FROM  ${feedback_table} WHERE agent_id=? AND lm_id=? AND month=? AND year=?`        
        success_message = `Local Manager Feedback is updated`
        error_message = 'Local Manager Feedback Not Found..Cannot Update Local Manager Feedback'
    }else if(feedback_type === "lm_by_um"){
        feedback_table = 'feedback_lm_by_um' 
        query = `UPDATE ${feedback_table} SET  responses=?, feedback_score=?, total_score=?, percentage=?, can_update=0 WHERE manager_id=? AND lm_id=? AND month=? AND year=?`
        canUpdateQuery = `SELECT can_update FROM  ${feedback_table} WHERE manager_id=? AND lm_id=? AND month=? AND year=?`        
        success_message = `Local Manager Feedback is updated`
        error_message = 'Local Manager Feedback Not Found..Cannot Update Local Manager Feedback'
    }else if(feedback_type === "um_by_lm"){
        feedback_table = 'feedback_um_by_lm' 
        query = `UPDATE ${feedback_table} SET  responses=?, feedback_score=?, total_score=?, percentage=?, can_update=0 WHERE lm_id=? AND um_id=? AND month=? AND year=?`
        canUpdateQuery = `SELECT can_update FROM  ${feedback_table} WHERE lm_id=? AND um_id=? AND month=? AND year=?`        
        success_message = `Unit Manager Feedback is updated`
        error_message = 'Unit Manager Feedback Not Found..Cannot Update Unit Manager Feedback'
    }
    
    // const agentId = req.params.agent_id
    //check if can_update is true then the edit can processed else throw and error
    const [canUpdate] = await pool.execute(
        `${canUpdateQuery}`,[who_give_feedback_id, who_receive_feedback_id, month,year]
    )

    if (!canUpdate[0].can_update) {
        return res.status(404).json({message: "You are not allowed to update your feedback response,Please contact your IT or Manager"})
    }
            
    try {
        const responsesJson = JSON.stringify(responses)

        const [result]  = await pool.execute(query, [responsesJson, feedback_score, total_score, percentage,who_give_feedback_id, who_receive_feedback_id, month, year])

        if (result.affectedRows === 0){
            return res.status(400).json({message: error_message})
        }


        res.status(201).json({
            message: success_message
        })
        
    }catch(error){
        console.error('Error Updating Agent Feedback records', error)
        res.status(500).json({error: 'Database Error' ,error_message})
    }
 }

 exports.getSalesFeedback = async (req, res, next) => {
    let givenMonth
    let givenYear 
    let fullyear = req.query.fullyear
    

    const export_to_excel = req.export_to_excel
    const currentDate = new Date()


    if (!req.query.month ||  req.query.month ==="") {
        
  
        givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }
    
    // const agentId = req.params.agent_id
    let agentId 
    let  who_receive_feedback_id
    let who_give_feedback_id
    let feedback_type = req.query.feedback_type


    if(req.params.id){
         who_receive_feedback_id  = req.params.id
    }else{
        if (req.query.agent_id || req.query.agent_id != '') {
            who_receive_feedback_id  = req.query.agent_id
        }else if (req.query.lm_id || req.query.lm_id != '') {
           who_receive_feedback_id  = req.query.lm_id
        }else if(req.query.manager_id || req.query.manager_id != ''){
            who_receive_feedback_id = req.query.manager_id
        }else if(req.query.who_give_feedback_id || req.query.who_give_feedback_id != ''){
            who_receive_feedback_id = req.query.who_give_feedback_id
        }
    }


    if(req.query.who_give_feedback_id || req.query.who_give_feedback_id != '') {
        who_give_feedback_id = req.query.who_give_feedback_id
    }


       

    let feedback_table
    let success_message
    let error_message
    let  who_receive_feedback_table_id 
    let who_give_feedback_table_id
    //  let who_give_feedback_id
    let query_feedback_month
    let query_feedback_year



 // Convert "March" -> "03"
    const monthNumber = monthMap[givenMonth];
    if (!monthNumber) {
      return res.status(400).json({ error: "Invalid givenMonth format" });
    }


  const snapshot = `${givenYear}-${monthNumber.toString().padStart(2, '0')}`;


    if(feedback_type === "agent_by_lm"){
        feedback_table = 'feedback_agents_by_lm' 
        success_message = ``
        error_message = 'Error fetching Agent Feedback records'
        who_receive_feedback_table_id = 'agent_id' 
        who_give_feedback_table_id = 'lm_id'
    
        
        // // get his or her manager 
        const [manager] = await pool.execute(
            `SELECT aa.manager_id
                FROM sales_agents2 sa
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id
                WHERE sa.id = ?;`, [snapshot, snapshot,who_receive_feedback_id]
        )
        if (manager.length > 0) {
            who_give_feedback_id = manager[0].manager_id
        }

    
    query_feedback_month =
            `
    
                SELECT 
                    sa.id AS who_give_feedback_id,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name AS who_give_feedback_name,
                    sa.email,
                    sa.image_link,
                    aa.agent_type,
                    r.role_name AS agent_role,
                    aa.manager_id,
                    mgr.db_name AS manager_dbname,
                    mr.role_name AS manager_role,
                    m.id AS market_id,
                    m.name AS market_name,
                    t.id AS team_id,
                    t.name AS team_name,
                    ae.status AS employee_status,
                    COALESCE(fbalm.feedback_score, 0) AS feedback_score,
                    COALESCE(fbalm.responses, "{}") AS responses,
                    COALESCE( fbalm.month, ?) AS month,
                    COALESCE(fbalm.year, ?) AS  year,
                    fbalm.agent_id AS who_receive_feedback_id,
                    fbalm.agent_dbname,
                    fbalm.can_update  
                FROM sales_agents2 sa
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) aa2 ON aa1.agent_id = aa2.agent_id 
                        AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                        AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) ae2 ON ae1.agent_id = ae2.agent_id 
                        AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                    AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                    AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN feedback_agents_by_lm fbalm
                ON sa.id = fbalm.lm_id
                AND fbalm.month = ?
                AND fbalm.year = ?
                AND fbalm.agent_id = ?
                WHERE sa.id =  ${who_give_feedback_id}
                ORDER BY fbalm.year DESC, fbalm.month DESC
                
           `

        query_feedback_year  = `
        SELECT 
            sa.id AS who_give_feedback_id,
            sa.firstname,
            sa.lastname,
            sa.image_link,
            sa.db_name AS who_give_feedback_name,
            sa.manager_id,
            COALESCE(fbalm.feedback_score, 0) AS feedback_score,
             COALESCE(fbalm.responses, "{}") AS responses,
            fbalm.month,
            COALESCE(fbalm.year, ?)  AS year,
             fbalm.agent_id AS who_receive_feedback_id,
            fbalm.agent_dbname,
            fbalm.can_update
        FROM sales_agents sa
        LEFT JOIN feedback_agents_by_lm fbalm
            ON sa.id = fbalm.lm_id
        AND fbalm.year =  ?
        AND fbalm.agent_id = ?
        WHERE sa.id = ${who_give_feedback_id}
       
      `

      

    }else if(feedback_type === "lm_by_agent"){
        feedback_table = 'feedback_lm_by_agents' 
        success_message = ``
        error_message = 'Error fetching Local Manager Feedback records'
        who_receive_feedback_table_id = 'lm_id'
        who_give_feedback_table_id = 'agent_id'



        query_feedback_month = `
       
                SELECT 
                    sa.id AS who_give_feedback_id,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name  AS who_give_feedback_name,
                    sa.email,
                    sa.image_link,
                    aa.agent_type,
                    r.role_name AS agent_role,
                    aa.manager_id,
                    mgr.db_name AS manager_dbname,
                    mr.role_name AS manager_role,
                    m.id AS market_id,
                    m.name AS market_name,
                    t.id AS team_id,
                    t.name AS team_name,
                    ae.status AS employee_status,   -- ✅ always latest status
                    COALESCE(fba.feedback_score, 0) AS feedback_score,
                    COALESCE(fba.responses, "{}") AS responses,
                    COALESCE(fba.month, ?)  AS month,  -- ✅ fallback to param if NULL
                    COALESCE(fba.year,  ?)  AS year,   -- ✅ fallback to param if NULL
                    fba.percentage,
                    fba.total_score,
                    fba.lm_id AS who_receive_feedback_id,
                    fba.can_update 
                FROM sales_agents2 sa
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                            AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) aa2 ON aa1.agent_id = aa2.agent_id 
                        AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                            AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) ae2 ON ae1.agent_id = ae2.agent_id 
                        AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                        AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN feedback_lm_by_agents fba 
                    ON sa.id = fba.agent_id
                AND aa.manager_id = fba.lm_id
                AND fba.month = ?
                AND fba.year = ?
                WHERE aa.manager_id = ?
                ORDER BY fba.year ASC, LPAD(fba.month, 2, '0') ASC;        
        `

        query_feedback_year = `
         SELECT 
            sa.id AS who_receive_feedback_id,
            sa.firstname,
            sa.lastname,
            sa.image_link,
            sa.db_name AS who_receive_feedback_name,
            sa.manager_id AS lm_id,
            COALESCE(fba.feedback_score, 0) AS feedback_score,
             COALESCE(fba.responses, "{}") AS responses,
            fba.month, 
            fba.percentage,
            fba.total_score,
            COALESCE(fba.year,  ?)  AS year,
            fba.lm_id AS who_receive_feedback_id,
            fba.can_update
        FROM sales_agents sa
        LEFT JOIN feedback_lm_by_agents fba 
            ON sa.id = fba.agent_id
        AND sa.manager_id = fba.lm_id
        AND fba.year = ?
        WHERE sa.manager_id = ?
        `

    }else if(feedback_type === "lm_by_um"){
        feedback_table = 'feedback_lm_by_um' 
        success_message = ``
        error_message = 'Error fetching Local Manager Feedback records'

        who_receive_feedback_table_id = 'lm_id'
        who_give_feedback_table_id = 'manager_id'
       
        
                // get his or her manager 
               // // get his or her manager 
        const [manager] = await pool.execute(
            `SELECT aa.manager_id
                FROM sales_agents2 sa
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id
                WHERE sa.id = ?;`, [snapshot, snapshot,who_receive_feedback_id]
        )
        if (manager.length > 0) {
            who_give_feedback_id = manager[0].manager_id
        }

      
        
        query_feedback_month = `
        
            SELECT 
                sa.id AS who_give_feedback_id,
                sa.firstname,
                sa.lastname,
                sa.db_name  AS who_give_feedback_name,
                sa.email,
                sa.image_link,
                aa.agent_type,
                r.role_name AS agent_role,
                aa.manager_id,
                mgr.db_name AS manager_dbname,
                mr.role_name AS manager_role,
                m.id AS market_id,
                m.name AS market_name,
                t.id AS team_id,
                t.name AS team_name,
                COALESCE(fblmum.feedback_score, 0) AS feedback_score,
                COALESCE(fblmum.responses, "{}") AS responses,
                COALESCE(fblmum.month, ?)  AS month,
                COALESCE(fblmum.year, ?)  AS year,
                fblmum.total_score,
                fblmum.percentage,
                fblmum.lm_id AS who_receive_feedback_id,
                fblmum.lm_dbname,
                fblmum.can_update
            FROM sales_agents2 sa
            JOIN (
                SELECT aa1.*
                FROM agent_assignments aa1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_assignments
                    WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) aa2 ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
            ) aa ON sa.id = aa.agent_id
            JOIN (
                SELECT ae1.*
                FROM agent_employments ae1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_employments
                    WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                        AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) ae2 ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
            ) ae ON sa.id = ae.agent_id
            LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
            LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
            LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
            AND maa.id = (
                SELECT MAX(id) 
                FROM agent_assignments 
                WHERE agent_id = mgr.id
                    AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                    AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
            )
            LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
            LEFT JOIN markets m ON aa.market_id = m.id
            LEFT JOIN teams t ON aa.team_id = t.id
            LEFT JOIN feedback_lm_by_um fblmum
                ON sa.id = fblmum.manager_id
            AND fblmum.month = ?
            AND fblmum.year = ?
            AND fblmum.lm_id = ?
            WHERE sa.id = ${who_give_feedback_id}
            ORDER BY fblmum.year, fblmum.month
        `
       
       query_feedback_year = `
        SELECT 
            sa.id AS who_give_feedback_id,
            sa.firstname,
            sa.lastname,
            sa.image_link,
            sa.db_name AS who_give_feedback_name,
            COALESCE(fblmum.feedback_score, 0) AS feedback_score,
            COALESCE(fblmum.responses, "{}") AS responses,
            fblmum.month,
            COALESCE(fblmum.year, ?)  AS year,
            fblmum.total_score,
            fblmum.percentage,
            fblmum.lm_id AS who_receive_feedback_id,
            fblmum.lm_dbname,
            fblmum.can_update
        FROM sales_agents sa
        LEFT JOIN feedback_lm_by_um fblmum
            ON sa.id = fblmum.manager_id
        AND fblmum.year = ?
        AND fblmum.lm_id = ?
        WHERE sa.id = ${who_give_feedback_id}
        
        `
    }else if(feedback_type === "um_by_lm"){
     
       
        feedback_table = 'feedback_um_by_lm' 
        success_message = ``
        error_message = 'Error fetching Local Manager Feedback records'
        who_receive_feedback_table_id = 'um_id'
        who_give_feedback_table_id = 'lm_id'



        query_feedback_month = `
        
               SELECT 
                    sa.id AS who_give_feedback_id,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name  AS who_give_feedback_name,
                    sa.email,
                    sa.image_link,
                    aa.agent_type,
                    r.role_name AS agent_role,
                    aa.manager_id,
                    mgr.db_name AS manager_dbname,
                    mr.role_name AS manager_role,
                    m.id AS market_id,
                    m.name AS market_name,
                    t.id AS team_id,
                    t.name AS team_name,
                    COALESCE(fbumlm.feedback_score, 0) AS feedback_score,
                    COALESCE(fbumlm.responses, '{}') AS responses,
                    COALESCE(fbumlm.month, ?)  AS month,
                    COALESCE(fbumlm.year, ?)  AS year,
                    fbumlm.total_score,
                    fbumlm.percentage,
                    fbumlm.um_id AS who_receive_feedback_id,
                    fbumlm.can_update
                FROM sales_agents2 sa
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                            AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) aa2 ON aa1.agent_id = aa2.agent_id 
                        AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                            AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) ae2 ON ae1.agent_id = ae2.agent_id 
                        AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                        AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id

                LEFT JOIN feedback_um_by_lm fbumlm
                    ON sa.id = fbumlm.lm_id
                AND aa.manager_id = fbumlm.um_id
                AND fbumlm.month = ?
                AND fbumlm.year = ?
                WHERE aa.manager_id = ? 
                    AND sa.id != 2394 
                ORDER BY fbumlm.year, fbumlm.month

        `

        query_feedback_year = `
          SELECT 
            sa.id AS who_giv_feedback_id,
            sa.firstname,
            sa.lastname,
            sa.image_link,
            sa.db_name as who_give_feedback_name,
            sa.manager_id as um_id,
            COALESCE(fbumlm.feedback_score, 0) AS feedback_score,
            COALESCE(fbumlm.responses, {}) AS responses,
            fbumlm.total_score,
            fbumlm.percentage,
            fbumlm.month,
            COALESCE(fbumlm.year, ?)  AS year,
            fbumlm.um_id AS who_receive_feedback_id,
            fbumlm.can_update
        FROM sales_agents sa
        LEFT JOIN feedback_um_by_lm fbumlm
            ON sa.id = fbumlm.lm_id
        AND sa.manager_id = fbumlm.um_id
        AND fbumlm.year = ?
        WHERE sa.manager_id = ? AND sa.id != 2394;
        
        `

    }

   
    try {
        if(fullyear == 'true' || fullyear == true){

            if(req.user.login_type == 'salesagentuser' && !req.query.is_sales_admin ){
                
                const [result] = await pool.execute(
                    `SELECT * FROM  ${feedback_table} WHERE ${who_give_feedback_table_id}=? AND ${who_receive_feedback_table_id}=?   AND year=?`,[who_give_feedback_id,who_receive_feedback_id,givenYear]  

                )
                // connection.release()
                result.sort((a,b) => {
                    return monthNames.indexOf(a.month.charAt(0).toUpperCase() + a.month.slice(1).toLowerCase()) - 
                    monthNames.indexOf(b.month.charAt(0).toUpperCase() + b.month.slice(1).toLowerCase());
                })
                if(export_to_excel){
                    return result
                }else{
                
                    res.json(result)  
                }
            }

            if(req.user.login_type == 'standarduser' || (req.is_sales_admin && req.user.agent_type == 2)){
                console.log('if rustan is user must came here')
                const [result] = await pool.execute(
                   
                query_feedback_year,[givenYear,givenYear,who_receive_feedback_id]
                )
                // connection.release()
                result.sort((a,b) => {
                    return monthNames.indexOf(a.month.charAt(0).toUpperCase() + a.month.slice(1).toLowerCase()) - 
                    monthNames.indexOf(b.month.charAt(0).toUpperCase() + b.month.slice(1).toLowerCase());
                })
                if(export_to_excel){
                    return result
                }else{
                
                    res.json(result)  
                }
            }            




        // monthly only not full year
        }else {
            if((req.user.login_type == 'salesagentuser' && !req.query.is_sales_admin) || req.query.admin_view_only == 'true'){
            
                const [result] = await pool.execute(
                `SELECT * FROM  ${feedback_table} WHERE ${who_give_feedback_table_id}=? AND ${who_receive_feedback_table_id}=?  AND month=? AND year=?`,[who_give_feedback_id,who_receive_feedback_id,givenMonth,givenYear]  
                // query_feedback_month,[givenMonth,givenYear, givenMonth,givenYear,who_receive_feedback_id]
                )
                // connection.release()
                
                if(export_to_excel){
                    return result
                }else{
                  
                  return  res.json(result)
                    
                
                }
            }

            if(req.user.login_type == 'standarduser' || (req.query.is_sales_admin && req.user.agent_type ==2)){
               
                const [result] = await pool.execute(
                
                query_feedback_month,[givenMonth,givenYear, snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, givenMonth,givenYear,who_receive_feedback_id]
                )
                // connection.release()
                
                if(export_to_excel){
                    return result
                }else{
                   
                    res.json(result)
                    
                
                }

              
            }      
            
    

        
        }
    }catch(error){
        console.error(error_message, error)
        res.status(500).json({error: 'Database Error' ,error_message})
    }

  

 }

 exports.removeSalesFeedback = async(req,res, next) => {
    const agentId = req.params.agent_id
    const feedbackDate = req.body.date 
    const lmId = req.body.lm_id 
    const month = req.body.month 
    const year = req.body.year
    const direction = req.body.direction

    let feedback_table
    let success_message
    let error_message
    if(direction === "agent_by_lm"){
        feedback_table = 'feedback_agents_by_lm' 
        success_message = `Agent Feedback deleted successfully`
        error_message = 'Agent Feedback Not Found, Or Cannot Delete Agent Feedback'
    }else if(direction === "lm_by_agent"){
        feedback_table = 'feedback_lm_by_agents' 
        success_message = `Local Manager Feedback deleted successfully`
        error_message = 'Local Manager Feedback Not Found, Or Cannot Delete Local Manager Feedback'
    }

    try {
        const query = `DELETE FROM ${feedback_table} WHERE agent_id=? AND lm_id=? AND date=? AND month=? AND year=?`
        const [result] = await pool.execute(query, [agentId, lmId,  feedbackDate, month, year])

        if (result.affectedRows === 0){
            return res.status(400).json({message: error_message})
        }

        res.status(200).send({ message: success_message });
    }
    catch(error) {``
        console.error('Error deleting agent feedback:', error)
        res.status(500).json({error: 'Database Error', error_message})
    }
 }



 //CONTROLLER FEEDBACK BY QA
 exports.addAgentsFeedbackByQa = async (req, res, next) => {
    
    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
   
    const { qa_id , qa_dbname, agent_id, agent_dbname, role, feedback_score, date, month,year} = req.body


    
        try {

            
            const query = "INSERT INTO feedback_by_qa (qa_id , qa_dbname, agent_id, agent_dbname, qa_role, feedback_score, date, month,year) VALUES (?,?,?,?,?,?,?,?,?)"
            const [result]  = await pool.execute(query, [qa_id , qa_dbname, agent_id, agent_dbname,role, feedback_score,  date, month,year])

            res.status(201).json({
                message: `New Feedback By QA  for agent_id: ${agent_id}  are created or recorded`
            })
            
        }catch(error){
            console.error('Error inserting new feedback records', error)
            res.status(500).json({error: 'Database Error, Cannot create Agent Feedback'})
        }  

 }

 exports.updateAgentsFeedbackByQa = async (req, res, next) => {

    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

    const { qa_id , qa_dbname, agent_id, agent_dbname, role, feedback_score,  date, month,year} = req.body
    const agentId = req.params.agent_id

  

         
    try {
        
        const query = "UPDATE feedback_by_qa  SET  feedback_score=?, qa_id=?, qa_dbname=?, date=? WHERE agent_id=?  AND month=? AND year=? "

        const [result]  = await pool.execute(query, [ feedback_score, qa_id, qa_dbname, date, agent_id, month, year])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Feedback Not Found..'})
        }


        res.status(201).json({
            message: `Sales Agent Feedback is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent Feedback records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Agent Feedback '})
    }
 }

 exports.getAgentsFeedbackByQa = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let givenMonth
    let givenYear 
    const currentDate = new Date()
    const export_to_excel = req.export_to_excel
   
    let fullyear = req.query.fullyear
   
   
    if (!req.query.month ||  req.query.month ==="") {
        
        givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }
    
    //const agentId = req.params.agent_id

    let agentId 
    if(req.params.agent_id){
        agentId = req.params.agent_id
    }else{
        agentId = req.query.agent_id
    }

    // const connection =  await pool.getConnection()
    if(fullyear == 'true' || fullyear == true){
        const [result] = await pool.execute(
            'SELECT * FROM  `feedback_by_qa` WHERE agent_id=? AND year=?',[agentId,givenYear]  
        )
        if(export_to_excel){
            req.qa_feedback = result 
            next()
        }else{
           
            res.json(result)
    
        }
    }else{
        const [result] = await pool.execute(
            'SELECT * FROM  `feedback_by_qa` WHERE agent_id=? AND month=? AND year=?',[agentId,givenMonth,givenYear]  
        )
        if(export_to_excel){
            req.qa_feedback = result 
            next()
        }else{
           
            res.json(result)
    
        }
    }

    
 }

 exports.getAllAgentsFeedbackByQaOrByAdmin = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const  path = req.path

    const currentDate = new Date()
    let month 
    let year
    if (!req.query.month ||  req.query.month ==="") {
        
        month =  monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        month = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        year =  currentDate.getFullYear()
    }else {
        year = req.query.year
    }



 // Convert "March" -> "03"
    const monthNumber = monthMap[month];
    if (!monthNumber) {
      return res.status(400).json({ error: "Invalid givenMonth format" });
    }


  const snapshot = `${year}-${monthNumber.toString().padStart(2, '0')}`;
  let query 
    try {
    if(path == '/feedback_by_qa/all'){
        query = 
        `
            SELECT 
                sa.id AS id,
                sa.firstname,
                sa.lastname,
                sa.db_name,
                sa.email,
                sa.image_link,
                aa.agent_type,
                r.role_name AS agent_role,
                aa.manager_id,
                mgr.db_name AS manager_dbname,
                mr.role_name AS manager_role,
                m.id AS market_id,
                m.name AS market_name,
                t.id AS team_id,
                t.name AS team_name,
                ae.status AS employee_status,
                COALESCE(fbyqa.feedback_score, 'No Feedback') AS feedback,
                COALESCE(fbyqa.month, ?) AS month,
                COALESCE(fbyqa.year, ?) AS year,
                COALESCE(ses.month, ?) AS eval_month,
                COALESCE(ses.year, ?) AS eval_year,
                COALESCE(ses.submitted, 0) AS submitted,
                fbyqa.qa_id, 
                fbyqa.qa_dbname
            FROM sales_agents2 sa
            JOIN (
                SELECT aa1.*
                FROM agent_assignments aa1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_assignments
                    WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                    AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                AND aa1.id = aa2.latest_id
            ) aa ON sa.id = aa.agent_id
            JOIN (
                SELECT ae1.*
                FROM agent_employments ae1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_employments
                    WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                    AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                AND ae1.id = ae2.latest_id
            ) ae ON sa.id = ae.agent_id
            LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
            LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
            LEFT JOIN agent_assignments maa 
                ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                        AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                )
            LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
            LEFT JOIN markets m ON aa.market_id = m.id
            LEFT JOIN teams t ON aa.team_id = t.id
            LEFT JOIN feedback_by_qa AS fbyqa 
                ON sa.id = fbyqa.agent_id
                AND fbyqa.month = ?
                AND fbyqa.year = ?
            LEFT JOIN sales_evaluation_status ses 
                ON ses.agent_id = sa.id
                AND ses.month = ?
                AND ses.year  = ?        
            

        `
    }else if(path == '/feedback_by_admin/all'){
        query = 
        `
            SELECT 
                sa.id AS id,
                sa.firstname,
                sa.lastname,
                sa.db_name,
                sa.email,
                sa.image_link,
                aa.agent_type,
                r.role_name AS agent_role,
                aa.manager_id,
                mgr.db_name AS manager_dbname,
                mr.role_name AS manager_role,
                m.id AS market_id,
                m.name AS market_name,
                t.id AS team_id,
                t.name AS team_name,
                ae.status AS employee_status,
                COALESCE(fbyad.feedback, 'No Feedback') AS feedback,
                COALESCE(fbyad.month, ?) AS month,
                COALESCE(fbyad.year, ?) AS year,
                COALESCE(ses.month, ?) AS eval_month,
                COALESCE(ses.year, ?) AS eval_year,
                COALESCE(ses.submitted, 0) AS submitted,
                fbyad.admin_id, 
                fbyad.admin_dbname
            FROM sales_agents2 sa
            JOIN (
                SELECT aa1.*
                FROM agent_assignments aa1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_assignments
                    WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                    AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                AND aa1.id = aa2.latest_id
            ) aa ON sa.id = aa.agent_id
            JOIN (
                SELECT ae1.*
                FROM agent_employments ae1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_employments
                    WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                    AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                AND ae1.id = ae2.latest_id
            ) ae ON sa.id = ae.agent_id
            LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
            LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
            LEFT JOIN agent_assignments maa 
                ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                        AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                )
            LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
            LEFT JOIN markets m ON aa.market_id = m.id
            LEFT JOIN teams t ON aa.team_id = t.id
            LEFT JOIN feedback AS fbyad 
                ON sa.id = fbyad.agent_id
                AND fbyad.month = ?
                AND fbyad.year = ?
            LEFT JOIN sales_evaluation_status ses 
                ON ses.agent_id = sa.id
                AND ses.month = ?
                AND ses.year  = ?    
            

        `     
    }

        const [result] = await pool.execute(
   
            query,
            [month,year, month, year,snapshot, snapshot, snapshot, snapshot, snapshot,snapshot ,month, year, month, year]
        )

        console.log(result)

        res.json(result)
    } catch (error) {
        console.error('Error fetching agent feedback:', error)
        res.status(500).json({ error: 'Database Error, Cannot Fetch Agent Feedback' })
    }
 }

 exports.removeAgentsFeedbackByQa = async(req,res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log('the body need to deleted', req.body)
    const agentId = req.body.id
    const qaId = req.body.qa_id
    const month = req.body.month 
    const year = req.body.year

    try {
        const query = "DELETE FROM feedback_by_qa WHERE agent_id=? AND qa_id=?  AND month=? AND year=?"
        const [result] = await pool.execute(query, [agentId, qaId,  month, year])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Feedback Not found'})
        }

        res.status(200).send({ message: 'Agent Feedback By Qa deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent feedback:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Feedback'})
    }
 }





