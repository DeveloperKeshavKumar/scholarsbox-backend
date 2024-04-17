const User= require("../models/studentModel")
const mailSender =require("../utils/mailSender")
const crypto = require('crypto')
require("dotenv").config();


//resetPasswordToken
exports.resetPasswordToken = async (req,res) => {
    try{
        //get email from req body
        const email =req.body.email;
        //check user for this email,email validation
        const user= await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your email is not registered with us",
            })
        }
        //generate token
        const token =crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpires:Date.now()+5*60*100,
            },
            {new:true}//returns the updated document as response
        )
        //create url
        const url=`http://localhost:3000/update-password/${token}`;
        //send email containing the url
        await mailSender(email,"Your password reset link",`Password Reset Link: ${url} `);

        //return response
        return res.json({
            success:true,
            message:"Email sent successfully, please check your inbox and change the password"
        });
    }
    catch(err){
        console.log(err)
        return res.json({
            success:false,
            message:"Something went wrong",
        });
    }
}

//resetPassword update password in db
exports.resetPassword = async(req,res) => {
    try{
        //data fetch
        const {password,confirmPassword,token} =req.body;
        //validation
        if(password!=confirmPassword){
            return res.json({
                success:false,
                message:"Password and confirm password do not match",
            })
        }
        //get user details through token
        const userDetails = await User.findOne({token:token});
        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"The token is invalid",
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now() ){
            return res.json({
                success:false,
                message:"Token is expired, Please regenerate token",
            })
        }
        //hash password
        const hashedPassword= await bcrypt.hash(password,10);
        //update password
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )
        //return response
        return res.json({
            success:true,
            message:"Password Changed Successfully",
        });
    }
    catch(err){
        return res.json({
            success:false,
            message:"Invalid request",
        })
    }
}