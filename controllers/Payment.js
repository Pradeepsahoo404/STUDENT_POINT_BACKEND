const {instance} = require("../config/razorpay")
const Course = require("../models/Course")
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const courseEnrollmentEmail = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
exports.capturePayment = async (req, res) => {
    //get courseId and UserID
    const {course_id} = req.body;
    const userId = req.user.id;
    //validation
    //valid courseID
    if(!course_id) {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        })
    };
    //valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course) {
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }

        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            });
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }
    };

   try{
        const paymentResponce = instance.orders.create(options);
        console.log(paymentResponce);
        return res.status(200).json({
            success:true,
            courseName : course.courseName,
            courseDescription : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponce.id,
            currency :paymentResponce.currency,
            amount : paymentResponce.amount
        });
   }
   catch(err){
    return res.status(500).json({
        success:false,
        message:"could not initiate order",
    });
   }
    

};

exports.verifySignature = async(req , res) => {
    const webhookSecret = '123456789';

    const signature = req.header["x-rayzorpay-signature"];

   const shasum =  crypto.createHmac("sha256" , webhookSecret);
   shasum.update(JSON.stringify(req.body));
   let digest = shasum.digest('hex');

   if(signature === digest){
        console.log("payment is authorised");
        
        const {courseId , userId} = req.body.payload.payment.entity.notes;

        try{
            const enrolledCourse = await Course.findByIdAndUpdate({_id : courseId} , {$push : {studentEnrolled : userId}} , {new : true});
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found",
                });
            }
            console.log(enrolledCourse);

            const enrolledStudent = await User.findByIdAndUpdate({_id : userId} , {$push : {courses : courseId}} , {new : true});
            if(!enrolledStudent){
                return res.status(500).json({
                    success:false,
                    message:"Student not found",
                });
            }
            console.log(enrolledStudent);

            //mail sending
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations, you are onboarded into new CodeHelp Course",
                     );
                    console.log(emailResponse);
                    return res.status(200).json({
                    success:true,
                    message:"Signature Verified and COurse Added",
                    });
        }
        catch(err){
            return res.status(500).json({
                success:false,
                message:err.message,
                });
        }
   }
   else{
    return res.status(400).json({
        success:false,
        message:"invalid Request",
        });
   }

}