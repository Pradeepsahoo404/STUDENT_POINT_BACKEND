const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required: true,
        trim : true
    },
    lastName : {
        type : String,
        required : true,
        trim : true,
    },
    email :{
        type : String,
        required : true,
    },
    contactNumber : {
        type : Number,
        required : true,
    },
    password :{
        type : String,
        required : true,
    },
    confirmPassword :{
        type : String,
        required : true,
    },
    accountType :{
        type : String,
        enum : ["Admin" , "Student" , "Instructor"],
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    additionDetail :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Profile",
    },
    courses : [
        {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Course",
        }
    ],
    image : {
        type :String,
    },
    token : {
        type : String
    },
    resetPasswordExprires : {
        type : Date,
    },
    coursesProgress : [
        {
                type : mongoose.Schema.Types.ObjectId,
                ref : "CourseProgress",

        }
    ],



},
{ timestamps: true }
);
module.exports = mongoose.model("User" , userSchema)