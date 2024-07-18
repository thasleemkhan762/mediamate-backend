const express = require("express");
const { userRegister, verifyOTP, loginUser, getUser } = require("../controllers/userControllers");
const router = express.Router();

router.route("/register").post(userRegister);
// router.route("/login").post(loginUser);
// router.route("/").get(getUser);
router.route("/otp_verify").post(verifyOTP);

module.exports = router;