const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        trim: true,
    },
    lastName: {
        type: String,
        require: true,
        trim: true,
    },
    username: {
        type: String,
        require: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String
    },
} , {timestamps : true})


module.exports = mongoose.model("User", userSchema);