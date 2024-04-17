const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender')

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5*60*1000,
  }
});

//function to send email
async function sendVerificationEmail(email,otp){
  try{
    const mailResponse= await mailSender(email,"Verification Email from ScholarsBox",otp);
    console.log("Email sent successfully",mailResponse);
  }
  catch(err){
    console.log("Error occured while sending mail",err);
    throw err;
  }
}

OTPSchema.pre("save",async function(next){
  await sendVerificationEmail(this.email,this.otp);
  next();
})

module.exports= mongoose.model('OTP', OTPSchema);
