const TicketMessage = require('../models/TicketMessage');

// Create Message
exports.createMessage = async (req, res) => {
  try {
    const message = await TicketMessage.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Read Messages by Ticket ID
exports.getMessagesByTicket = async (req, res) => {
  try {
    const { includeInternal } = req.query;
    const filter = { ticketId: req.params.ticketId };

    if (includeInternal !== 'true') {
      filter.isInternalNote = false;
    }

    const messages = await TicketMessage.find(filter).sort({ createdAt: 1 }).populate('senderId', 'name role');
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Message
exports.updateMessage = async (req, res) => {
  try {
    const message = await TicketMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await TicketMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ANALYTICAL QUERY: First Response Time (FRT) Math Metric
exports.getFirstResponseTimeMetrics = async (req, res) => {
  try {
    const frtData = await TicketMessage.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$ticketId',
          firstCustomerMsg: { $first: { $cond: [{ $eq: ['$senderType', 'customer'] }, '$createdAt', null] } },
          firstAgentMsg: { $first: { $cond: [{ $eq: ['$senderType', 'agent'] }, '$createdAt', null] } }
        }
      },
      { $match: { firstCustomerMsg: { $ne: null }, firstAgentMsg: { $ne: null } } },
      {
        $project: {
          ticketId: '$_id',
          frtMinutes: {
            $divide: [{ $subtract: ['$firstAgentMsg', '$firstCustomerMsg'] }, 1000 * 60]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgFRTMinutes: { $avg: '$frtMinutes' },
          minFRTMinutes: { $min: '$frtMinutes' },
          maxFRTMinutes: { $max: '$frtMinutes' }
        }
      },
      {
        $project: {
          _id: 0,
          avgFRTMinutes: { $round: ['$avgFRTMinutes', 2] },
          minFRTMinutes: { $round: ['$minFRTMinutes', 2] },
          maxFRTMinutes: { $round: ['$maxFRTMinutes', 2] }
        }
      }
    ]);

    res.status(200).json({ success: true, data: frtData[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};