const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image is required"],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);