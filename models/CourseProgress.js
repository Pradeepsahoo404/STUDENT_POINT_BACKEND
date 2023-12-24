const mongoose = require("mongoose");
const coursesProgressSchema = new mongoose.Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Course",
        required : true
    },
    completedVideos : [
        {
        type : mongoose.Schema.Types.ObjectId,
        ref : "SubSection",
        required : true
        }
    ]
});
module.exports = mongoose.model("CourseProgress" , coursesProgressSchema);