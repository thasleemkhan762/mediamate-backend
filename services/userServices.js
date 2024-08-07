const Posts = require("../models/postModel");


//create post
const createPost = async( userId, email, image, description ) => {
    try {

        const newPost = await Posts.create({ userId, email, image, description });

        return newPost;

    } catch (error) {
        
        throw error;

    }
};


module.exports = { createPost };