const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: [true, "Please add the user email"],
    },
    image: {
      type: String,
      required: [true, "please add the image"],
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