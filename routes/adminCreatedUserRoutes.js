const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/adminCreatedUserController");

const {
   createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");

const authMiddleware = require("../middleware/authMiddleware");

// USER ROUTES
router.post("/create",authMiddleware, createUser);
router.get("/all", getAllUsers);
router.post("/login", loginUser);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

// COMPLAINT ROUTES
router.post("/complaints/create", authMiddleware, createComplaint);

router.get("/complaints/all", authMiddleware, getAllComplaints);

router.get(
  "/complaints/:complaintId",
  authMiddleware,
  getComplaintById
);

router.put(
  "/complaints/update/:complaintId",
  authMiddleware,
  updateComplaint
);

router.delete(
  "/complaints/delete/:complaintId",
  authMiddleware,
  deleteComplaint
);
module.exports=router;