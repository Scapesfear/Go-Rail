const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/', (req, res) => {
    const { name, password, contact, email, userType } = req.body;
  
    const query = `INSERT INTO LoginDetails (LoginName, Password, ContactNumber, Email, UserType) VALUES (?, ?, ?, ?, ?)`;
  
    db.query(query, [name, password, contact, email, userType], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.send({ success: false, message: "Contact or email already exists" });
        }
        return res.status(500).send(err);
      }
      res.send({ success: true });
    });
});

module.exports = router;