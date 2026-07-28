const jwt = require('jsonwebtoken')

exports.authenticateToken = async (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (!token){
        return res.status(401). json({message: 'Access Denied: No Token Provided' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err){
            return res.status(403).json({message: 'Invalid Access Token'})

        }
        // console.log(user)
        req.user = user
        next()
    })
}

exports.authorizeRoles = (...allowedRoles ) => {
    return (req,res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({message: 'Access Denied: Insufficient Permission'})
        }
        next()
    }
}