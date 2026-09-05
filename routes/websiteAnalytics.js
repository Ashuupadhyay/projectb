const express = require("express");
const router = express.Router();

const WebsiteAnalytics = require("../models/WebsiteAnalytics");

// ==========================================
// TRACK WEBSITE EVENT
// ==========================================
router.post("/track", async (req, res) => {
  try {
    const data = req.body;

    if (!data.visitorId || !data.sessionId || !data.eventType) {
      return res.status(400).json({
        success: false,
        message: "visitorId, sessionId and eventType are required",
      });
    }

    const analytics = await WebsiteAnalytics.create({
      visitorId: data.visitorId,
      sessionId: data.sessionId,
      eventType: data.eventType,

      page: data.page || "",
      pageTitle: data.pageTitle || "",

      clickText: data.clickText || "",
      clickType: data.clickType || "",
      elementId: data.elementId || "",

      referrer: data.referrer || "",

      source: data.source || "direct",
      medium: data.medium || "",
      campaign: data.campaign || "",

      device: data.device || "",
      browser: data.browser || "",
      operatingSystem: data.operatingSystem || "",

      country: data.country || "",
      state: data.state || "",
      city: data.city || "",

      duration: Number(data.duration) || 0,

      timestamp: data.timestamp
        ? new Date(data.timestamp)
        : new Date(),
    });

    return res.status(201).json({
      success: true,
      id: analytics._id,
    });
  } catch (error) {
    console.error("Website Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save analytics",
    });
  }
});

module.exports = router;