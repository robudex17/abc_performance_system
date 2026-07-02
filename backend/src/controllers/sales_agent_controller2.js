const e = require('express')
const pool = require('../config/db')
const { validationResult} = require('express-validator')
const fs = require('fs')
const path = require('path')

const { uploadToMinio } = require('../middleware/fileupload_to_minio')  // updated import

exports.fetchSalesAgents = async (req,res, next ) => {
    
   
    //query his/her manager or senior manager
    if (req.user.role == 'manager' && req.user.agent_type == 1 && req.query.feedback_type == 'um_by_lm'){
        
        try{
            // const connection =  await pool.getConnection()
    
            const [rows, fields] = await pool.execute(


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
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role,
                    DATE_FORMAT(aa.effective_from, '%Y-%m-%d') AS effective_from,
                    DATE_FORMAT(aa.effective_to, '%Y-%m-%d') AS effective_to,  
                    DATE_FORMAT(ae.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(ae.end_date, '%Y-%m-%d') AS end_date,
                    CASE  
                        WHEN ae.status = 'Hired' 
                            AND EXISTS (
                                SELECT 1
                                FROM agent_employments ae2
                                WHERE ae2.agent_id = sa.id
                                AND ae2.status = 'Resigned'
                                AND ae2.id < ae.id
                            )
                        THEN 'Rehired'
                        ELSE ae.status
                    END AS employee_status
                    
                FROM sales_agents2 sa
                -- latest assignment per agent (by id)
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id

                -- latest employment per agent (by id)
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        GROUP BY agent_id
                    ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id

                -- agent role
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id

                -- manager details (self-join + role)
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id

                -- market and team
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id

                -- only currently Hired (or Rehired)
                 WHERE ae.status = 'Hired'  AND sa.id =?;

                `,[req.user.manager_id]
            )
            // connection.release()
            res.json(rows)
        }catch(error){
            console.error('Error In Fetching Active Agents', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
        }  

    //query his/her agents
    }else if (req.user.role == 'manager'  && req.user.agent_type == 1 && req.query.feedback_type == 'agent_by_lm'){
        console.log('this came in this option?')
        try{
            // const connection =  await pool.getConnection()
    
            const [rows, fields] = await pool.execute(
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
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role,
                    DATE_FORMAT(aa.effective_from, '%Y-%m-%d') AS effective_from,
                    DATE_FORMAT(aa.effective_to, '%Y-%m-%d') AS effective_to,  
                    DATE_FORMAT(ae.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(ae.end_date, '%Y-%m-%d') AS end_date,
                    CASE  
                        WHEN ae.status = 'Hired' 
                            AND EXISTS (
                                SELECT 1
                                FROM agent_employments ae2
                                WHERE ae2.agent_id = sa.id
                                AND ae2.status = 'Resigned'
                                AND ae2.id < ae.id
                            )
                        THEN 'Rehired'
                        ELSE ae.status
                    END AS employee_status
                    
                FROM sales_agents2 sa
                -- latest assignment per agent (by id)
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id

                -- latest employment per agent (by id)
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        GROUP BY agent_id
                    ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id

                -- agent role
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id

                -- manager details (self-join + role)
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id

                -- market and team
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id

                -- only currently Hired (or Rehired)
                 WHERE ae.status = 'Hired'  AND  aa.manager_id=?;

                `,[req.user.login_id]

            )
            // connection.release()
            res.json(rows)
        }catch(error){
            console.error('Error In Fetching Active Agents', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
        }  
     // if the role is admin or  role is manager and agent_type is 2
    
    }
    //query only his/her local manager agents are not included
    else if (req.user.role == 'manager' && req.user.agent_type == 2 && req.query.feedback_type =='lm_by_um'){
        try{
            // const connection =  await pool.getConnection()
    
            const [rows, fields] = await pool.execute(
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
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role,
                    DATE_FORMAT(aa.effective_from, '%Y-%m-%d') AS effective_from,
                    DATE_FORMAT(aa.effective_to, '%Y-%m-%d') AS effective_to,  
                    DATE_FORMAT(ae.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(ae.end_date, '%Y-%m-%d') AS end_date,
                    CASE  
                        WHEN ae.status = 'Hired' 
                            AND EXISTS (
                                SELECT 1
                                FROM agent_employments ae2
                                WHERE ae2.agent_id = sa.id
                                AND ae2.status = 'Resigned'
                                AND ae2.id < ae.id
                            )
                        THEN 'Rehired'
                        ELSE ae.status
                    END AS employee_status
                    
                FROM sales_agents2 sa
                -- latest assignment per agent (by id)
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id

                -- latest employment per agent (by id)
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        GROUP BY agent_id
                    ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id

                -- agent role
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id

                -- manager details (self-join + role)
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id

                -- market and team
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id

                -- only currently Hired (or Rehired)
                 WHERE ae.status = 'Hired'  AND  aa.manager_id=? AND sa.id !=?

                `,[req.user.login_id, req.user.login_id]
            )
            // connection.release()
            res.json(rows)
        }catch(error){
            console.error('Error In Fetching Active Agents', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
        }  
    }
    //agent query his/her local manager
    else if(req.user.role == 'user' && req.user.agent_type == 0 && req.query.feedback_type == 'lm_by_agent'){
        try{
            // const connection =  await pool.getConnection()
    
            const [rows, fields] = await pool.execute(
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
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role,
                    DATE_FORMAT(aa.effective_from, '%Y-%m-%d') AS effective_from,
                    DATE_FORMAT(aa.effective_to, '%Y-%m-%d') AS effective_to,  
                    DATE_FORMAT(ae.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(ae.end_date, '%Y-%m-%d') AS end_date,
                    CASE  
                        WHEN ae.status = 'Hired' 
                            AND EXISTS (
                                SELECT 1
                                FROM agent_employments ae2
                                WHERE ae2.agent_id = sa.id
                                AND ae2.status = 'Resigned'
                                AND ae2.id < ae.id
                            )
                        THEN 'Rehired'
                        ELSE ae.status
                    END AS employee_status
                    
                FROM sales_agents2 sa
                -- latest assignment per agent (by id)
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id

                -- latest employment per agent (by id)
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        GROUP BY agent_id
                    ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id

                -- agent role
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id

                -- manager details (self-join + role)
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id

                -- market and team
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id

                -- only currently Hired (or Rehired)
                 WHERE ae.status = 'Hired'  AND  sa.id=?;

                 `,[req.user.manager_id]
            )
            // connection.release()
            res.json(rows)
        }catch(error){
            console.error('Error In Fetching Active Agents', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
        }  
    }
    else if(req.user.role=='admin' || req.user.role== 'poweruser' || (req.user.role == 'manager' && req.user.agent_type ==2)) {
        try{
            const employeeStatus = req.query.employee_status || 'Hired'

          
            const [result] = await pool.execute(
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
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
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role,
                    DATE_FORMAT(aa.effective_from, '%Y-%m-%d') AS effective_from,
                    DATE_FORMAT(aa.effective_to, '%Y-%m-%d') AS effective_to,  
                    DATE_FORMAT(ae.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(ae.end_date, '%Y-%m-%d') AS end_date,
                    CASE  
                        WHEN ae.status = 'Hired' 
                            AND EXISTS (
                                SELECT 1
                                FROM agent_employments ae2
                                WHERE ae2.agent_id = sa.id
                                AND ae2.status = 'Resigned'
                                AND ae2.id < ae.id
                            )
                        THEN 'Rehired'
                        ELSE ae.status
                    END AS employee_status
                    
                FROM sales_agents2 sa
                -- latest assignment per agent (by id)
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        GROUP BY agent_id
                    ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id

                -- latest employment per agent (by id)
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        GROUP BY agent_id
                    ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id

                -- agent role
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id

                -- manager details (self-join + role)
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id

                -- market and team
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id

                -- only currently Hired (or Rehired)
                 WHERE ae.status = '${employeeStatus}'
                 ORDER BY start_date;

                `

                //    WHERE ae.status = 'Hired' || ae.status = 'Resigned';
            )
            // connection.release()

          const agents = result.map(agent => ({
            ...agent,
            active_agent: agent.employee_status === 'Hired' || agent.employee_status === 'Rehired'
            }));

           if(req.export_to_excel){
           
            req.agents = agents 
            next()
           }else{
              return res.json(agents)
           }


        }catch(error){
            console.error('Error In Fetching Active Agents', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
        }  
    }else {
        res.json([])
    }
   
}



exports.fetchSalesAgent = async( req,res, next) => {
    const export_to_excel = req.export_to_excel
   
    let agentId 
    try {
        // const connection = await pool.getConnection()
        //const agentId = req.params.agent_id
     

        if(req.params.agent_id){
            agentId = req.params.agent_id
        }else{
            agentId = req.query.agent_id
        }

        const [rows, fields] = await pool.execute(

     `
        SELECT 
            sa.id AS id,
            sa.firstname,
            sa.lastname,
            sa.db_name,
            sa.email,
            sa.image_link,
            aa.id AS assignment_id,
            aa.agent_type,
            r.role_name AS agent_role,
            aa.manager_id,
            mgr.db_name AS manager_dbname,
            mr.role_name AS manager_role,
            m.id AS market_id,
            m.name AS market_name,
            t.id AS team_id,
            t.name AS team_name,
            sales_agents_login.username,
            sales_agents_login.status as login_status,
            sales_agents_login.role,
            
            DATE_FORMAT(aa.effective_from, '%Y-%m-%d') AS effective_from,
            DATE_FORMAT(aa.effective_to, '%Y-%m-%d') AS effective_to,  
            DATE_FORMAT(ae.start_date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(ae.end_date, '%Y-%m-%d') AS end_date,
            CASE  
                WHEN ae.status = 'Hired' 
                    AND EXISTS (
                        SELECT 1
                        FROM agent_employments ae2
                        WHERE ae2.agent_id = sa.id
                        AND ae2.status = 'Resigned'
                        AND ae2.id < ae.id
                    )
                THEN 'Rehired'
                ELSE ae.status
            END AS employee_status

        FROM sales_agents2 sa

        -- get ALL employments
        JOIN agent_employments ae 
            ON sa.id = ae.agent_id

        -- get ALL assignments that overlap with the employment period
        JOIN agent_assignments aa 
            ON sa.id = aa.agent_id
        AND (
                (ae.end_date IS NULL AND aa.effective_from >= ae.start_date)
                OR
                (ae.end_date IS NOT NULL 
                AND aa.effective_from BETWEEN ae.start_date AND ae.end_date)
        )

        -- agent role
        LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id

        -- manager details
        LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
        LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
        AND maa.id = (
            SELECT MAX(id) 
            FROM agent_assignments 
            WHERE agent_id = mgr.id
        )
        LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id

        -- market and team
        LEFT JOIN markets m ON aa.market_id = m.id
        LEFT JOIN teams t ON aa.team_id = t.id
        LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id

        WHERE sa.id = ?   -- 🔹 filter for your agent

        ORDER BY aa.effective_from DESC;

            
     `,[agentId]
        )
    
        if(export_to_excel){
            req.agent_info = rows
            req.agent_type = rows[0].agent_type
            next()
        }else{
            
          
            res.json(rows)
        }
      
        
    }catch(error){
        console.error(`Error In Fetching Agent with agent_id of ${agentId}`, error)
        res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
    }  

}

exports.addNewSalesAgent = async( req, res, next) => {
    const connection  = await pool.getConnection()
    
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{
        console.log('All input is valid..')
    }

   const { id,firstname, lastname, db_name, email, manager_id, agent_type, market_id, team_id, start_date } = req.body

   
    
    let imageLink = ""

    if (!req.file) {
        // default image — also served from MinIO
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/sbtlogo.png`
    } else {
        // upload to MinIO and get back the filename
        const filename = await uploadToMinio(req.file)
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/${filename}`
    }

    // Check if there is atleast 1 senior manager in the system if there is none then the first agent to be created must be a senior manager 


    try {
        
        await connection.beginTransaction()


          // Check if there is atleast 1 senior manager in the system if there is none then the first agent to be created must be a senior manager 

        const [seniorManagerCountResult] = await connection.execute(
            `SELECT COUNT(*) AS active_manager_count FROM agent_assignments aa JOIN agent_employments ae 
             ON aa.agent_id = ae.agent_id WHERE aa.agent_type = ? AND ae.status IN ('Hired', 'Rehired') AND ae.end_date IS NULL`,
            [2]
        )

        const activeManagerCount = seniorManagerCountResult[0].active_manager_count;

        if (activeManagerCount === 0 && agent_type != 2) {
            await connection.rollback();
            return res.status(400).json({ error: 'The first sales agent must be a Senior Manager (agent_type = 2) since there are no active Senior Managers in the system.' });
        }


        const [agentResult]  = await pool.execute(

            `INSERT INTO sales_agents2 ( id, firstname, lastname, db_name, email, image_link) VALUES (?,?,?,?,?,?)`,
            [id,firstname, lastname, db_name, email, imageLink]
        )

        // const agentId = agentResult.insertId

        const [employmentResult] = await connection.execute(
            `INSERT INTO agent_employments (agent_id, status, start_date, end_date) VALUES (?, ?, ?, ?)`,
            [id, 'Hired', start_date, null]
        );


        const [assignmentResult] = await connection.execute(
            `INSERT INTO agent_assignments (agent_id, manager_id, agent_type, market_id, team_id, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, manager_id, agent_type, market_id, team_id, start_date, null]
        );


          // Commit transaction
        await connection.commit()

        res.status(201).json({ message: "Agent and related details added successfully." });

    }catch(error){
     await connection.rollback();
    console.error('Error inserting New Agents records', error);

    if (error.code === 'ER_DUP_ENTRY') {
        console.log('I will return this error duplicate key message')
        return res.status(400).json({ error: 'Agent ID already exists. Please use a unique ID.' });
    }

    res.status(500).json({ error: 'Failed to add new agent. Please try again later.' });
    } finally {
        connection.release()
    } 
}
exports.updateSalesAgent = async (req, res, next) => {
    const connection = await pool.getConnection();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
  
    // console.log(req.body)
    // return
    const { 
        id, firstname, lastname, db_name, email, image_link,
        agent_type, manager_id, market_id, team_id,  end_date, start_date, 
        employee_status, changed_assignment, active_agent,  effective_to,  effective_from, changed_info, changed_date_hire,
    } = req.body;


    if(req.file){
        const filename = await uploadToMinio(req.file)
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/${filename}`
    }else{
        imageLink = image_link
    }

    //there is file change info into true

    const messageArray = []
  
    // console.log(req.body)
    // return

  try {
        await connection.beginTransaction();

        //make sure dont accidentally edit the resigned employee with active_agent = 'false'

        if(employee_status == 'Resigned' && active_agent == 'false'){
            return res.status(400).json({ message: "Cannot Edit update the agent with Resigned status and active_agent = 'false" });
        }

        // Update sales_agents2
        if(changed_info == 'true'){
        
         await connection.execute(
            `UPDATE sales_agents2 
            SET firstname=?, lastname=?, db_name=?, email=?, image_link=? 
            WHERE id=?`,
            [firstname, lastname, db_name, email, imageLink, id]

           
        );
         messageArray.push('Agent Information is udpated')
        }
           

        if(changed_date_hire == 'true'){
      
          await connection.execute(
            `UPDATE agent_employments 
            SET start_date=?
            WHERE agent_id=? AND status=?  AND end_date IS NULL`,
            [ start_date, id, employee_status]
         );
           messageArray.push('Agent Date Hired is updated')
        }
   
   
       
        // Case 1: Resignation
        if (employee_status === 'Resigned' && end_date && effective_to && active_agent == 'true' ) {
            
   
        // Close current employment
        await connection.execute(
            `UPDATE agent_employments 
            SET status=?, end_date=? 
            WHERE agent_id=? AND end_date IS NULL`,
            [employee_status, effective_to, id]
        );

        // Close current assignment
        await connection.execute(
            `UPDATE agent_assignments 
            SET effective_to=? 
            WHERE agent_id=? AND effective_to IS NULL`,
            [ effective_to,id]
        );

        
        await connection.commit();
        messageArray.push("Agent status is now resigned")
        return res.status(201).json(messageArray);
        }



        // Case 2: Transfer
        if (changed_assignment== 'true' && (employee_status == 'Hired' || employee_status == 'Rehired') && active_agent == 'true'    ) {
            // Close old assignment
            await connection.execute(
                `UPDATE agent_assignments 
                SET effective_to=? 
                WHERE agent_id=? AND effective_to IS NULL`,
                [effective_to, id]
            );

            // Insert new assignment
            await connection.execute(
                `INSERT INTO agent_assignments 
                (agent_id, agent_type, market_id, team_id, manager_id, effective_from, effective_to) 
                VALUES (?, ?, ?, ?, ?, ?, NULL)`,
                [id, agent_type, market_id, team_id, manager_id, effective_from]
            );



            await connection.commit();
            messageArray.push("Agent has new Assignments")
            return  res.status(201).json(messageArray);
        }

        

        //Case 3 Rehired

        if(employee_status == 'Rehired' && active_agent == 'false' && start_date){
         const [employmentResult] = await connection.execute(
            `INSERT INTO agent_employments (agent_id, status, start_date, end_date) VALUES (?, ?, ?, ?)`,
            [id, 'Hired', start_date, null]
        );


        const [assignmentResult] = await connection.execute(
            `INSERT INTO agent_assignments (agent_id, manager_id, agent_type, market_id, team_id, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, manager_id, agent_type, market_id, team_id, start_date, null]
        );

           await connection.commit();
           messageArray.push('Agent is Rehired')
            return  res.status(201).json(messageArray);
           
        }

    await connection.commit();
     res.status(201).json(messageArray); 

    } catch (error) {
            await connection.rollback();
            console.error("Transaction failed:", error);
            res.status(500).json({ error: "Failed to update agent and details." });
    } finally {
            connection.release();
    }
};


exports.deleteSalesAgent = async (req, res, next) => {

    const { agent_id } = req.params 



    try {
        const [fetchAgentImageLink] = await pool.execute("SELECT image_link FROM sales_agents WHERE id=?",[agent_id])
        const [ agentImageLink] = fetchAgentImageLink
        
        const image_link = agentImageLink.image_link
        if(image_link != null || image_link != ""){
            // const filePath = new URL(image_link).pathname.substring(1)
            
            // Remove leading slash to avoid path issues
             const filePath = image_link.startsWith('/') ? image_link.substring(1) : image_link;
            //Construct absolute path
            const absolutePath = path.join(__dirname, '../', filePath)

            //Delete the agent Image file

            fs.unlink(absolutePath, (error) => {
                console.log(`File ${filePath} deleted successfully`)
            })
        }
        
        const query = "DELETE FROM sales_agents WHERE id=?"
        const [result] = await pool.execute(query, [agent_id])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent not ound'})
        }

        res.status(204).send({ message: 'Agent deleted successfully' })
    }
    catch(error) {
        console.error('Error deleting agent:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent'})
    }
}
