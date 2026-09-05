const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const app = express();
const adminUserRoutes = require("./routes/adminAnalytics");
//const auditLogRoutes = require("./routes/auditLogRoutes");
const ticketMessageRoutes = require("./routes/ticketMessageRoutes");
//const adminUserAnalyticsRoutes = require("./routes/adminUserAnalyticsRoutes");
// Middlewares
app.use(cors());
app.use(express.json());
//app.use("/api/admin/users", adminUserRoutes);
//app.use("/api/admin/audit-logs", auditLogRoutes);
//cls
// app.use("/api/admin/ticket-messages", ticketMessageRoutes);
// app.use(
//   "/api/admin/user-analytics",
//   adminUserAnalyticsRoutes
// );

// ==========================================
// ADMIN PASSWORD VERIFICATION ROUTE
// ==========================================
app.post("/api/admin/verify-password", (req, res) => {
  const { password } = req.body;

  // Aap `.env` file me ADMIN_PASSWORD set kar sakte hain, 
  // ya fir yahan default password "mysecretpassword123" ki jagah apna password likh sakte hain.
  const ADMIN_SECRET = process.env.ADMIN_PASSWORD || "mysecretpassword123";

  if (password === ADMIN_SECRET) {
    return res.status(200).json({ success: true, message: "Access Granted" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid Password" });
  }
});

// Routes
app.use("/api/admin/analytics", require("./routes/adminAnalytics"));
app.use("/api/admin/crud", require("./routes/adminCrud"));
app.use("/api/website-analytics", require("./routes/websiteAnalytics"));

// Root Testing Route
app.get("/", (req, res) => {
  res.send("Transport Admin System API Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});