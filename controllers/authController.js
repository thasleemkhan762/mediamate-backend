const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { transporter, sendOTP } = require("../config/emailConfig")


function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6_digit_OTP
    const otpExpiration = Date.now() + 2 * 60 * 1000; // 2 minutes
  
    return { otp, otpExpiration };
}

// Temporary storage for OTP and user data
const otpStorage = {};

// @desc    Register new user
// @route   POST /api/users/register

const signupUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }
    // Checking for already existing user in database
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
    //   res.render("signup", {
    //     alreadyExists: "User already exists. Change the email.",
    //   });
    console.log("user existting");
    } else {
      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // otp generation
      const { otp, otpExpiration } = generateOTP();

      // Storing OTP and user data temporarily
      otpStorage[email] = { username, email, password: hashedPassword, otp, otpExpiration };
  
      //saving otp,session
    //   req.session.signupData = {
    //     username,
    //     email,
    //     password: hashedPassword,
    //     generatedOTP: otp,
    //     otpExpiration,
    //   };
  
      // otp to user
      sendOTP(email, otp);
  
      // return res.redirect("/otp_verify");
      return res.json("/otp_verify");
  
      //   const user = await User.create({
      //       username,
      //       email,
      //       password: hashedPassword,
      //   });
      //   console.log(`User created ${user}`);
      //   if(user) {
      //       res.status(201).json({_id: user.id, email: user.email});
      //   }else{
      //       res.status(400);
      //       throw new Error("User data is not valid");
      //   }
      // res.json({ message: "Register the user" });
    }
  });


  // otp_verify
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const storedData = otpStorage[email];
    if (!storedData) {
      console.log("data not found");
    }
    const { username, password, otp: storedOTP, otpExpiration } =
    storedData;
  
    if (Date.now() > otpExpiration) {
      delete otpStorage[email];
   console.log("otp expired");
    }
  
    if (otp === storedOTP) {
      // User verified, now create the user in the database
      const userdata = await User.create({
        username,
        email,
        password,
      });
  
      delete otpStorage[email];
  
      console.log(userdata);
      return res.redirect("/login");
    } else {
     console.log("incorrect otp");
    }
  });





  module.exports = { signupUser, verifyOTP };