require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is up and running!" });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ success: true, result: rows[0].result });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const [users] = await pool.query(
      "SELECT userID, first_name, email, password, userLevel FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (user.userLevel === "admin") {
      return res.json({
        success: false,
        message: "You can't access this account here",
      });
    }

    const hash = user.password.replace(/^\$2y/, "$2a");
    const isMatch = await bcrypt.compare(password, hash);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.userID,
        first_name: user.first_name,
        email: user.email,
        level: user.userLevel,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
