const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,        // e.g., 'localhost'
  user: process.env.DB_USER,        // e.g., 'user'
  password: process.env.DB_PASSWORD,// e.g., 'dialieasepass'
  database: process.env.DB_NAME     // e.g., 'capd'
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

module.exports = connection;
