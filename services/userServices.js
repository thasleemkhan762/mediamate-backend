const Posts = require("../models/postModel");
const User = require("../models/userModel");


// get all posts
const getAllPosts = async() => {
    const aggregationPipeline = [
        { $sort: { createdAt: -1 } },
    ];
    try {
        const posts = await Posts.aggregate(aggregationPipeline);
        // console.log(posts);
        
        return posts;
    } catch (error) {
        throw error;
    }
}

//create post
const createPost = async( userId, username, file, fileType, description ) => {
    try {

        const newPost = await Posts.create({ userId, username, file, fileType, description });

        return newPost;

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

module.exports = { createPost, getAllPosts, getUserData, updateUser };