const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/', (req, res) => {
    console.log("Received login request:", req.body);
    const { contact, password, role } = req.body; // Receive role from frontend as well
  
    let query = '';
    if (role === 'Admin') {
        query = `SELECT * FROM LoginDetails WHERE ContactNumber = ? AND Password = ? AND Role = 'Admin'`;
    } 
    else {
        query = `SELECT * FROM LoginDetails WHERE ContactNumber = ? AND Password = ? AND Role = 'Passenger'`;
    }

    db.query(query, [contact, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.send({ success: true, user: results[0] });
        } else {
            res.send({ success: false, message: "Invalid contact, password, or role" });
        }
    });
});

module.exports = router;
