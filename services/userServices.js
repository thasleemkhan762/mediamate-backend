const Posts = require("../models/postModel");


//create post
const createPost = async( /*userId,*/ image, description ) => {
    try {

        const newPost = await Posts.create({ /*userId,*/ image, description });

        return newPost;

    } catch (error) {
        
        throw error;

    }
};


module.exports = { createPost };