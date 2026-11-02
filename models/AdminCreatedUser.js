const mongoose = require("mongoose");

const adminCreatedUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin_created_user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AdminCreatedUser",
  adminCreatedUserSchema
);