const Posts = require("../models/postModel");


// get all posts
const getAllPosts = async() => {
    try {
        const posts = await Posts.find();
        return posts;
    } catch (error) {
        throw error;
    }
}

//create post
const createPost = async( userId, email, image, description ) => {
    try {

        const newPost = await Posts.create({ userId, email, image, description });

        return newPost;

    } catch (error) {
        
        throw error;

    }
};


module.exports = { createPost, getAllPosts };