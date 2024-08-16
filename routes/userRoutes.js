const express = require("express");
const router = express.Router();
const {
  userRegister,
  verifyOTP,
  loginUser,
  getUserData,
  getAllUser,
  updateUser,
  createPost,
  getAllPosts
//   getUserData,
//   googleLogin,
//   googleAuth,
} = require("../controllers/userControllers");

router.route("/register").post(userRegister);
router.route("/login").post(loginUser);
router.route("/otp_verify").post(verifyOTP);

// router.post("/googleLogin", googleLogin);
// router.post("/googleAuth", googleAuth);
// router.get('/getUserData', getUserData);

router.route("/allUsers").get(getAllUser);

router.route("/").get(getAllPosts);
router.route("/").post(createPost);
router.route("/:id").get(getUserData);
router.route("/:id").put(updateUser);

module.exports = router;