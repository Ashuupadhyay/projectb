
const Complaint = require("../models/Complaint");
const AdminCreatedUser = require("../models/AdminCreatedUser");

// CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      category,
      description,
    } = req.body;

    if (!customerId || !customerName || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const employee = await AdminCreatedUser.findById(req.user.id);

    if (!employee || !employee.isActive) {
      return res.status(401).json({
        success: false,
        message: "Employee not found or inactive",
      });
    }

    let complaintId;
    let existingComplaint;

    do {
      complaintId = String(
        Math.floor(100000 + Math.random() * 900000)
      );

      existingComplaint = await Complaint.findOne({ complaintId });
    } while (existingComplaint);

    const complaint = await Complaint.create({
      complaintId,
      customerId: customerId.trim(),
      customerName: customerName.trim(),
      category,
      description: description.trim(),
      registeredBy: employee.email,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL COMPLAINTS / FILTER BY EMPLOYEE EMAIL
exports.getAllComplaints = async (req, res) => {
  try {
    const { employeeEmail, status, complaintId } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (employeeEmail) {
      filter.registeredBy = employeeEmail.trim().toLowerCase();
    }

    if (status) {
      filter.status = status;
    }

    if (complaintId) {
      filter.complaintId = complaintId.trim();
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE COMPLAINT
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
      isDeleted: false,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE COMPLAINT
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
      isDeleted: false,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const allowedFields = [
      "customerId",
      "customerName",
      "category",
      "description",
      "status",
      "resolutionDetails",
    ];

    const changes = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          ["customerId", "customerName", "category", "description"].includes(field) &&
          typeof req.body[field] !== "string"
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
        }

        const value =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];

        if (String(complaint[field] ?? "") !== String(value)) {
          changes[field] = {
            oldValue: complaint[field],
            newValue: value,
          };

          complaint[field] = value;
        }
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes provided",
      });
    }

    if (
      changes.status &&
      !["Pending", "In Progress", "Resolved"].includes(changes.status.newValue)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    if (complaint.description.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
    }

    if (changes.status) {
      if (complaint.status === "Resolved") {
        complaint.resolvedBy = null;
        complaint.resolvedAt = null;
      }

      if (complaint.status === "Resolved") {
        complaint.resolvedBy = req.user.email;
        complaint.resolvedAt = new Date();
      }
    }

    if (changes.resolutionDetails && complaint.status === "Resolved") {
      complaint.resolvedBy = req.user.email;
      complaint.resolvedAt = new Date();
    }

    complaint.updatedBy = req.user.email;

    complaint.updateHistory.push({
      employeeEmail: req.user.email,
      updatedAt: new Date(),
      changes,
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SOFT DELETE COMPLAINT
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
      isDeleted: false,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    complaint.isDeleted = true;
    complaint.deletedBy = req.user.email;
    complaint.deletedAt = new Date();

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      data: {
        complaintId: complaint.complaintId,
        deletedBy: complaint.deletedBy,
        deletedAt: complaint.deletedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
