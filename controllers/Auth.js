const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
require("dotenv").config()


//send otp
exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;

		// Check if user is already present
		// Find user with provided email
		const checkUserPresent = await User.findOne({ email });
		// to be used in case of signup

		// If user found with provided email
		if (checkUserPresent) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
		}

		var otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});
		const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);
		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ success: false, error: error.message });
	}
};

//sign Up
exports.signup = async (req, res) => {
    try {
        const Data = req.body;
        const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${Data.firstName} ${Data.lastName}`;

        if (!Data.firstName || !Data.lastName || !Data.email || !Data.contactNumber || !Data.password || !Data.confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (Data.password !== Data.confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword do not match, please try again"
            });
        }

        const existUser = await User.findOne({ "email": Data.email });
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        const recentOtp = await OTP.findOne({ email: Data.email }).sort({ createdAt: -1 });
        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "No recent OTP found"
            });
        } else if (Data.otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP does not match"
            });
        }

        const checkOtp = await OTP.find({otp : Data.otp});
        if(!checkOtp){
            return res.status(400).json({
            success : false,
            message : "OTP does not match"
            })
        }

        const hashPassword = await bcrypt.hash(Data.password, 10);
        const profileDetail = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const userData = new User({ ...Data, image: profileImage, password: hashPassword, additionDetail: profileDetail._id });
        const savedData = await userData.save();

        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            savedData
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "User registration failed",
            error: err.message
        });
    }
};


exports.login = async(req , res) => {
    try{
        const {email , password} = req.body;
         if(!email || !password){
            return res.status(403).json({
                success : false,
                message : "All fields are requires please try again"
            });
         }
        const user = await User.findOne({email});
        if(!user){
            return res.status(403).json({
                success : false,
               message : " User is not registered "
            });
        }
        if(await bcrypt.compare(password , user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload , process.env.JWT_SECRET ,{
                expiresIn : "24h",
            })
            user.token = token;
            user.password = undefined
            const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};  

            const updateUserWithToken = await User.findByIdAndUpdate(
                user._id,
                { $set: { token } },
                { new: true }
            );
            

            res.cookie("token" , token , options).status(200).json({
                success : true,
                token,
                message : "Login successfully",
                data : updateUserWithToken
              })
            }else{
                return res.status(401).json({
                    success : false,
                    message : "Password is incorrect"
                })
            }
        }
    catch(err){
        return res.status(500).json({
        success : false,
        message : "Login Failure Please try again"
        })
    }
}

exports.resetPassword = async(req, res) => {
    try{
        const id = req._id;
        const {oldPassword , newPassword , confirmPassword} = req.body;
        if(!oldPassword || !newPassword || !confirmPassword){
            return res.status(403).json({
             success : false,
             message : 'all fields are required'   
            })
        }
        const user = await User.findById({id});
        if(!user){
            return res.status(403).json({
                success : false,
               message : " User is not registered "
            });
        }
        const isMatch = await bcrypt.compare(oldPassword , user.password);
        if(!isMatch){
            return res.status(403).json({
                success : false,
               message : " Old password is incorrect "
            }); 
        }
        if(newPassword !== confirmPassword){
            return res.status(403).json({
            success : false,
            message : "New password and confirm password do not match"
            })
        }
        const hashPassword = await bcrypt.hash(newPassword , 10);
        const passwordChanged = await User.findByIdAndUpdate(id, { password: hashPassword });

        return res.status(200).json({
            success : true,
            message : "Password changed successfully"
            })


    }catch(error){
        return res.status(500).json({
         success : false,
         message : ""   
        });
    }
}

exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};