
const User = require("../models/user.js")
const jwt = require("jsonwebtoken")
require("dotenv").config();
const bcrypt = require("bcrypt");

exports.registerUser = async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.firstName || !userData.lastName || !userData.username || !userData.email || !userData.password) {
            return res.status(400).json({
                status: "fail",
                message: "All fields are required"
            });
        }

        const existUser = await User.findOne({ email: userData.email });
        if (existUser) {
            return res.status(400).json({
                status: "fail",
                message: "This email is already registered, please try another"
            });
        }

        const hashpassword = await bcrypt.hash(userData.password, 12);
        const savedUser = new User({ ...userData, password: hashpassword, re_type_password: "" });
        const data = await savedUser.save(); 

        return res.status(200).json({
            data: savedUser,
            status: "Success",
            message: "Customer is created"
        });
    } catch (err) {
        return res.status(500).json({
            status: "fail",
            message: "Error during registration"
        });
    }
};




exports.loginUser = async(req , res)=> {
    try{
        const loginData = req.body;

        if(!loginData.email || !loginData.password){
            res.status(400).json({
                status : "fail",
                message : "all fields are required"
            })
        }
        const existUser = await User.findOne({email : loginData.email});
        if(!existUser){
            res.status(400).json({
                status : "fail",
                message : "This email is not register please try again"
            })
        }


        if(await bcrypt.compare(loginData.password , existUser.password)){
            const payload = {
                _id : existUser._id,
                email : existUser.email,
                username : existUser.username
            }
            const token = jwt.sign(payload , process.env.JWT_SECRET ,{
                expiresIn : "24h",
            })

            existUser.token = token;
            existUser.password = undefined

            const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			}; 

            const updateUserWithToken = await User.findByIdAndUpdate(
                existUser._id,
                { $set: { token } },
                { new: true }
            );

            res.cookie("token" , token , options).status(200).json({
                success : true,
                token,
                message : "Login successfully",
                data : updateUserWithToken
              })

        }
        else{
            return res.status(401).json({
                success : false,
                message : "Password is incorrect"
            })
        }}
        catch(err){
            return res.status(500).json({
            success : false,
            message : "Login Failure Please try again"
            })
        }
}