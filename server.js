const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Routes
const adminCreatedUserRoutes = require("./routes/adminCreatedUserRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://10.162.20.231:5173",
  "https://rodiotradelink.com",
  "http://rodiotradelink.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/api/admin-auth", adminAuthRoutes);
// Admin Password Verification
app.post("/api/admin/verify-password", (req, res) => {
  const { password } = req.body;
  const ADMIN_SECRET = process.env.ADMIN_PASSWORD || "my";

  if (password === ADMIN_SECRET) {
    return res.status(200).json({
      success: true,
      message: "Access Granted",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid Password",
  });
});

// API Routes
app.use("/api/admin/analytics", require("./routes/adminAnalytics"));
app.use("/api/admin/crud", require("./routes/adminCrud"));
app.use("/api/website-analytics", require("./routes/websiteAnalytics"));
app.use("/api/admin-created-users", adminCreatedUserRoutes);

// Root Testing Route
app.get("/", (req, res) => {
  res.send("Transport Admin System API Running...");
});

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});