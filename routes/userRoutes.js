const express = require("express");
const router = express.Router();
const {
  userRegister,
  verifyOTP,
  loginUser,
  createPost,
  getAllPosts
//   getUserData,
//   googleLogin,
//   googleAuth,
} = require("../controllers/userControllers");

router.route("/register").post(userRegister);
router.route("/login").post(loginUser);

// router.post("/googleLogin", googleLogin);
// router.post("/googleAuth", googleAuth);
// router.get('/getUserData', getUserData);

// router.route("/").get(getUser);
router.route("/otp_verify").post(verifyOTP);
router.route("/").get(getAllPosts);
router.route("/").post(createPost);
router.route("/:id").put();

module.exports = router;