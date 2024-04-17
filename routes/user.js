const express =require("express");
const router=express.Router();

//import the  middlewares and controllers
const {login,signup,sendOTP,changePassword, user, getUser, editUser} =require("../controllers/Auth");
const {resetPassword,resetPasswordToken} =require("../controllers/ResetPassword");

//middleware
const {auth} = require("../middlewares/auth");

//Routes for login, Signup and Authentication
//AUTHENTICATION ROUTES
router.post("/signup",signup);

router.get("/user",auth, user)

router.get("/user/:id",auth, getUser)

router.put("/user/:id/edit", auth, editUser)

router.post("/login",login);

router.post("/sendOTP",sendOTP);

router.post("/changePassword",changePassword);


//Routes to Reset Password
//RESET PASSWORD

router.post("/reset_password_token",resetPasswordToken);

router.post("/reset_password",resetPassword);


module.exports = router;