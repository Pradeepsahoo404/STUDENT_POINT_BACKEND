const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("DB Connection Successfull"))
    .catch((error)=>{
        console.log(`Error Connecting to DB ${error}`);
        process.exit(1);
    })
}