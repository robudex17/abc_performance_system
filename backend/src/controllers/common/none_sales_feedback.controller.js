
 exports.addNoneSalesFeedback = async (req, res, next) => {
    
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
          percentage, date, year_month,
          feedback_type
          } = req.body
    // const agentId = req.params.agent_id
    let success_message
    let error_message
    let query
    let feedback_table

    if(feedback_type === "by_member"){
        feedback_table = 'feedback_by_members'
        error_message = 'Database Error, Cannot create Member Feedback'
    }
    if(feedback_type === "by_head"){
        feedback_table = 'feedback_by_heads'
        error_message = 'Database Error, Cannot create Immediate Head Feedback'
    }
    query = `INSERT INTO ${feedback_table} (member_id , member_dbname, immediate_head_id, immediate_dbname, responses, feedback_score, total_score, percentage, date, year_month) VALUES (?,?,?,?,?,?,?,?,?,?)`
    success_message = `New Feedback for ${who_receive_feedback_db_name}  with id ${who_receive_feedback_id} are created or recorded`

        try {

            const responsesJson = JSON.stringify(responses)
            // const query = `INSERT INTO ${feedback_table} (lm_id , lm_dbname, agent_id, agent_dbname, responses, feedback_score, total_score, percentage, date, month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
            const [result]  = await pool.execute(query, [who_give_feedback_id, who_give_feedback_db_name, who_receive_feedback_id, who_receive_feedback_db_name, responsesJson, feedback_score, total_score, percentage, date, year_month])

            res.status(201).json({
                message: success_message
            })
            
        }catch(error){
            console.error('Error inserting new feedback records', error)
            res.status(500).json({error: error_message})
        }  

 }

 exports.updateNoneSalesFeedback = async (req, res, next) => {

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

      if(feedback_type === "by_member"){
        feedback_table = 'feedback_by_members'
        error_message = 'Database Error, Cannot Update Member Feedback'
        canUpdateQuery = `SELECT can_update FROM  ${feedback_table} WHERE member_id=? AND immediate_head_id=? AND year_month=?`
         query = `UPDATE ${feedback_table} SET  responses=?, feedback_score=?, total_score=?, percentage=?, can_update=0 WHERE member_id=? AND immediate_head_id=? AND year_month=?`
    }
    if(feedback_type === "by_head"){
        feedback_table = 'feedback_by_heads'
         query = `UPDATE ${feedback_table} SET  responses=?, feedback_score=?, total_score=?, percentage=?, can_update=0 WHERE  immediate_head_id=? AND member_id=? AND year_month=?`
         canUpdateQuery = `SELECT can_update FROM  ${feedback_table} WHERE immediate_head_id=? AND member_id=? AND year_month=?`
         error_message = 'Database Error, Cannot Update Immediate Head Feedback'
    }

   
    
    // const agentId = req.params.agent_id
    //check if can_update is true then the edit can processed else throw and error
    const [canUpdate] = await pool.execute(
        `${canUpdateQuery}`,[who_give_feedback_id, who_receive_feedback_id, year_month]
    )

    if (!canUpdate[0].can_update) {
        return res.status(404).json({message: "You are not allowed to update your feedback response,Please contact your IT or Manager"})
    }
            
    try {
        const responsesJson = JSON.stringify(responses)

        const [result]  = await pool.execute(query, [responsesJson, feedback_score, total_score, percentage,who_give_feedback_id, who_receive_feedback_id, year_month])

        if (result.affectedRows === 0){
            return res.status(400).json({message: error_message})
        }


        res.status(201).json({
            message: success_message
        })
        
    }catch(error){
        console.error('Error Updating None Sales Feedback records', error)
        res.status(500).json({error: 'Database Error' ,error_message})
    }
 }

 exports.getNoneSalesFeedback = async (req, res, next) => {
    let year_month 
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



exports.enableDisableDeleteNoneSalesFeedback = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
       
       const {
          who_give_feedback_id,
          who_receive_feedback_id,
          can_update,
          year_month,
          feedback_type,
          } = req.body
   
   
    let feedback_table
    let success_message
    let error_message
    let query
    if(feedback_type === "by_member"){
        feedback_table = 'feedback_by_members' 

        if(req.method === "PUT"){
            query = `UPDATE ${feedback_table} SET  can_update=${can_update} WHERE member_id=? AND immediate_head_id=? AND year_month=?`
            success_message = `Member can now udpate their feedback`
            error_message = 'Member Feedback Not Found..Cannot Update Member Feedback'
        }else if(req.method === "DELETE"){
            query = `DELETE FROM ${feedback_table} WHERE member_id=? AND immediate_head_id=? AND year_month=?`
            success_message = `Member Feedback is deleted`
            error_message = 'Member Feedback Not Found..Cannot Delete Member Feedback'
        }   

    }else if(feedback_type === "by_head"){

        feedback_table = 'feedback_by_heads' 
        if(req.method === "PUT"){
            query = `UPDATE ${feedback_table} SET  can_update=${can_update}  WHERE immediate_head_id=? AND member_id=? AND year_month=?`
            success_message = `Immediate Head can now udpate their feedback`
            error_message = 'Immediate Head Feedback Not Found..Cannot Update Immediate Head Feedback'
        }else if(req.method === "DELETE"){
            query = `DELETE FROM ${feedback_table} WHERE immediate_head_id=? AND member_id=? AND year_month=?`
            success_message = `Immediate Head Feedback is deleted`
            error_message = 'Immediate Head Feedback Not Found..Cannot Delete Immediate Head Feedback'
        }

    }


    try {
       

        const [result]  = await pool.execute(query, [who_give_feedback_id, who_receive_feedback_id, year_month])

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