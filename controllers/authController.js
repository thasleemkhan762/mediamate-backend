const { oauth2client } = require("../config/googleConfig");
const User = require("../models/userModel");
const axios = require('axios');
const jwt = require('jsonwebtoken');

const googleLogin = async (req, res) => {

    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleRes.tokens.access_token}`
        );
        
        const { email, name, picture } = userRes.data;
        let user = await User.findOne({ email });
        if(!user) {
            user = await User.create({
                username: name,
                email,
                image: picture
            });
        }
        const { _id } = user;
        const token = jwt.sign({ _id, email }, 
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT
            }
        );
        return res.status(200).json({
            messsage: 'Success',
            token,
            user
        });
    } catch (error) {
        console.log("the error is :",error);
        
        res.status(500).json({
            messsage: 'Internal server error'
        })
    }
}

module.exports = {
    googleLogin
}