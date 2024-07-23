const express = require("express");
const { userRegister, verifyOTP, loginUser, getUserData, googleLogin, googleAuth } = require("../controllers/userControllers");
const router = express.Router();

router.route("/register").post(userRegister);
router.route("/login").post(loginUser);

// router.post("/googleLogin", googleLogin);
// router.post("/googleAuth", googleAuth);
// router.get('/getUserData', getUserData);

// router.route("/").get(getUser);
router.route("/otp_verify").post(verifyOTP);

module.exports = router;