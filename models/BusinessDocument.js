const mongoose = require("mongoose");

const businessDocumentSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        "aadhaar",
        "pan",
        "gst",
        "gumasta",
        "rc",
        "insurance",
        "permit",
        "other",
      ],
    },
    documentName: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.BusinessDocument ||
  mongoose.model("BusinessDocument", businessDocumentSchema);