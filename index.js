const express = require("express");
const app = express();
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8000;
const postRouter = require("./routes/post.router")
const UserRouter = require("./routes/User.router")


//DB connection
database.connectDB();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials : true,
    })
);


//routes
app.use("/api/v1/post" , postRouter);
app.use("/api/v1/user" , UserRouter);


//start server
app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);
});