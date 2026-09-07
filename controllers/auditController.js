const AuditLog = require('../models/AuditLog');

// Create Audit Log Entry
exports.createAuditEntry = async (req, res) => {
  try {
    const log = await AuditLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Read Audit Logs with Filtering
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, targetEntity, targetId } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (targetEntity) filter.targetEntity = targetEntity;
    if (targetId) filter.targetId = targetId;

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).populate('actorId', 'name email role');
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};