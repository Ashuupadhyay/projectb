const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

const adminCreatedUserRoutes = require("./routes/adminCreatedUserRoutes");

app.use(cors());
app.use(express.json());

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

app.use("/api/admin/analytics", require("./routes/adminAnalytics"));
app.use("/api/admin/crud", require("./routes/adminCrud"));
app.use("/api/website-analytics", require("./routes/websiteAnalytics"));
app.use("/api/admin-created-users", adminCreatedUserRoutes);

app.get("/", (req, res) => {
  res.send("Transport Admin System API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});