const express = require("express");
const router = express.Router();
const db = require("./db");
const cors = require("cors");

// Enable CORS for this route (if needed, or you can do this globally in the server.js)
router.use(cors());

router.post("/", (req, res) => {
  console.log("Received login request:", req.body);
  const { contact, password, role, loginName } = req.body; // Receive role from frontend as well

  let query = "";

  // Admin login query
  if (role === "Admin") {
    console.log("helll");
    query = `SELECT * FROM LoginDetails WHERE LoginName = ? AND Password = ? AND UserType = 'Admin'`;
    db.query(query, [loginName, password], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length > 0) {
        res.send({ success: true, user: results[0] });
      } else {
        res.send({ success: false, message: "Invalid details" });
      }
    });
  }
  // Passenger login query
  else {
    console.log('hellllll');
    query = `SELECT * FROM LoginDetails WHERE ContactNumber = ? AND Password = ? AND UserType = 'Passenger'`;
    db.query(query, [contact, password], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length > 0) {
        res.send({ success: true, user: results[0] });
      } else {
        res.send({
          success: false,
          message: "Invalid ContactNumber, Password, or Role",
        });
      }
    });
  }
});

module.exports = router;
