const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chatModel");


const getUserChats = asyncHandler(async (req, res) => {

    try {

        const chats = await Chat.find({ participants: req.params.userId }).populate('participants messages.sender');
        
        res.json(chats);

    } catch (err) {

        res.status(500).json({ error: 'Server error' });

    }

});

const sendMessage = asyncHandler(async (req, res) => {});

module.exports = { getUserChats, sendMessage };
  