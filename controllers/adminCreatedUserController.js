const AdminCreatedUser = require("../models/AdminCreatedUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// CREATE USER (Admin Authentication Required)
exports.createUser = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    const existingUser = await AdminCreatedUser.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: normalizedMobile },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "Email already exists"
            : "Mobile number already exists",
      });
    }

    const userId = `RODIO-${crypto.randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await AdminCreatedUser.create({
      userId,
      name: name.trim(),
      mobile: normalizedMobile,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
  {
    id: user._id,
    userId: user.userId,
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    return res.status(201).json({
  success: true,
  message: "User created successfully",
  token,
  data: {
    userId: user.userId,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    password,
  },
});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN USER
// LOGIN USER (Email + Password)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await AdminCreatedUser.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// UPDATE USER (Admin Authentication Required)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, email, password } = req.body;

    const user = await AdminCreatedUser.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const normalizedEmail =
      email !== undefined ? email.trim().toLowerCase() : user.email;

    const normalizedMobile =
      mobile !== undefined ? mobile.trim() : user.mobile;

    // Check duplicate email/mobile excluding current user
    const existingUser = await AdminCreatedUser.findOne({
      _id: { $ne: id },
      $or: [
        { email: normalizedEmail },
        { mobile: normalizedMobile },
      ],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      if (existingUser.mobile === normalizedMobile) {
        return res.status(409).json({
          success: false,
          message: "Mobile number already exists",
        });
      }
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = normalizedEmail;
    if (mobile !== undefined) user.mobile = normalizedMobile;

    if (password !== undefined && password.trim()) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE USER (Admin Authentication Required)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await AdminCreatedUser.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminCreatedUser.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};