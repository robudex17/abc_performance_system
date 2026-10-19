const pool = require('../../config/db')
const { validationResult } = require('express-validator')

// The image of a standard user is saved like the image of an employee: only the FILE NAME of the MinIO bucket (the pages build the
// url with the image base url). A full url or an old '/images/...' path is reduced to its file name.
const { uploadToMinio, removeFromMinio } = require('../../middleware/fileupload_to_minio')

const DEFAULT_IMAGE = 'sbtlogo.png'
const fileNameOf = (imageLink) => String(imageLink ?? '').split('/').pop().trim()

// removes the file from MinIO unless another standard user or employee still uses it (the default image is never removed)
const removeImageIfUnused = async (imageLink) => {
    const name = fileNameOf(imageLink)
    if (!name || name === DEFAULT_IMAGE) return

    const like = '%' + name
    const [users] = await pool.execute('SELECT id FROM standard_users WHERE image_link LIKE ? LIMIT 1', [like])
    const [employees] = await pool.execute('SELECT id FROM employees WHERE image_link LIKE ? LIMIT 1', [like])
    if (users.length === 0 && employees.length === 0) await removeFromMinio(name)
}

exports.fetchAdminUsers = async (req,res, next ) => {
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


exports.addNewAdminUser = async( req, res, next) => {
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

    // the default image, or the uploaded one (MinIO): the file name is saved
    imageLink = DEFAULT_IMAGE
    if (req.file) {
        try {
            imageLink = await uploadToMinio(req.file)
        } catch (error) {
            console.error('Error uploading the standard user image to MinIO', error)
            return res.status(500).json({ error: 'Failed to upload the image. Please try again later.' })
        }
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

exports.updateAdminUser= async( req, res, next) => {
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
    // the image stays as it is (its file name), a new image goes to MinIO and the old one is removed when nobody uses it
    let imageLink = fileNameOf(req.body.image_link) || DEFAULT_IMAGE
    let oldImageLink = null

    try {
        if (req.file) {
            try {
                imageLink = await uploadToMinio(req.file)
            } catch (error) {
                console.error('Error uploading the standard user image to MinIO', error)
                return res.status(500).json({ error: 'Failed to upload the image. Please try again later.' })
            }
            const [current] = await pool.execute('SELECT image_link FROM standard_users WHERE id=?', [userId])
            oldImageLink = current[0]?.image_link
        }

        const query = "UPDATE  standard_users SET  firstname=?, lastname=?, db_name=?, image_link=? WHERE id=?"
        
        const [result]  = await pool.execute(query, [agentFirstname,agentLastname,agentDbname,imageLink,userId])

        if (oldImageLink && fileNameOf(oldImageLink) !== imageLink) await removeImageIfUnused(oldImageLink)

        res.status(201).json({
            message: `Standard User Info is updated`
        })
        
    }catch(error){
        console.error('Error Updating Standard User records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Standard User'})
    }  
}

exports.deleteAdminUser = async (req, res, next) => {
    
    console.log(req.params)
    const { user_id } = req.params 



    try {
        const [fetchStandUserImageLink] = await pool.execute("SELECT image_link FROM standard_users WHERE id=?",[user_id])
        const imageLink = fetchStandUserImageLink[0]?.image_link

        const query = "DELETE FROM standard_users WHERE id=?"
        const [result] = await pool.execute(query, [user_id])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Standard User not found'})
        }

        // remove the image from MinIO unless another user or employee uses the same file
        await removeImageIfUnused(imageLink)

        res.status(204).send({ message: 'Standard User deleted successfully' })
    }
    catch(error) {
        console.error('Error deleting standard user:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Standard User'})
    }
}
