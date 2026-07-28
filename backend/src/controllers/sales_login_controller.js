const pool =  require('../config/db')

const { validationResult } = require('express-validator')
const bcyrpt = require('bcrypt')


const { generateAccessToken,  decodedToken } = require('../utils/generate_token')

exports.registerUser = async(req,res,next) => {
    console.log('the register body is ', req.body)
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        
        const { login_id, username, password, role, status} = req.body 
        

        // check if user already exist
    
        const [ userExists ] = await pool.execute('SELECT * FROM sales_agents_login where login_id=?', [login_id])
    
        if( userExists.length > 0  && userExists){
            return res.status(400).json({'message': 'User already exists'})
        }
    
        const hashedPassowrd = await bcyrpt.hash(password, 10)

        const [ insertResult ] = await pool.execute(
                            `INSERT INTO sales_agents_login (login_id, username, password_hash, status, role) 
                            VALUES(?, ? ,? , ? ,?) `, [login_id, username, hashedPassowrd,status, role])
                     
        if (insertResult.affectedRows === 1){
           return res.status(201).json({message: 'User registered successfully'})
        }
     
        
    }catch(error){
        console.log('There is an error in user registration', error)
       return res.status(400).json({ message: 'There is an error in user registration' });
    }
  
}


exports.updateLogin = async(req,res,next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        const { login_id, username, password, role, status} = req.body 
        
   
        if (password != "" ) {
            console.log('I still here??')
            
            const hashedPassowrd = await bcyrpt.hash(password, 10)
            const [ result ] = await pool.execute(`UPDATE sales_agents_login SET username=?, status=?, role=? , password_hash=? WHERE login_id=? `, 
                                      [username, status, role, hashedPassowrd, login_id ]

                                     )
             if (result.affectedRows === 0){
                    return res.status(400).json({message: 'Failed to update agent login'})
                }
        }else {
            console.log('I came here')
            const [ result ] = await pool.execute(`UPDATE sales_agents_login SET username=?, status=?, role=?  WHERE login_id=? `, 
                [username, status, role,  login_id ]

               )
            if (result.affectedRows === 0){
                return res.status(400).json({message: 'Failed to update agent login'})
            }
        }
        
        res.status(201).json({
            message: `Agent Login is updated..`
        })
     
        
    }catch(error){
        console.log('Failed to update agent login', error)
       return res.status(400).json({ message: 'Failed to update agent login' });
    }
  
}

exports.loginUser = async(req,res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try{
       //find user
       const { username, password, loginas} = req.body
       
       console.log('the login body is ', req.body)

       const query = "SELECT * FROM sales_agents_login WHERE username=?"
       const [loginUser] = await pool.execute(query, [username])
   
       if(!loginUser || !(await bcyrpt.compare(password, loginUser[0].password_hash))){
         return res.status(401).json({message: 'Invalid Credentials'})
       }

       if (loginUser[0].status === 'inactive' || loginUser[0].status === 'suspended'){
         return res.status(403).json({message: `Your account is ${loginUser[0].status} login is not allow`})
       }

       const loginId = loginUser[0].login_id

       // join the login and sales_agents where login.login_id = sales_agents.id
    //    const [user] = await pool.execute(
    //     `
    //     SELECT 
    //             sales_agents_login.login_id AS login_id,
    //             sales_agents_login.username AS username,
    //             sales_agents_login.password_hash,
    //             sales_agents_login.role AS role,
    //             sales_agents.manager_id,
    //             sales_agents.agent_type,
    //             sales_agents.firstname,
    //             sales_agents.lastname,
    //             sales_agents.db_name,
    //             sales_agents.market_id,
    //             sales_agents.team_id,
    //             sales_agents.image_link
    //         FROM sales_agents_login
    //         INNER JOIN sales_agents ON sales_agents_login.login_id = sales_agents.id
    //         WHERE sales_agents_login.login_id = ?
    //    `, [loginId]
    //     )


    const [user]  = await pool.execute(

        `
                SELECT 
                sa.id AS login_id,
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

        `,[loginId]
    )


       if(user[0].employee_status == 'Resigned'){
        return  res.status(401).json({message: `${user[0].firstname} ${user[0].lastname} is already Resigned. Resigned Staff is not allowed to login..`})
       }
        
       if(user[0].role == 'user' && loginas != 'salesagent'){
           return res.status(401).json({message: `Your are not allowed to login as ${loginas}`})
       }

       if(user[0].role == 'manager' && user[0].agent_type == 1 && loginas != 'lm'){
         return res.status(401).json({message: `Your are not allowed to login as ${loginas}`})
       }

       if(user[0].role == 'manager' && user[0].agent_type == 2 && loginas != 'unitmanager'){
         return res.status(401).json({message: `Your are not allowed to login as ${loginas}`})
       }

    
       console.log('the user is ', user[0])


       user[0].login_type = 'salesagentuser'




       const accessToken = generateAccessToken(user[0])
    //    const refreshToken = generateRefreshToken(user[0])
       

       // for security reason you hash the refresh token before saving it in the database..
    //    const hashedToken  = await bcyrpt.hash(refreshToken, 10)
  
       
    //    const [saveToken] = await pool.execute('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', [user[0].login_id, hashedToken])

    //    if (saveToken.affectedRows === 1){
        // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax' })
    //     res.json({accessToken})
    //    }
  
     return res.json({accessToken})

    }catch(error){
        console.log('User cannot login', error)
        return res.status(400).json({ message: 'There is an error in user login' })
    }
    
}

// exports.refreshToken = async ( req, res, next) => {
//     const refreshToken = req.cookies.refreshToken 
//     const loginId = req.body.login_id

//     console.log(req.cookies)

//     console.log(refreshToken)
//     if(!refreshToken){
//         return res.status(401).json({message: 'No refresh token provided'})
//     }
  
//     //fetch and check the stored refresh token from database
//     const [ storedToken ] = await pool.execute("SELECT * FROM refresh_tokens WHERE user_id=? AND revoked=0 LIMIT 1", [loginId])
   
//     if (!storedToken || storedToken.length == 0){
//         return res.status(403).json({message: 'Invalid or No refresh token. Or Refresh Token has been revoked'})
//     }
    
//     // if(storedToken[0].revoked == 1){
//     //     return res.status(403).json({message: 'Refresh token has been revoked'})
//     // }
   
//     //compare the refreshToken from the reqest from hashToken stored in the database if the token is match
//     const  isMath =  await  bcyrpt.compare(  refreshToken, storedToken[0].token)
    
//     if (!isMath){
//          // Clear the refresh token cookie
//          res.clearCookie('refreshToken');
//         return res.status(403).json({message: 'Refresh Token has been tampered..'})
//     }

//     try {
//         const decodedRefreshToken =  decodedToken(refreshToken)

//         // Generate new access token 
//         const accesstoken =  generateAccessToken(decodedRefreshToken)
//         res.json({accesstoken})
        
//     }catch(error){
//         console.log('Invalid or expired refresh token', error)
//           // Clear the refresh token cookie
//         res.clearCookie('refreshToken');
//         return res.status(403).json({message: 'Invalid or expired refresh token'})
//     }
// }

exports.logoutUser = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken 
    const loginId = req.body.login_id
    try {
        if(!refreshToken){
            return res.status(400).json({message: 'No refresh token provided'})
        }
    
         //fetch and check the stored refresh token from database
         const [ storedToken ] = await pool.execute("SELECT * FROM refresh_tokens WHERE user_id=? AND revoked=0 LIMIT 1", [loginId])
    
         if (!storedToken){
           
            return res.status(403).json({message: 'Invalid refresh token, Token has been already revoked'})
        }
    
         
        // Revoke the token 
        // const [revokeToken ] = await pool.execute("UPDATE refresh_tokens SET revoked= TRUE WHERE user_id=?", [storedToken[0].user_id])
        
        //Delete token 
        const  [deleteToken] = await pool.execute("DELETE FROM refresh_tokens WHERE user_id=?", [loginId])

        if (deleteToken.affectedRows === 1){

            // Clear the refresh token cookie
            res.clearCookie('refreshToken');

            res.json({ message: 'Logged out successfully' });
        }

    }catch(error){
        console.log('Error in user logout', error)
        return res.status(403).json({message: 'There is an error in user logout'})
    }
    



}

// exports.verifyToken = async (req, res, next) => {
//     const token = req.body.token 

// }