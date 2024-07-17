const dotenv = require("dotenv").config();
const nodemailer = require("nodemailer");

// configure_email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// otp_configure_email
const sendOTP = async (email, otp) => {
  const otpmail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP for verification is: ${otp}`,
  };

  try {
    await otpmail.sendMail(mailOptions);
    console.log("OTP email sent successfully");
    console.log(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Error sending OTP email");
  }
};

module.exports = { transporter, sendOTP };
