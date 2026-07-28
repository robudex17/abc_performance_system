const pool = require('../config/db')
const { validationResult } = require('express-validator')
const fs = require('fs')
const path = require('path')

// Change this import at the top
const {  uploadToMinio } = require('../middleware/fileupload_to_minio')  // updated import

exports.fetchStandardUsers = async (req,res, next ) => {
    try{
        // const connection =  await pool.getConnection()

        const [rows, fields] = await pool.execute(
            // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
            `
            SELECT 
                su.id AS id,
                su.firstname,
                su.lastname,
                su.db_name,
                su.image_link,
                su.status as agent_status,
                standard_users_login.username,
                standard_users_login.status as login_status,
                standard_users_login.role
            FROM standard_users su
            LEFT JOIN standard_users_login ON su.id = standard_users_login.login_id
            WHERE su.status=? AND su.id != 9999

            `,['active']
        )
        // connection.release()
        res.json(rows)
    }catch(error){
        console.error('Error In Fetching Active Agents', error)
        res.status(500).json({error: 'Database Error, Error In Fetching Active Agents'})
    }  
}


exports.addNewStandardUser = async( req, res, next) => {
    // const connection  = await pool.getConnection()
    
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{
        console.log('All input is valid..')
    }

    const userId  = req.body.id
     
    const agentFirstname = req.body.firstname 
    const agentLastname = req.body.lastname 
    const agentDbname = req.body.db_name 
    
    let imageLink = ""
    // if (!req.file) {
    //       imageLink = "/images/sbtlogo.png" 
    // }else {
    //      // Construct the URL for the uploaded image
    //   imageLink = `/images/${req.file.filename}`;
    // }

    if (!req.file) {
        // default image — also served from MinIO
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/sbtlogo.png`
    } else {
        // upload to MinIO and get back the filename
        const filename = await uploadToMinio(req.file)
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/${filename}`
    }

    try {

          // check if user already exist
    
          const [ userExists ] = await pool.execute('SELECT * FROM standard_users where id=? OR db_name =?', [userId,agentDbname])
    
          if( userExists.length > 0  && userExists){
              return res.status(400).json({'message': 'User already exists'})
          }

        const query = "INSERT INTO standard_users ( id, firstname,lastname,db_name,image_link) VALUES (?,?,?,?,?)"
        const [result]  = await pool.execute(query, [userId,agentFirstname,agentLastname,agentDbname,imageLink])

        res.status(201).json({
            message: `New Standard User  is created..`
        })
        
    }catch(error){
        console.error('Error inserting New Standard User records', error)
        res.status(500).json({message: 'Database Error, Cannot New Standard User'})
    }  
}

exports.updateStandardUser= async( req, res, next) => {
    // const connection  = await pool.getConnection()
    
    
    console.log(req.body)
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{
        console.log('All input is valid..')
    }

    const userId  = req.params.user_id
  
  
    const agentFirstname = req.body.firstname 
    const agentLastname = req.body.lastname 
    const agentDbname = req.body.db_name 
    let imageLink = req.body.image_link

   
    if (req.file) {
        // imageLink = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        // imageLink = `/images/${req.file.filename}`;
        // upload to MinIO and get back the filename
        const filename = await uploadToMinio(req.file)
        imageLink = `http://${process.env.S3_ENDPOINT}:${process.env.S3_PORT}/${process.env.S3_BUCKET}/${filename}`
    }

    try {
        const query = "UPDATE  standard_users SET  firstname=?, lastname=?, db_name=?, image_link=? WHERE id=?"
        
        const [result]  = await pool.execute(query, [agentFirstname,agentLastname,agentDbname,imageLink,userId])

        res.status(201).json({
            message: `Standard User Info is updated`
        })
        
    }catch(error){
        console.error('Error Updating Standard User records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Standard User'})
    }  
}

exports.deleteStandardUser = async (req, res, next) => {
    
    console.log(req.params)
    const { user_id } = req.params 



    try {
        const [fetchStandUserImageLink] = await pool.execute("SELECT image_link FROM standard_users WHERE id=?",[user_id])
        const [ standardUserImageLink ] = fetchStandUserImageLink
        
        const image_link = standardUserImageLink.image_link
        if(image_link != null || image_link != ""){
            // const filePath = new URL(image_link).pathname.substring(1)

            const filePath = image_link.startsWith('/') ? image_link.substring(1) : image_link;
            
            //Construct absolute path
            const absolutePath = path.join(__dirname, '../', filePath)

            //Delet the agent Image file

            fs.unlink(absolutePath, (error) => {
                console.log(`File ${filePath} deleted successfully`)
            })
        }
        
        const query = "DELETE FROM standard_users WHERE id=?"
        const [result] = await pool.execute(query, [user_id])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Standard User not ound'})
        }

        res.status(204).send({ message: 'Standard User deleted successfully' })
    }
    catch(error) {
        console.error('Error deleting standard user:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Standard User'})
    }
}
