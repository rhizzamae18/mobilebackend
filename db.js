const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "user", // default user for XAMPP
  password: "dialieasepass", // empty by default in XAMPP
  database: "capd", // change to your DB name
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

module.exports = connection;
