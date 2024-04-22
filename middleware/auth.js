const jwt = require("jsonwebtoken");
require("dotenv").config()
const User = require('../models/user.js');

exports.auth = async (req , res , next) => {
    try{
        const token = req.cookies.token ||
                    req.body.token ||
                    req.header("Authorisation").replace("Bearer", '');

        //if token is missing
        if(!token){
        return res.status(403).json({
            success : false,
            message : "Token is missing"
        })
        }
        // verify if token
        try{
            const decode = jwt.verify(token , process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
         
        } catch(err){
            return res.status(401).json({
                success : false,
                message : "Token is invalid"
            })
        }
        next()

    }
    catch(err){
        return res.status(401).json({
            success : false,
            message : "something Went Wrong while validating the token"
        })
    }
}
