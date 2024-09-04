const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
    {
    users: [
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
}, { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);