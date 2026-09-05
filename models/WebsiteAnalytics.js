const mongoose = require("mongoose");

const websiteAnalyticsSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    eventType: {
      type: String,
      enum: [
        "session_start",
        "page_view",
        "click",
        "heartbeat",
        "page_exit",
        "session_end",
      ],
      required: true,
      index: true,
    },

    page: {
      type: String,
      default: "",
      index: true,
    },

    pageTitle: {
      type: String,
      default: "",
    },

    // Click information
    clickText: {
      type: String,
      default: "",
    },

    clickType: {
      type: String,
      default: "",
    },

    elementId: {
      type: String,
      default: "",
    },

    // Traffic source
    referrer: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "direct",
      index: true,
    },

    medium: {
      type: String,
      default: "",
    },

    campaign: {
      type: String,
      default: "",
    },

    // Device information
    device: {
      type: String,
      default: "",
    },

    browser: {
      type: String,
      default: "",
    },

    operatingSystem: {
      type: String,
      default: "",
    },

    // Location
    country: {
      type: String,
      default: "",
      index: true,
    },

    state: {
      type: String,
      default: "",
      index: true,
    },

    city: {
      type: String,
      default: "",
      index: true,
    },

    // Time spent
    duration: {
      type: Number,
      default: 0,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes for analytics
websiteAnalyticsSchema.index({
  timestamp: -1,
});

websiteAnalyticsSchema.index({
  eventType: 1,
  timestamp: -1,
});

websiteAnalyticsSchema.index({
  city: 1,
  timestamp: -1,
});

module.exports =
  mongoose.models.WebsiteAnalytics ||
  mongoose.model("WebsiteAnalytics", websiteAnalyticsSchema);