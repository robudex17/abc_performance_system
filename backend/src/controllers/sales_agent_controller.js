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
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
                `
                SELECT 
                    sa.id AS id,
                    sa.manager_id,
                    sa.agent_type,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name,
                    sa.image_link,
                    sa.market_id,
                    sa.status as agent_status,
                    market.market_name,
                    managers.db_name AS manager_name,
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role
                FROM sales_agents sa
                JOIN market ON sa.market_id = market.id
                JOIN managers ON sa.manager_id = managers.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id
                WHERE sa.status = ? AND sa.id = ?
    
                `,['active', req.user.manager_id]
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
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
                `
                SELECT 
                    sa.id AS id,
                    sa.manager_id,
                    sa.agent_type,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name,
                    sa.image_link,
                    sa.market_id,
                    sa.status as agent_status,
                    market.market_name,
                    managers.db_name AS manager_name,
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role
                FROM sales_agents sa
                JOIN market ON sa.market_id = market.id
                JOIN managers ON sa.manager_id = managers.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id
                WHERE sa.status = ? AND sa.manager_id =?
    
                `,['active', req.user.login_id]
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
    else if (req.user.role == 'manager' && req.user.agent_type == 2 && req.query.give_feedback =='lm'){
        try{
            // const connection =  await pool.getConnection()
    
            const [rows, fields] = await pool.execute(
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
                `
                SELECT 
                    sa.id AS id,
                    sa.manager_id,
                    sa.agent_type,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name,
                    sa.image_link,
                    sa.market_id,
                    sa.status as agent_status,
                    market.market_name,
                    managers.db_name AS manager_name,
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role
                FROM sales_agents sa
                JOIN market ON sa.market_id = market.id
                JOIN managers ON sa.manager_id = managers.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id
                WHERE sa.status = ? AND sa.manager_id =?  AND sa.id !=?
    
                `,['active', req.user.login_id, req.user.login_id]
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
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
                `
                SELECT 
                    sa.id AS id,
                    sa.manager_id,
                    sa.agent_type,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name,
                    sa.image_link,
                    sa.market_id,
                    sa.status as agent_status,
                    market.market_name,
                    managers.db_name AS manager_name,
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role
                FROM sales_agents sa
                JOIN market ON sa.market_id = market.id
                JOIN managers ON sa.manager_id = managers.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id
                WHERE sa.status = ? AND sa.id=?
    
                `,['active', req.user.manager_id]
            )
            // connection.release()
            res.json(rows)
        }catch(error){
            console.error('Error In Fetching Active Agents', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
        }  
    }
    else if(req.user.role=='admin' || (req.user.role == 'manager' && req.user.agent_type ==2)) {
        try{
            
            const [rows, fields] = await pool.execute(
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
                `
                SELECT 
                    sa.id AS id,
                    sa.manager_id,
                    sa.agent_type,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name,
                    sa.image_link,
                    sa.market_id,
                    sa.status as agent_status,
                    market.market_name,
                    managers.db_name AS manager_name,
                    sales_agents_login.username,
                    sales_agents_login.status as login_status,
                    sales_agents_login.role
                FROM sales_agents sa
                JOIN market ON sa.market_id = market.id
                JOIN managers ON sa.manager_id = managers.id
                LEFT JOIN sales_agents_login ON sa.id = sales_agents_login.login_id
                WHERE sa.status = ?
    
                `,['active']
            )
            // connection.release()
            res.json(rows)
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

    try {
        // const connection = await pool.getConnection()
        //const agentId = req.params.agent_id
        let agentId 

        if(req.params.agent_id){
            agentId = req.params.agent_id
        }else{
            agentId = req.query.agent_id
        }

        const [rows, fields] = await pool.execute(
            // 'SELECT * FROM  `sales_agents` WHERE status=? AND id=?',['active',agentId]

            `
            SELECT 
                sa.id AS id,
                sa.manager_id,
                sa.agent_type,
                sa.firstname,
                sa.lastname,
                sa.db_name,
                sa.image_link,
                sa.market_id,
                sa.status,
                market.market_name,
                managers.db_name AS manager_name
            FROM sales_agents sa
            JOIN market ON sa.market_id = market.id
            JOIN managers ON sa.manager_id = managers.id
            WHERE sa.status = ?  AND sa.id=?

            `,['active', agentId]
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
    // const connection  = await pool.getConnection()
    
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{
        console.log('All input is valid..')
    }

    const agentId  = req.body.id
    const mangerId = req.body.manager_id 
    const agentType = req.body.agent_type 
    const agentFirstname = req.body.firstname 
    const agentLastname = req.body.lastname 
    const agentDbname = req.body.db_name 
    const agentMarketId = req.body.market_id
     
    let imageLink = ""
    if (!req.file) {
        // default image — also served from MinIO
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/sbtlogo.png`
    } else {
        // upload to MinIO and get back the filename
        const filename = await uploadToMinio(req.file)
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/${filename}`
    }


    try {
        const query = "INSERT INTO sales_agents ( id, manager_id,agent_type,firstname,lastname,db_name,image_link,market_id) VALUES (?,?,?,?,?,?,?,?)"
        const [result]  = await pool.execute(query, [agentId, mangerId,agentType,agentFirstname,agentLastname,agentDbname,imageLink,agentMarketId])

        res.status(201).json({
            message: `New Sales Agent for is created..`
        })
        
    }catch(error){
        console.error('Error inserting New Agents records', error)
        res.status(500).json({error: 'Database Error, Cannot New Agents'})
    }  
}

exports.updateSalesAgent = async( req, res, next) => {
    // const connection  = await pool.getConnection()
    
    
    console.log(req.body)
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{
        console.log('All input is valid..')
    }

    const agentId  = req.params.agent_id
    const mangerId = req.body.manager_id 
    const agentType = req.body.agent_type 
    const agentFirstname = req.body.firstname 
    const agentLastname = req.body.lastname 
    const agentDbname = req.body.db_name 
    const marketId = req.body.market_id
    let imageLink = req.body.image_link

   

    if (req.file) {
      // upload to MinIO and get back the filename
        const filename = await uploadToMinio(req.file)
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/${filename}`
    }

    try {
        const query = "UPDATE sales_agents SET manager_id=?, agent_type=?, firstname=?, lastname=?, db_name=?, image_link=?, market_id=? WHERE id=?"
        
        const [result]  = await pool.execute(query, [mangerId,agentType,agentFirstname,agentLastname,agentDbname,imageLink,marketId,agentId])

        res.status(201).json({
            message: `Sales Agent Info is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Agent'})
    }  
}

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
