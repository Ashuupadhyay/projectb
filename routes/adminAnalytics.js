const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Business = require("../models/Business");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const BusinessDocument = require("../models/BusinessDocument");

// Real-Time Analytics Overview Endpoint
router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      totalBusinesses,
      totalBookings,
      paymentMetrics,
      documentStats,
      roleDistribution,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      Booking.countDocuments(),
      
      // Payments calculation
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$amount", 0] } },
            successfulPayments: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
            failedPayments: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
            totalRefunds: { $sum: "$refundAmount" }
          }
        }
      ]),

      // Document Verification Status Breakdown
      BusinessDocument.aggregate([
        {
          $group: {
            _id: "$verificationStatus",
            count: { $sum: 1 }
          }
        }
      ]),

      // Role Distribution Breakdown
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Monthly Revenue Chart Data
      Payment.aggregate([
        { $match: { status: "success" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalBusinesses,
          totalBookings,
          totalRevenue: paymentMetrics[0]?.totalRevenue || 0,
          successfulPayments: paymentMetrics[0]?.successfulPayments || 0,
          failedPayments: paymentMetrics[0]?.failedPayments || 0,
          totalRefunds: paymentMetrics[0]?.totalRefunds || 0,
        },
        documentStats: documentStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        roleDistribution,
        monthlyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;