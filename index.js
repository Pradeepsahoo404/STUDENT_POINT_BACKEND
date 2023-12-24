const express = require("express");
const app = express();

const userRoute = require("./routes/User");
const profileRoute = require("./routes/Profile");
const paymentRoute = require("./routes/Payments");
const courseRoute = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;


//DB connection

database.connect();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials : true,
    })
);

app.use(
    fileUpload({
        useTempFiles : true,
        tempFileDir : "/tmp/"
    })
)

//cloudinaryConnect
cloudinaryConnect();

//routes
app.use("/api/v1/user" , userRoute);
app.use("/api/v1/profile" , profileRoute);
app.use("/api/v1/course" , courseRoute);
app.use("/api/v1/payments" , paymentRoute);

//default route
app.get('/' , (req, res)=>{
    return res.json({
        success : true,
        message : "your serveer is up and running....."
    });
})

//start server
app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);
});