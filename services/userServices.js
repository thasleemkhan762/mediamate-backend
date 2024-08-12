const Posts = require("../models/postModel");
const User = require("../models/userModel");


// get all posts
const getAllPosts = async() => {
    const aggregationPipeline = [
        { $sort: { createdAt: -1 } },
    ];
    try {
        const posts = await Posts.aggregate(aggregationPipeline);
        console.log(posts);
        
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

module.exports = { createPost, getAllPosts, getUserData };