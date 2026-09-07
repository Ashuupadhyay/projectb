const UserModel = require("../models/User");
const User = UserModel.User || UserModel.default || UserModel;

const BusinessModel = require("../models/Business");
const Business = BusinessModel.Business || BusinessModel.default || BusinessModel;

const BookingModel = require("../models/Booking");
const Booking = BookingModel.Booking || BookingModel.default || BookingModel;

const PaymentModel = require("../models/Payment");
const Payment = PaymentModel.Payment || PaymentModel.default || PaymentModel;

// 1. ADVANCED GRAPH & AGGREGATED METRICS ANALYTICS
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubscribed = await User.countDocuments({ "subscription.status": "active" });
    const totalBusinesses = await Business.countDocuments();
    const totalEnquiries = await Booking.countDocuments();

    // Date Boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const successCondition = { status: { $in: ["SUCCESS", "PAID", "COMPLETED", "success"] } };

    // Math Aggregates
    const todayRev = await Payment.aggregate([
      { $match: { ...successCondition, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const yesterdayRev = await Payment.aggregate([
      { $match: { ...successCondition, createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRev = await Payment.aggregate([
      { $match: successCondition },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 7 Days Revenue Trend Data for Graph
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenueTrend = await Payment.aggregate([
      { $match: { ...successCondition, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSubscribed,
        totalBusinesses,
        totalEnquiries,
        todayRevenue: todayRev[0]?.total || 0,
        yesterdayRevenue: yesterdayRev[0]?.total || 0,
        totalRevenue: totalRev[0]?.total || 0,
        graphData: revenueTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= USER CRUD & SUPPORT =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= BUSINESS CRUD =================
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate("user", "mobile firmName").sort({ createdAt: -1 });
    res.status(200).json({ success: true, businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBusiness = async (req, res) => {
  try {
    const business = await Business.create(req.body);
    res.status(201).json({ success: true, business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Business record removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= BOOKING / LOAD ENQUIRY CRUD =================
exports.getLoadEnquiries = async (req, res) => {
  try {
    const enquiries = await Booking.find().populate("user", "mobile firmName").sort({ createdAt: -1 });
    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Load enquiry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PAYMENT CRUD & AUDIT =================
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user", "mobile firmName").sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Payment transaction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};