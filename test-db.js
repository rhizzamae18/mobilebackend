require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to MySQL!");
    await connection.release();

    // Test query
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("Test query result:", rows[0].result); // Should be 2

    // Check if users table exists
    const [users] = await pool.query("SELECT * FROM users LIMIT 1");
    console.log("First user (if any):", users[0] || "No users found");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
})();
