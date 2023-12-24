const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const crypto = require('crypto');
const bcrypt = require("bcrypt");
//resetPassword token
exports.resetPasswordToken = async (req, res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(401).json({ message: "Email is required" });
    }
    let user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    
    const token = crypto.randomBytes(20).toString('hex');
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExprires: new Date() + 5 * 60 * 1000,
      },
      { new: true }
    );
    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);
    
    return res.json({
      success: true,
      message:
        "Email Sent successfully , please check email and change password",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reset password",
    });
  }
};
//ResetPassword

exports.resetPassword = async(req , res) => {
    try{
        const {password , confirmPassword , token} = req.body;
        if(password !== confirmPassword){
            return res.json({
                success : false,
                message : "password and confirmPassword do not match"
            })
        }
        const userDetails = await User.findOne({token : token});
        console.log("userDetails");
        console.log(userDetails);
        if(!userDetails){
            return res.json({
                success : false,
                message : "Token is invalid"
            })
        }

        if(userDetails.resetPasswordExprires < Date.now()){
            return res.json({
                success : false,
                message : "Token is expired please regenerate your token"
            })
        }
        const hashPassword = await bcrypt.hash(password , 10);
        await User.findOneAndUpdate({token : token }, { password: hashPassword }, {new : true});

        return res.status(200).json({
            success : true,
            message : "password reset successfull"
        })
        
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset password",
          });
    }
}
