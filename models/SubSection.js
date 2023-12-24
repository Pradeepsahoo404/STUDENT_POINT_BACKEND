const mongoose = require("mongoose");
const SubSectionSchema = new mongoose.Schema({
    title : {
        type : String,
        trim : true,
        required : true,
    },
    timeDuration : {
        type : String,
    },
    description : {
        type : String,
        trim : true,
    },
    videoUrl : {
        type : String,
    }
});

module.exports = mongoose.model("SubSection" , SubSectionSchema);