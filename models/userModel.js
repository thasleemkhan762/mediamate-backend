const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    image: {
      type: String,
      default: null,
    },
    googleImage: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      required: [true, "Please add the username"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email"],
      unique: [true, "This email is already in use"],
    },
    password: { 
      type: String 
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    place: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiration: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);