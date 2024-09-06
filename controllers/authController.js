const { oauth2client } = require("../config/googleConfig");
const User = require("../models/userModel");
const axios = require('axios');
const jwt = require('jsonwebtoken');

const googleSignup = async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleRes.tokens.access_token}`
        );
        
        const { email, name, picture } = userRes.data;
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: 'Account already exists. Please log in instead.'
            });
        }

        user = await User.create({
            username: name,
            email,
            image: picture
        });

        const { _id } = user;
        const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });

        return res.status(201).json({
            message: 'Sign up successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                image: user.image
            }
        });
    } catch (error) {
        console.log("Error during Google sign-up:", error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const googleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleRes.tokens.access_token}`
        );
        
        const { email } = userRes.data;
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'Account not registered. Please sign up first.'
            });
        }

        const { _id } = user;
        const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });

        return res.status(200).json({
            message: 'Success',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                image: user.image
            }
        });
    } catch (error) {
        console.log("Error during Google login:", error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = {
    googleSignup,
    googleLogin
}