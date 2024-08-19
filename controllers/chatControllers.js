const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chatModel");

/// get all chats of the user
const getUserChats = asyncHandler(async (req, res) => {
    const { id1, id2 } = req.params;
    console.log(id1);
    console.log(id2);
    try {
      // Find the chat with both users
      const chat = await Chat.findOne({ users: { $all: [id1, id2] } });
      // .populate('messages.sender', 'username');
    //   console.log("Found chat:", chat);
      // console.log(chat);

      // Check if chat exists
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Log the chat messages for debugging
    //   console.log("chat messages", chat);

      // Return the chat data
      res.status(200).json(chat);
    } catch (err) {
      // Log the error for debugging
      console.error("Server Error:", err);

      // Return server error
      res.status(500).json({ message: "Server error" });
    }
});


// send new messages ( update chat or create new )
const sendMessage = asyncHandler(async (req, res) => {
    console.log("controller send body",req.body);
    

    
    console.log("1");
    const { senderId, recipientId, content } = req.body;
    console.log("2");
    
    if (!senderId || !recipientId || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    console.log("3");
    
     try {
    console.log("4");
    const { senderId, recipientId, content } = req.body;
    const chatId = `${senderId}${recipientId}`; // generate a unique chat ID

    // Emit the message to the chat room using Socket.IO
    io.emit('sendMessage', {
      chatId,
      senderId,
      content,
      recipientId,
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }

});

module.exports = { getUserChats, sendMessage };
  