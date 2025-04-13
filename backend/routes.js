const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/arrival-times/:trainId", (req, res) => {
  const trainId = req.params.trainId;
  const query = `
    SELECT S.StationName, R.ArrivalTime 
    FROM Route R 
    JOIN Station S ON R.StationID = S.StationID 
    WHERE R.TrainID = ?
    ORDER BY R.SequenceNumber
  `;
  db.query(query, [trainId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/full/:trainId", (req, res) => {
  const trainId = req.params.trainId;
  const query = `
    SELECT 
      r.TrainID, r.SequenceNumber, s.StationID, s.StationName, s.City, s.State, r.ArrivalTime
    FROM Route r
    JOIN Station s ON r.StationID = s.StationID
    WHERE r.TrainID = ?
    ORDER BY r.SequenceNumber
  `;
  db.query(query, [trainId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
