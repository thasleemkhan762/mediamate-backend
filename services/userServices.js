const Posts = require("../models/postModel");


// get all posts
const getAllPosts = async() => {
    try {
        const posts = await Posts.find();
        console.log(posts);
        
        return posts;
    } catch (error) {
        throw error;
    }
}

//create post
const createPost = async( userId, username, email, image, description ) => {
    try {

        const newPost = await Posts.create({ userId, username, email, image, description });

        return newPost;

    } catch (error) {
        
        throw error;

    }
};


module.exports = { createPost, getAllPosts };