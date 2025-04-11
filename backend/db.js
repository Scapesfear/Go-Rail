require('dotenv').config(); // Load environment variables from .env

const mysql = require('mysql2');

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || ''
});

// Connect and handle errors gracefully
db.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1); // Exit with failure code
  }
  console.log('Connected to MySQL');
});

module.exports = db;
