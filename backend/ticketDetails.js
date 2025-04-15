const express = require('express');
const router = express.Router();
const db = require('./db');

// Get booking details by transaction ID
router.get('/ticket-details/:transactionID', (req, res) => {
  const transactionID = req.params.transactionID;

  const query = `
    SELECT 
      B.TicketID,
      P.FirstName,
      P.LastName,
      C.CoachName,
      S1.StationName AS SourceStation,
      S2.StationName AS DestinationStation,
      T.TrainName,
      B.TravelDate,
      B.BookingStatus,
      B.RefundStatus,
      B.BookingDate
    FROM Booking B
    JOIN Passenger P ON B.PassengerID = P.PassengerID
    JOIN Coach C ON B.CoachID = C.CoachID
    JOIN Station S1 ON B.Source = S1.StationID
    JOIN Station S2 ON B.Destination = S2.StationID
    JOIN Train T ON B.TrainID = T.TrainID
    WHERE B.TransactionID = ?
  `;

  db.query(query, [transactionID], (err, results) => {
    if (err) {
      console.error('Error fetching ticket details:', err);
      return res.status(500).json({ error: 'Error fetching ticket details' });
    }
    res.json(results);
  });
});

module.exports = router;