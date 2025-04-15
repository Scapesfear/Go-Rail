const express = require('express');
const router = express.Router();
const db = require('./db'); // <-- this should point to your db.js
// Get all bookings

router.get('/all', (req, res) => {
  const query = 'SELECT * FROM Booking';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all bookings:", err);
      return res.status(500).json({ success: false });
    }
    res.json(results);
  });
});

// Process refund
router.post('/refund/:ticketID', (req, res) => {
  const ticketID = req.params.ticketID;
  const query = `UPDATE Booking SET RefundStatus = 'Processed' WHERE TicketID = ? AND BookingStatus = 'CANCELLED'`;

  db.query(query, [ticketID], (err, result) => {
    if (err) {
      console.error("Refund error:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

router.get('/:loginID', (req, res) => {
  const loginID = req.params.loginID;
  const query = `
  SELECT 
    B.TransactionID, 
    T.TrainName, 
    B.BookingDate AS BookingDate
  FROM Booking B 
  NATURAL JOIN Train T
  WHERE B.LoginID = ? 
  GROUP BY B.TransactionID, T.TrainName, B.BookingDate
  ORDER BY BookingDate DESC;
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