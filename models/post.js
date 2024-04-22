const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "InActive"], 
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {  
        type: Number,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
} , {timestamps : true})


module.exports = mongoose.model("Post", postSchema);