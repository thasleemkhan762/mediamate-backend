const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
      required: [true, "Please add the user username"],
    },
    file: {
      type: String, // Storing the file path as a string
      required: true,
    },
    fileType: {
      type: String, // Indicates whether the file is an image or a video
      enum: ["image", "video"],
      required: true,
    },
    description: {
      type: String,
      required: [true, "please add the description"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);