const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { transporter, sendOTP } = require("../config/emailConfig");
const multer = require("multer");
const upload = require("../config/multer");
const path = require("path");
const Userservices = require("../services/userServices");

// const { OAuth2Client } = require('google-auth-library');
// const fetch = require('node-fetch');
// const fetch = await import('node-fetch'); 
// const client = new OAuth2Client(process.env.CLIENT_ID);


// async function getUserData(access_token) {
//   const fetch = await import('node-fetch'); // Use dynamic import
//   const response = await fetch.default(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
//   const data = await response.json();
//   console.log('data', data);
// }

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6_digit_OTP
  const otpExpiration = Date.now() + 2 * 60 * 1000; // 2 minutes

  return { otp, otpExpiration };
}



// @desc    Register new user
// @route   POST /api/users/register
const userRegister = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ( !username || !email ) {
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

    // req.session.otp = otp;

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
  console.log("req body", req.body);

  const { email, otp } = req.body;
  console.log(`Verifying  OTP: ${otp} and email${email}`);

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    // Validate OTP
    const verifyOtp = await User.findOne({ otp });
    console.log("111", verifyOtp);
    if (verifyOtp.otp !== otp) {
      console.log("109", verifyOtp.otp);
      return res.status(400).json({ error: "Invalid OTP usercontroller.113" });
    }

    // chec otp expired or not
    if (Date.now() - verifyOtp.createdAt > 120000) {
      // delete req.session.otp;
      console.log("otp expired 121", verifyOtp.createdAt);
      console.log("otp expired 122", Date.now());
      return res.status(400).json({ message: "otp expired" });
    }

    // check otp with database
    if (otp === verifyOtp.otp) {
      console.log("OTP verified successfully");
      verifyOtp.otp = null;

      // remove otp from database
      await User.updateOne({ email }, { $unset: { otp: "" } });

      console.log("otp after verify 118", verifyOtp.otp);
      return res.status(200).json({ message: "OTP verified successfully" });

    } else {

      console.log("Invalid OTP.135");
      return res.status(400).send("Invalid OTP.136");
    }
  } catch (error) {

    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal server error");

  }
});



// Login user
const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;
  // check for empty fields
  if (!email || !password) {
    return res.status(400).json({status: "error", error: 'Please provide email and password' });
  }

  // Validate user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({status: "error", error: 'user not found'});
  }

  // validate role
  if (user.role !== "user") {
    return res.status(401).json({status: "error", error: 'unauthorized. user access required'});
  }

  // validate password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({status: "error", error: 'Wrong password'});
  }

  // token generation
  const Token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie('userToken', Token, {httpOnly: false, maxAge: 60 * 60 * 1000 , withCredentials: true});

  return res.status(200).json({status: "success", data: user, username:user.username, userId:user._id, userToken: Token});

});



// const googleLogin = asyncHandler(async (req, res) => {
//   const { token } = req.body;

//   const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.CLIENT_ID,
//   });
//   const payload = ticket.getPayload();

//   const user = await User.findOne({ email: payload.email });
//   if (!user) {
//       const newUser = new User({
//           name: payload.name,
//           email: payload.email,
//           googleId: payload.sub,
//       });
//       await newUser.save();
//   }

//   const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   res.json({ token: jwtToken });
// });


// const googleAuth = asyncHandler(async (req, res) => {
//   const { code } = req.body;
//   const response = await fetch(`https://oauth2.googleapis.com/token`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: `code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT_URI}&grant_type=authorization_code`,
//   });
//   const data = await response.json();
//   res.json(data);
// });

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.params.id; // Assuming you have the current user ID in the request object

    // Find all chats involving the current user
    const chats = await Chat.find({ users: currentUserId }).select('users').lean();

    // Extract unique user IDs of users who have chatted with the current user
    const chattedUserIds = chats
      .map(chat => chat.users.find(userId => userId.toString() !== currentUserId.toString()))
      .filter(Boolean);

    // Find all users who have chatted with the current user and exclude the current user
    const users = await User.find({ _id: { $in: chattedUserIds } })
      .select('userId username image')
      .lean();

    const userWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const chat = await Chat.findOne({ users: { $all: [user._id, currentUserId] } })
          .sort({ 'messages.timestamp': -1 })
          .select('messages')
          .lean();

        const lastMessage = chat?.messages?.length > 0 ? chat.messages[chat.messages.length - 1] : null;
        
        return {
          userId: user._id,
          username: user.username,
          image: user.image,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageTimestamp: lastMessage ? lastMessage.timestamp : null,
        };
      })
    );
console.log(userWithLastMessage);

    res.status(200).json(userWithLastMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



// get userdata
const getUserData = asyncHandler(async (req, res) => {
  const userData = await Userservices.getUserData(req.params.id);
  if (!userData) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }
  res.status(200).json({ status: "success", data: userData });
})

//update user data
const updateUser = asyncHandler(async (req, res) => {
  console.log("req.body 237",req.body);

  upload(req, res, async (error) => {
      if (error instanceof multer.MulterError) {

          return res.status(400).json({ message: 'Image upload error' });
      } else if (error) {

          return res.status(500).json({ message: 'Internal server error' });
      }

      let imagePath;

      if (req.file) {
          imagePath = path.join('uploads/images', req.file.filename);
      } else {
          const user = await Userservices.getUserData(req.params.id);
          if (!user) {

              res.status(400);
              throw new Error('User not found');
          }
          imagePath = user.image;
      }

      const updateData = {
          ...req.body,
          ...(imagePath ? { image: imagePath } : {}),
      };
      

      const updatedData = await Userservices.updateUser(req.params.id, updateData, imagePath);

      res.status(200).json(updatedData);
  });
});


//get all posts
const getAllPosts = asyncHandler(async(req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const posts = await Userservices.getAllPosts();
    res.status(200).json({ posts });

  } catch (error) {

    console.error(`Error in fetching posts: ${error.message}`);

    res.status(500).json({ error: error.message });
  }
})

// get single user posts
const getSingleUserPosts = asyncHandler (async(req, res) => {
  try {
    const singleUserPosts = await Userservices.getSingleUserPosts(req.params.id);
    // console.log("fgf",singleUserPosts);
    
    res.status(200).json(singleUserPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// create new contact
// api/users
const createPost = asyncHandler(async (req, res) => {

  upload(req, res, async function (err) {

    if (err instanceof multer.MulterError) {

      return res.status(400).json({ message: "File upload error", error: err.message });
    } else if (err) {

      return res.status(500).json({ message: "Internal Server Error", error: err.message });
    } else {

      const { description, userId, username } = req.body;
      const file = req.file ? req.file.path : null;
      const fileType = req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'video') : null;

      if (!description || !userId || !username || !file || !fileType) {
        return res.status(400).json('All fields are mandatory!!!');
      }

      try {
        const post = await Userservices.createPost(userId, username, file, fileType, description);
        return res.status(201).json(post);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to create post', error: error.message });
      }
    }
  })
});

const getFriendSuggestions = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.params.id;
    console.log("currentUserId",currentUserId);
    
    // Find all users except current user
    const users = await User.find({ 
      _id: { $ne: currentUserId }
    })
    .select('username image')
    .lean();

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  userRegister,
  verifyOTP,
  loginUser,
  getUserData,
  getAllUsers,
  getAllPosts,
  getSingleUserPosts,
  createPost,
  updateUser /*googleLogin, googleAuth, getUserData}*/,
  getFriendSuggestions,
};
