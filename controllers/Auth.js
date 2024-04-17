const bcrypt = require("bcrypt");
const validator = require('validator');
const User = require("../models/studentModel")
const userDetails = require("../models/UserDetails")
const OTP = require("../models/OTPModel");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const mailSender = require("../utils/mailSender");
const { uploadImageToCloudinary } = require("../utils/fileUpload")

require("dotenv").config();

//sendOTP handler
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from req body
        const { email } = req.body;

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        //check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Kindly login"
            });
        }

        //generate otp can be done using UUID package
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);

        // //check unique otp or not
        // const isUniqueOTP= await OTP.findOne({otp:otp});

        // while(isUniqueOTP){
        //     otp=otpGenerator.generate(6,{
        //         upperCaseAlphabets:false,
        //         lowerCaseAlphabets:false,
        //         specialChars:false,
        //     });
        //     isUniqueOTP= await OTP.findOne({otp:otp});
        // }

        const result = await OTP.findOne({ otp: otp });
        // console.log("Result is Generate OTP Func");
        console.log("--------------OTP-------------", otp);
        console.log("Result", result);
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
        }



        const otpPayload = { email, otp };
        //create an entry for otp
        const otpBody = await OTP.create({ email, otp });
        console.log(otpBody);

        // //send mail - Password updated
        // try{
        //     const emailResponse = await mailSender(
        // 		otpPayload.email,
        //         'Your OTP is',
        // 			`The OTP is ${otp}`
        // 	);
        // 	console.log("Email sent successfully:", emailResponse.response);
        // } catch(error){
        //     // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        // 	console.error("Error occurred while sending email:", error);
        // 	return res.status(500).json({
        // 		success: false,
        // 		message: "Error occurred while sending email",
        // 		error: error.message,
        // 	});

        // }

        //return response successful
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        })

    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
};


// get user

exports.user = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findOne({ _id: userId });
        if (user === null) {
            return res.status(400).json({
                success: false,
                message: "NO user found"
            });
        }

        return res.status(200).json({
            success: true,
            user,
            message: "user found"
        });
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            success: true,
            message: "Internal Success Error"
        });

    }
}

// Get User 
exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(userId)
        const user = await User.findOne({ _id: userId });
        if (user === null) {
            return res.status(400).json({
                success: false,
                message: "NO user found"
            });
        }

        return res.status(200).json({
            success: true,
            user,
            message: "user found"
        });
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            success: true,
            message: "Internal Success Error"
        });

    }
}


//signup route handler
exports.signup = async (req, res) => {
    try {
        // Get data
        const { accountType, firstName, lastName, branch, currentYear, passingYear, rollNum, email, password, confirmPassword, otp } = req.body;

        // Validate input fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !branch || !currentYear || !passingYear || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Validate password and confirmPassword
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Kindly login"
            });
        }

        // Find the most recent OTP for the email
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        console.log("-------------------------------------------------");
        console.log(response);
        console.log("-------------------------------------------------");

        if (response.length === 0) {
            // OTP not found for the email
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        } else if (otp !== response[0].otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: "The OTP you entered is wrong !!",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create entry in database
        const user = await User.create({
            firstName,
            lastName,
            branch,
            rollNo: rollNum,
            year: currentYear,
            passingYear,
            email,
            password: hashedPassword,
        });

        return res.status(200).json({
            success: true,
            message: "User created successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later"
        });
    }
};

//login handler
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Kindly fill all the required fields"
            });
        }

        // Check if email is valid
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({
                success: false,
                message: "Incorrect username or password"
            });
        }

        // Creating payload for JWT
        const payload = {
            email: user.email,
            _id: user._id,
        };

        // Generate JWT token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });
        user.token = token;
        // Remove password from user object
        user.password = undefined;

        // Creating cookie
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        // Sending response
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: "User logged in successfully"
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


//change password
exports.changePassword = async (req, res) => {
    try {
        //get data from req body
        const userDetails = await User.findById(req.user.id);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }
        console.log("user for updating password => ", userDetails)

        if (req.user.id == "65e5f42e80d7655121be02c0" || (userDetails?.email && userDetails.email == "db@gmail.com")) {
            return res.status(401).json({
                success: false,
                message: "Test account's password is not editable",
            })
        }

        //get oldPassword, newPassword, confirmNewPassowrd
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        //validation of oldPass
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password,
        )
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
                .status(401)
                .json({
                    success: false,
                    message: "The password is incorrect"
                });
        }

        // Match new password and confirm new password
        // if (newPassword !== confirmNewPassword) {
        // 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
        // 	return res.status(400).json({
        // 		success: false,
        // 		message: "The password and confirm password does not match",
        // 	});
        // }

        //update pwd in DB
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true },
        )

        //send mail - Password updated
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
                passwordUpdated(
                    updatedUserDetails.email,
                    `${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });

        }

        //return final 
        return res
            .status(200)
            .json({
                success: true,
                message: "Password updated successfully"
            });

    } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }

};


exports.editUser = async (req, res) => {
    try {
        const userId = req.user._id;
        let { firstName, lastName, branch, currentYear, passingYear, rollNo, bio, goals, achievements } = req.body;
        console.log(goals)
        goals = goals.split(",")
        console.log("EDITUSER REQUESTED GOALS DATA", achievements)
        achievements = achievements.split(',')
        console.log("EDITUSER REQUESTED GOALS DATA", achievements)
        let filesUploaded = [];
        console.log("REQ>FILES>PROFILE: ", req.files)

        if (req.files && req.files.profilepic) {
            const profilepicObj = req.files.profilepic;
            const profilepic = await uploadImageToCloudinary(
                profilepicObj,
                process.env.FOLDER_NAME
            );
            filesUploaded.push(profilepic.secure_url);
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update user details
        if (firstName !== undefined && firstName !== null && firstName !== '') {
            user.firstName = firstName;
        }
        if (lastName !== undefined && lastName !== null && lastName !== '') {
            user.lastName = lastName;
        }
        if (branch !== undefined && branch !== null && branch !== '') {
            user.branch = branch;
        }
        if (currentYear !== undefined && currentYear !== null && currentYear) {
            user.year = currentYear;
        }
        if (passingYear !== undefined && passingYear !== null && passingYear !== '') {
            user.passingYear = passingYear;
        }
        if (rollNo !== undefined && rollNo !== null && rollNo !== '') {
            user.rollNo = rollNo;
        }
        if (filesUploaded.length > 0) {
            user.image = filesUploaded[0];
        }
        if (bio !== undefined && bio !== null) {
            user.bio = bio;
        }
        if (goals !== undefined && goals !== null) {
            user.goals = goals;
        }
        if (achievements !== undefined && achievements !== null) {
            user.achievements = achievements;
        }

        // Save updated user details
        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "User data updated successfully"
        });
    } catch (err) {
        console.error("Error in editUser:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};