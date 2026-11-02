const User = require('../models/User');
const SupportTicket = require('../models/SupportTicket');

// Create User
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Read All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Read Single User
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ANALYTICAL QUERY 1: Agent Workload Allocation
exports.getAgentWorkload = async (req, res) => {
  try {
    const workload = await SupportTicket.aggregate([
      { $match: { status: { $in: ['open', 'in_progress'] }, assignedAgentId: { $ne: null } } },
      { $group: { _id: '$assignedAgentId', activeTickets: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agentDetails' } },
      { $unwind: '$agentDetails' },
      { $project: { agentId: '$_id', agentName: '$agentDetails.name', email: '$agentDetails.email', activeTickets: 1, _id: 0 } }
    ]);
    res.status(200).json({ success: true, data: workload });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ANALYTICAL QUERY 2: High-Risk Customer Audit
exports.getHighRiskCustomers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: { $in: ['suspended', 'banned'] } };

    if (startDate && endDate) {
      query.updatedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const highRiskUsers = await User.find(query).select('name email role status updatedAt');
    res.status(200).json({ success: true, count: highRiskUsers.length, data: highRiskUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};