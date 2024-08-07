const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add the username"],
    },
    email: {
        type: String,
        required: [true, "Please add the user email"],
        unique: [true, "This email is already in use"]
    },
    password: {
        type: String,
        required: [true, "Please add the user password"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    otp: {
        type: String,
        required: false
    },
    otpExpiration: {
        type: Date,
        required: false
    }
 
}, {
    timestamps: true,
}
);

module.exports = mongoose.model("User", userSchema);