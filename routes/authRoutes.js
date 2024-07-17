const express = require("express");
const router = express.Router();
const { signupUser, verifyOTP } = require("../controllers/authController");



router.route("/register").post(signupUser);
router.route("/otp_verify").post(verifyOTP);

module.exports = router;