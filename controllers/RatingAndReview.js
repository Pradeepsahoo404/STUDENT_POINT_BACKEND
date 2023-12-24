const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");


exports.createRating = async(req , res) => {
    try{
        const userId = req.user.id;
        const {rating , review , courseId} = req.body;
        const courseDetail = await Course.findOne({_id : courseId} , {studentEnrolled : {$elemMatch : {$eq : userId}}});

        if(!courseDetail){
            return res.status(404).json({
                success: false,
                message: "student does not enrolled in this course",
            });
        }

        const alreadyReviewed = await RatingAndReview.findOne({
            user : userId,
            course : courseId
        });
        if(!alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: "Course isn already reviewed by  the User",
            });
        }

        const ratingAndReviews = await RatingAndReview.create({
            rating,
            review,
            course : courseId,
            user : userId
        });

        await Course.findByIdAndUpdate({_id : courseId} , {$push : {ratingAndReviews:ratingAndReviews._id }} , {new : true});

        return res.status(200).json({
            success: true,
            message : "Rating And Reviews is created"
        });
    }
    catch(err){
  return res.status(500).json({
            success: false,
            message : err.message
        });
    }
}

exports.getAverageRating = async(req , res) => {
    try{
        const courseId = req.body.courseId;
        const result = await RatingAndReview.aggregate([{
            $match : {course : new mongoose.Types.ObjectId(courseId)},
            $group : {_id : null , averageRating : {$avg : "$rating"}}
        }])
//if reating exist
        if(result.length > 0){
            return res.status(200).json({
                success : true,
                averageRating : result[0].averageRating
            })
        }
// if rating not exist
        return res.status(200).json({
                success : true,
                message : "Average Rating is 0 , no rating given till now",
                averageRating : 0
            })

    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}

exports.getAllRatingReviews = async(req , res) => {
    try{
        const getAllRatingReviews = await RatingAndReview.find({}).sort({rating : "desc"})
                                                .populate({
                                                    path : "user",
                                                    select : "firstName , lastName , email , image"
                                                })
                                                .populate({
                                                    path : "course",
                                                    select : "courseName"
                                                })
                                                .exec();
                                                return res.status(200).json({
                                                    success : true,
                                                    message : "All reviews are fatched successfully",
                                                    data : getAllRatingReviews
                                                })
            
    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}

exports.getCourseRatingReview = async(req , res) => {
    try{
        const courseId = req.body.courseId;
        const courseRating = await RatingAndReview.find({course : courseId}).populate({
                                                                                    path : "user",
                                                                                    select : "firstName , lastName , email , image"
                                                                                })
                                                                                .populate({
                                                                                path : "course",
                                                                                select : "courseName"
                                                                                }).exec();
        if(!courseRating){
            return res.status(401).json({
            success : false,
            message : "Rating Review not avalible"
            })
        }

        return res.status(200).json({
            success : true,
            message : " Rating and Reviews are fatched successfully",
            data : courseRating
        })
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}