const express = require("express");
const router = express.Router();

const {
  createAdmin,
  getAdmin,
  updateAdminPassword,
  deleteAdmin,
} = require("../controllers/adminAuthController");

router.post("/create", createAdmin);
router.get("/", getAdmin);
router.put("/update-password", updateAdminPassword);
router.delete("/delete", deleteAdmin);

module.exports = router;