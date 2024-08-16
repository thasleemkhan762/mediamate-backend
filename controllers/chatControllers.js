const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chatModel");

/// get all chats of the user
const getUserChats = asyncHandler(async (req, res) => {

    try {

        const chats = await Chat.find({ participants: req.params.userId }).populate('participants messages.sender');

        res.json(chats);

    } catch (err) {

        res.status(500).json({ error: 'Server error' });

    }

});

// send new messages ( update chat or create new )
const sendMessage = asyncHandler(async (req, res) => {

    const { senderId, recipientId, content } = req.body;

    try {

        let chat = await Chat.findOne({ participants: { $all: [senderId, recipientId] } });

        if (!chat) {

            chat = new Chat({
                
              participants: [senderId, recipientId],
              messages: [{ sender: senderId, content }],

            });

        } else {

            chat.messages.push({ sender: senderId, content });
        }

        await chat.save();
        
        res.json(chat);

    } catch (err) {

        res.status(500).json({ error: 'Server error' });

    }

});

module.exports = { getUserChats, sendMessage };
  