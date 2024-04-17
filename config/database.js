const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL,)
    .then(() => console.log("Connected to database successfully"))
    .catch((err)=> {
        console.log("Issue in DB connection");
        console.error(err);
        process.exit(1);
    })
};


