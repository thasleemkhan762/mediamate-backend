const Posts = require("../models/postModel");


//create post
const createPost = async( email, image, description ) => {
    try {

        const newPost = await Posts.create({ email, image, description });

        return newPost;

    } catch (error) {
        
        throw error;

    }
};


module.exports = { createPost };