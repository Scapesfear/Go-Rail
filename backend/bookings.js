const express = require('express');
const router = express.Router();
const db = require('./db'); // <-- this should point to your db.js

router.get('/:loginID', (req, res) => {
  const loginID = req.params.loginID;
  const query = `
  SELECT 
    B.TicketID, 
    T.TrainName, 
    B.BookingDate AS BookingDate, 
    B.BookingStatus 
  FROM Booking B 
  JOIN Train T ON B.TrainID = T.TrainID 
  WHERE B.LoginID = ? 
  ORDER BY B.BookingDate DESC
`;




  db.query(query, [loginID], (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(results);
  });
});

module.exports = router;