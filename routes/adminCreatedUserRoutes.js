const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/adminCreatedUserController");

router.post("/create", createUser);

router.get("/all", getAllUsers);

router.post("/login", loginUser);

router.put("/update/:id", updateUser);

router.delete("/delete/:id", deleteUser);

module.exports = router;