const express = require("express");
const router = express.Router();

// ================= MODELS =================

const UserModel = require("../models/User");
const BusinessModel = require("../models/Business");
const BookingModel = require("../models/Booking");
const PaymentModel = require("../models/Payment");

const BusinessDocumentModel = require("../models/BusinessDocument");
const CommentModel = require("../models/Comment");
const SubscriptionModel = require("../models/Subscription");
const VehicleModel = require("../models/Vehicle");

// ================= MODEL MAP =================

const models = {
  user: UserModel,
  business: BusinessModel,
  booking: BookingModel,
  payment: PaymentModel,
  businessdocument: BusinessDocumentModel,
  comment: CommentModel,
  subscription: SubscriptionModel,
  vehicle: VehicleModel,
};

// ================= GET ALL =================
// GET /api/admin/crud/:model

router.get("/:model", async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found`,
      });
    }

    const data = await Model.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });

  } catch (error) {
    console.error("GET CRUD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ================= CREATE =================
// POST /api/admin/crud/:model

router.post("/:model", async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found`,
      });
    }

    const record = await Model.create(req.body);

    res.status(201).json({
      success: true,
      data: record,
    });

  } catch (error) {
    console.error("POST CRUD ERROR:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ================= UPDATE =================
// PUT /api/admin/crud/:model/:id

// router.put("/:model/:id", async (req, res) => {
//   try {
//     const modelName = req.params.model.toLowerCase();
//     const Model = models[modelName];

//     if (!Model) {
//       return res.status(404).json({
//         success: false,
//         message: `Model '${modelName}' not found`,
//       });
//     }

//     const updatedRecord = await Model.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedRecord) {
//       return res.status(404).json({
//         success: false,
//         message: `${modelName} record not found`,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: updatedRecord,
//     });

//   } catch (error) {
//     console.error("PUT CRUD ERROR:", error);

//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

router.put("/:model/:id", async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const recordId = req.params.id;

    console.log("=================================");
    console.log("🔥 PUT CRUD REQUEST");
    console.log("Model:", modelName);
    console.log("ID:", recordId);
    console.log("Body:", req.body);
    console.log("=================================");

    const Model = models[modelName];

    if (!Model) {
      console.log("❌ MODEL NOT FOUND:", modelName);

      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found`,
      });
    }

    // Pehle record check karo
    const existingRecord = await Model.findById(recordId);

    console.log(
      "Existing Record:",
      existingRecord ? "✅ FOUND" : "❌ NOT FOUND"
    );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: `${modelName} record not found`,
      });
    }

    const updatedRecord = await Model.findByIdAndUpdate(
      recordId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("Updated Record:", updatedRecord);

    return res.status(200).json({
      success: true,
      data: updatedRecord,
    });

  } catch (error) {
    console.error("❌ PUT CRUD ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
// ================= DELETE =================
// DELETE /api/admin/crud/:model/:id

router.delete("/:model/:id", async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found`,
      });
    }

    const deletedRecord = await Model.findByIdAndDelete(
      req.params.id
    );

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: `${modelName} record not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${modelName} deleted successfully`,
      data: deletedRecord,
    });

  } catch (error) {
    console.error("DELETE CRUD ERROR:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;