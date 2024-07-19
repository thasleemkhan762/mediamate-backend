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
    const user = await User.create({ username, email, password: hashedPassword, otp });


    //saving otp,session
    //   req.session.signupData = {
    //     username,
    //     email,
    //     password: hashedPassword,
    //     generatedOTP: otp,
    //     otpExpiration,
    //   };

    // otp to user
    sendOTP(user.email, otp);

    req.session.otp = otp;

    console.log("req.session.otp line 67",req.session.otp);
    console.log("user.email line 68",user.email);
    console.log("date now",Date.now());

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

  console.log("req body",req.body);

  const { email,otp } = req.body;
  console.log(`Verifying  OTP: ${otp} and email${email}`);

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }


  try {

  // Validate OTP
  const verifyOtp = await User.findOne({ otp });
  console.log("111",verifyOtp);
  if (verifyOtp.otp !== otp) {
    console.log("109",verifyOtp.otp);
    return res.status(400).json({ error: 'Invalid OTP usercontroller.113' });
  }
  // const { username, email, password, generatedOTP, otpExpiration } = signupData;

    if ((Date.now() - verifyOtp.createdAt) > 120000) {
      // delete req.session.otp;
      console.log("otp expired 121",verifyOtp.createdAt);
      console.log("otp expired 122",Date.now() );
      return res.status(400).json({message :"otp expired"});
    }

    if (otp === verifyOtp.otp) {


      console.log("OTP verified successfully");
      return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      console.log("Invalid OTP.135");
      return res.status(400).send("Invalid OTP.136");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = { userRegister, verifyOTP };
