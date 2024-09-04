const express = require("express");
const router = express.Router();
const {
  userRegister,
  verifyOTP,
  loginUser,
  getUserData,
  getAllUsers,
  updateUser,
  createPost,
  getAllPosts,
  getSingleUserPosts
//   getUserData,
//   googleLogin,
//   googleAuth,
} = require("../controllers/userControllers");

router.route("/register").post(userRegister);
router.route("/login").post(loginUser);
router.route("/otp_verify").post(verifyOTP);

router.route("/allUsers/:id").get(getAllUsers);

router.route("/").get(getAllPosts);
router.route("/getSingleUserPosts/:id").get(getSingleUserPosts);
router.route("/").post(createPost);
router.route("/:id").get(getUserData);
router.route("/:id").put(updateUser);

module.exports = router;