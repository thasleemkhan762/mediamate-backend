const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chatModel");

/// get all chats of the user
const getUserChats = asyncHandler(async (req, res) => {

    try {
        const chat = await Chat.findOne({ users: { $all: [req.user._id, req.params.userId] } })
            .populate('messages.sender', 'name');

        res.status(200).json(chat);

    } catch (err) {

        res.status(500).json({ message: 'Server error' });
    }

});

// send new messages ( update chat or create new )
const sendMessage = asyncHandler(async (req, res) => {

    const { senderId, recipientId, content } = req.body;

    try {
        let chat = await Chat.findOne({ users: { $all: [senderId, recipientId] } });
        
        if (!chat) {
            chat = new Chat({ users: [senderId, recipientId], messages: [] });
        }

        const message = { sender: senderId, content, timestamp: new Date() };
        chat.messages.push(message);
        await chat.save();

        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }

});

module.exports = { getUserChats, sendMessage };
  