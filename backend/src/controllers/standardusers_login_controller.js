const pool =  require('../config/db')

const { validationResult } = require('express-validator')
const bcyrpt = require('bcrypt')


const { generateAccessToken,  decodedToken } = require('../utils/generate_token')

exports.registerUser = async(req,res,next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        const { login_id, username, password, role, status} = req.body 

        // check if user already exist
    
        const [ userExists ] = await pool.execute('SELECT * FROM standard_users_login where login_id=? || username=?', [login_id,username])
    
        if( userExists.length > 0  && userExists){
            return res.status(400).json({'message': 'User already exists'})
        }
    
        const hashedPassowrd = await bcyrpt.hash(password, 10)

        const [ insertResult ] = await pool.execute(
                            `INSERT INTO standard_users_login (login_id, username, password_hash, status, role) 
                         
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
        
     
        if (password.length != 0) {
           
            const hashedPassowrd = await bcyrpt.hash(password, 10)
            const [ result ] = await pool.execute(`UPDATE standard_users_login SET status=?, role=? , password_hash=? WHERE login_id=? AND username=? `, 
                                      [status, role, hashedPassowrd, login_id,username ]

                                     )
             if (result.affectedRows === 0){
                    return res.status(400).json({message: 'Failed to update user login'})
                }
        }else {
      
            const [ result ] = await pool.execute(`UPDATE standard_users_login SET status=?, role=?  WHERE login_id=? AND username=? `, 
                [status, role,  login_id,username ]

               )
            if (result.affectedRows === 0){
                return res.status(400).json({message: 'Failed to update user login'})
            }
        }
        
        res.status(201).json({
            message: `User Login is updated..`
        })
     
        
    }catch(error){
        console.log('Failed to update user login', error)
       return res.status(400).json({ message: 'Failed to update user login' });
    }
  
}

exports.loginUser = async(req,res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try{
       //find user
       const { username, password } = req.body
       
      

       const query = "SELECT * FROM standard_users_login WHERE username=?"
       const [loginUser] = await pool.execute(query, [username])
    
       
       if(!loginUser || !(await bcyrpt.compare(password, loginUser[0].password_hash))){
         return res.status(401).json({message: 'Invalid Credentials'})
       }

       if (loginUser[0].status === 'inactive' || loginUser[0].status === 'suspended'){
         return res.status(403).json({message: `Your account is ${loginUser[0].status} login is not allow`})
       }

       const loginId = loginUser[0].login_id

       // join the login and sales_agents where login.login_id = sales_agents.id
       const [user] = await pool.execute(
        `
        SELECT 
                standard_users_login.login_id AS login_id,
                standard_users_login.username AS username,
                standard_users_login.password_hash,
                standard_users_login.role AS role,
                standard_users.firstname,
                standard_users.lastname,
                standard_users.db_name,
                standard_users.image_link
              
            FROM standard_users_login
            INNER JOIN standard_users ON standard_users_login.login_id = standard_users.id
            WHERE standard_users_login.login_id = ?
       `, [loginId]
        )
     
 
       user[0].login_type = "standarduser"
       
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