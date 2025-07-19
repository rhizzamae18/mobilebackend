require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Using promises for async/await
const bcrypt = require("bcryptjs"); // Supports PHP $2y$ hashes

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Replaces body-parser in modern Express

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Login endpoint for both patients and staff
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // 1. Find user by email
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
        message: "You cant't access this account here",
      });
    }

    // 2. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Successful login - return user level
    res.json({
      success: true,
      user: {
        id: user.userID,
        first_name: user.first_name,
        email: user.email,
        level: user.userLevel, // Changed from user.level to user.userLevel
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
