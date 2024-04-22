const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB Connection Successful");
    } catch (error) {
        console.error("Error Connecting to DB:", error);
        process.exit(1);
    }
};
