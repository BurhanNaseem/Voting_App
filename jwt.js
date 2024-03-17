const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=>{

    // first check request headers has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization){
        res.status(401).json({error : "Token not found"});
    }

    // extract the jwt token from request headers
    // token looks like --> bearer dkasjckcweioudhewdhhkckhcwiuehhhke
    const token = req.headers.authorization.split(' ')[1];

    if(!token){
        return res.status(401).json({error : "Unauthorized"});
    }

    try{
        // verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user information to the request object
        // req.user stores the decoded payload data of the token
        req.user = decoded;
        next();
    }
    catch(error){
        console.log(error);
        res.status(401).json({error : "Invalid Token"});
    }
};

// Generate JWT Token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn : 100000});
}

module.exports = {jwtAuthMiddleware, generateToken};