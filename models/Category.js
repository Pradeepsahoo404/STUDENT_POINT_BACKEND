const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true,
    },
    description : {
        type : String,
        trim : true,
        required : true,
    },
    course : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Course",
            required : true,
        }
    ],
    adminId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    }
});
module.exports = mongoose.model("Category" , categorySchema);