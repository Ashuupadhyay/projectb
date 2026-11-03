const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customerId: {
      type: String,
      required: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    registeredBy: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    resolvedBy: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolutionDetails: {
      type: String,
      default: "",
      trim: true,
    },

    updatedBy: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    updateHistory: [
      {
        employeeEmail: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        changes: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);