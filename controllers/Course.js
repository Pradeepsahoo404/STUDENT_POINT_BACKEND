const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config()
exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, category , tag } = req.body;
        const thumbnail  = req.files.thumbnail;

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }
        console.log(thumbnail)

        const userId = req.user.id;
        const instructorDetail = await User.findById(userId);

        if (!instructorDetail) {
            return res.status(400).json({
                success: false,
                message: "Instructor details not found or user is not an instructor"
            });
        }

        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category details not found"
            });
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetail._id,
            whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url
        });

        await User.findByIdAndUpdate(instructorDetail._id, { $push: { courses: newCourse._id } }, { new: true });
        await Category.findByIdAndUpdate(categoryDetails._id, { $push: { course: newCourse._id } }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error : err.message
        });
    }
};

exports.getAllCourse = async(req, res)=>{
    try{
        const allCourse = await Course.find({} , {courseName : true , price: true , thumbnail : true , instructor: true , studentEnrolled: true})
        .populate("instructor").exec();
        return res.status(500).json({
            success: true,
            data : allCourse,
            message : "data for all course successfully retrived"
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Failed to get all course",
            error : err.message
        });
    }
}

exports.getCourseDetails = async (req, res) => {
    try{
        const courseId = req.body.courseId;
        const courseDetail = await Course.findById(courseId).populate({
            path: "instructor",
            populate : {
                path : "additionDetail",
        }
        })
        .populate("ratingAndReviews")
        .populate("category")
        .populate({
            path : "courseContent",
            populate : {
                path : "subSection"
            }
        });

        if(!courseDetail){
            return res.status(400).json({
                success: false,
                message: `could not find with the course with ${courseId}`,
            });
        }


        return res.status(200).json({
            success: true,
            message: `course details successfully fetched`,
            data : courseDetail
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Failed to get  course Details",
            error : err.message
        });
    }
}