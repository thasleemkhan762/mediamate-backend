const Posts = require("../models/postModel");
const User = require("../models/userModel");
const fs = require('fs').promises;


// get all posts
const getAllPosts = async () => {
    const aggregationPipeline = [
      // Sort posts by creation date in descending order
      { $sort: { createdAt: -1 } },
  
      // Lookup to join the 'Posts' collection with the 'Users' collection
      {
        $lookup: {
          from: 'users', // The name of the User collection in MongoDB
          localField: 'userId', // The field in the Posts collection that references the User
          foreignField: '_id', // The field in the Users collection to match
          as: 'userDetails' // The name of the field to add the joined data
        }
      },
  
      // Unwind the resulting array (since 'lookup' returns an array)
      {
        $unwind: '$userDetails'
      },
  
      // Optionally project only the necessary fields
      {
        $project: {
          file: 1,
          fileType: 1,
          description: 1,
          createdAt: 1,
          'userDetails.username': 1,
          'userDetails.image': 1
        }
      }
    ];
  
    try {
      const posts = await Posts.aggregate(aggregationPipeline);
      return posts;
    } catch (error) {
      throw error;
    }
  };

// get single user posts
const getSingleUserPosts = async (id) => {
  try {
    // Find all posts where the userId matches the provided id
    const posts = await Posts.find({ userId: id });
    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};

  

//create post
const createPost = async (userId, username, file, fileType, description) => {
  try {
    // Create the new post
    const newPost = await Posts.create({ userId, username, file, fileType, description });

    // Fetch the user's details (username and image)
    const user = await User.findById(userId).select('username image');

    // Add username and image to the new post object
    const postWithUserDetails = {
      ...newPost.toObject(),
      userDetails: {
        username: user.username,
        image: user.image
      }
    };

    return postWithUserDetails;

  } catch (error) {
    throw error;
  }
};

// get user data
const getUserData = async (id) => {

    return await User.findById(id);
}

// update user
const updateUser = async (id, updateData, newImagePath) => {
    
    const user = await User.findById(id);

    if (!user) {
        console.log('user not found');

        return null;
    }
    if (newImagePath && newImagePath !== user.image) {
        if (user.image) {
            try {
                await fs.unlink(user.image);
            } catch (error) {
                console.error('Error detecting old image file:', error);
            }
        }
        updateData.image = newImagePath;
    }
    // if (updateData.email) {
    //     updateData.email = updateData.email.toLowerCase();
    // }

    const editedUser = await User.findByIdAndUpdate(id, updateData, { new: true });


    return editedUser;
};

module.exports = { createPost, getAllPosts, getSingleUserPosts, getUserData, updateUser };