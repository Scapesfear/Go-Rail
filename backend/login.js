const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/', (req, res) => { //req contains the data that is sent
    console.log("Received login request:", req.body);
    const { contact, password } = req.body;
    const query = `SELECT * FROM LoginDetails WHERE ContactNumber = ? AND Password = ?`;
  
    db.query(query, [contact, password], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length > 0) {
        res.send({ success: true, user: results[0] });
      } else {
        res.send({ success: false, message: "Invalid contact or password" });
      }
    });
});

module.exports = router;