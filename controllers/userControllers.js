const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { transporter, sendOTP } = require("../config/emailConfig");

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6_digit_OTP
  const otpExpiration = Date.now() + 2 * 60 * 1000; // 2 minutes

  return { otp, otpExpiration };
}

// Temporary storage for OTP and user data
// const otpStorage = {};

// @desc    Register new user
// @route   POST /api/users/register

const userRegister = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  // Checking for already existing user in database
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
  
    console.log("user existting");
    res.status(400).json("user exist")
  } else {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // otp generation
    const { otp, otpExpiration } = generateOTP();

    req.session.signupData = {
      username,
      email,
      password: hashedPassword,
      generatedOTP: otp,
      otpExpiration,
    };
    console.log("session data",req.session.signupData);

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
    return res.status(200).json(otp);

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
  const { otp } = req.body;
  console.log(`Verifying  OTP: ${otp}`);

  try {
    // Ensure session data exists
  // if (!req.session.signupData) {
  //   return res.status(400).json({message :"Session expired. Please restart the registration process."});
  // }
  console.log(req.session.signupData);
  const { username, email, password, generatedOTP, otpExpiration } =
  req.session.signupData;

    if (Date.now() > otpExpiration) {
      delete req.session.signupData;
      return res.status(400).json({message :"otp expired"});
    }

    if (otp === generatedOTP) {
      // User verified, now create the user in the database
      const userdata = await User.create({
        username,
        email,
        password,
      });

      delete req.session.signupData;

      console.log(userdata);
      return res.status(201).json(userdata)
    } else {
      console.log("Invalid OTP");
      return res.status(400).send("Invalid OTP");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = { userRegister, verifyOTP };
