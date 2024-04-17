const express=require("express");
const app=express();

const project = require("./routes/project")
const user= require("./routes/user");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary=require("cloudinary");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT= process.env.PORT|| 4000;

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);
app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();
// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });

//db connection
database.connect();

//route import and mount
app.use("/api",user);
app.use("/api",project);

app.get("/", (req,res) => {
    return res.json({
        success:true,
        message:'Your server is up and running..'
    });
})
//activate server
app.listen(PORT,()=>{
    console.log(`App started at port no ${PORT}`);
});

