const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
  const { loginID, fromStation, toStation, sortByBookings } = req.query;

  const shouldFilterStations = fromStation && toStation;
  const sortRequested = sortByBookings === "true";

  let sql = "";
  let params = [];

  if (!shouldFilterStations) {
    // Case 1: No station filtering
    sql = `
      SELECT 
        p.PassengerID, p.LoginID, p.FirstName, p.LastName, p.AadharNO, 
        p.Gender, p.Age, p.DOB, b.TrainID, b.TravelDate
      FROM Passenger p
      JOIN Booking b ON p.PassengerID = b.PassengerID
      WHERE (? IS NULL OR p.LoginID = ?)
      GROUP BY p.PassengerID, b.TrainID, b.TravelDate
    `;
    params = [loginID || null, loginID || null];

    if (sortRequested) {
      sql += `
        ORDER BY (SELECT COUNT(*) FROM Booking WHERE PassengerID = p.PassengerID) DESC
      `;
    }

  } else {
    // Case 2: Filter by station route logic
    sql = `
      SELECT DISTINCT 
        p.PassengerID, p.LoginID, p.FirstName, p.LastName, p.AadharNO, 
        p.Gender, p.Age, p.DOB, b.TrainID, b.TravelDate
      FROM Passenger p
      JOIN Booking b ON p.PassengerID = b.PassengerID
      JOIN (
        SELECT ta.TrainID, ta.TravelDate
        FROM Route r1
        JOIN Route r2 ON r1.TrainID = r2.TrainID AND r1.SequenceNumber < r2.SequenceNumber
        JOIN TrainAvailability ta ON ta.TrainID = r1.TrainID
        WHERE
          r1.StationID = (SELECT StationID FROM Station WHERE StationName = ?)
          AND r2.StationID = (SELECT StationID FROM Station WHERE StationName = ?)
      ) validRoutes 
      ON b.TrainID = validRoutes.TrainID AND b.TravelDate = validRoutes.TravelDate
      WHERE (? IS NULL OR p.LoginID = ?)
      GROUP BY p.PassengerID, b.TrainID, b.TravelDate
    `;
    params = [fromStation, toStation, loginID || null, loginID || null];

    if (sortRequested) {
      sql += `
        ORDER BY (SELECT COUNT(*) FROM Booking WHERE LoginID = p.LoginID) DESC
      `;
    }
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error in /passengers route:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
