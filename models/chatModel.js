const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
    {
    participants: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' }
    ],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Chat", chatSchema);