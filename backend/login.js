const express = require('express');
const router = express.Router();
const db = require('./db');
const cors = require('cors');

// Enable CORS for all routes
router.use(cors());

router.post('/', (req, res) => {
    console.log("Received login request:", req.body);
    const { contact, password, role } = req.body; // Receive role from frontend as well
  
    let query = '';
    if (role === 'Admin') {
        query = `SELECT * FROM LoginDetails WHERE LoginName = ? AND Password = ? AND UserType = 'Admin'`;
    } else {
        query = `SELECT * FROM LoginDetails WHERE ContactNumber = ? AND Password = ? AND UserType = 'Passenger'`;
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
