const express = require("express");
const router = express.Router();
const db = require("./db");

// Route 1: Revenue per train
router.get("/revenue", (req, res) => {
  const query = `
    SELECT T.TrainID, T.TrainName, SUM(TR.Amount) AS Revenue
    FROM Train T
    JOIN Booking B ON T.TrainID = B.TrainID
    JOIN Transactions TR ON B.TransactionID = TR.TransactionID
    GROUP BY T.TrainID, T.TrainName
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Revenue query failed:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Route 2: Max bookings date per train
router.get("/max-bookings", (req, res) => {
  const query = `
    SELECT t1.TrainID, t1.TrainName, t2.TravelDate, t2.MaxBookings
    FROM Train t1
    INNER JOIN (
      SELECT b.TrainID, b.TravelDate, COUNT(*) AS MaxBookings
      FROM Booking b
      GROUP BY b.TrainID, b.TravelDate
      HAVING COUNT(*) = (
        SELECT MAX(b2.count)
        FROM (
          SELECT b1.TrainID, b1.TravelDate, COUNT(*) AS count
          FROM Booking b1
          WHERE b1.TrainID = b.TrainID
          GROUP BY b1.TrainID, b1.TravelDate
        ) AS b2
      )
    ) t2 ON t1.TrainID = t2.TrainID
    ORDER BY t1.TrainID
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Max bookings query failed:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
