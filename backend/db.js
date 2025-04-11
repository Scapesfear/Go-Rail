const mysql = require('mysql2');
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "harshit1",
  database: "IRCTC_DB6"
});
db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL");
});
module.exports = db;
