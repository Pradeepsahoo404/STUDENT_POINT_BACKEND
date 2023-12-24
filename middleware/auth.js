const jwt = require("jsonwebtoken");
require("dotenv").config()
const User = require('../models/user');

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

//is student
exports.isStudent = async (req , res , next) => {
    try{
        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success : false,
                message : "This is protected route for student only"
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "User role connot be verified , please try again"
        })
        }
    }


    exports.isInstructor = async (req , res , next) => {
        try{
            if(req.user.accountType !== 'Instructor'){
                return res.status(401).json({
                    success : false,
                    message : "This is protected route for Instructor only"
                })
            }
            next();
        }
        catch(err){
            return res.status(500).json({
                success : false,
                message : "User role connot be verified , please try again"
            })
            }
        }

        exports.adminAuth = async (req , res , next) => {
            try{
                if(req.user.accountType !== 'Admin'){
                    return res.status(401).json({
                        success : false,
                        message : "This is protected route for Admin only"
                    })
                }
                next();
            }
            catch(err){
                return res.status(500).json({
                    success : false,
                    message : "User role connot be verified , please try again"
                })
                }
            }