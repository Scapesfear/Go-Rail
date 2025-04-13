const express = require("express");
const router = express.Router();
const db = require("./db");

// Query 1: Trains from city to city (optional travelDate)
router.get("/by-city", (req, res) => {
  const { fromCity, toCity, travelDate } = req.query;

  let query = `
    SELECT 
        r3.TrainID, 
        r3.arrivalTime, 
        r3.reachingTime, 
        srcStation.StationName AS sourceStation, 
        destStation.StationName AS destinationStation, 
        ta.TravelDate, ta.CoachID, ta.Price, ta.AvailableSeats
    FROM 
        (
            SELECT DISTINCT 
                r1.TrainID, 
                r1.arrivalTime, 
                r2.arrivalTime AS reachingTime, 
                r1.StationID AS sourceStationID, 
                r2.StationID AS destinationStationID  
            FROM Route r1 
            JOIN Route r2 ON r1.TrainID = r2.TrainID 
            WHERE 
                r1.StationID IN (SELECT StationID FROM Station WHERE city = ?) 
                AND r2.StationID IN (SELECT StationID FROM Station WHERE city = ?) 
                AND r1.SequenceNumber < r2.SequenceNumber
        ) AS r3
    NATURAL JOIN TrainAvailability ta
    JOIN Station srcStation ON r3.sourceStationID = srcStation.StationID
    JOIN Station destStation ON r3.destinationStationID = destStation.StationID
  `;

  const params = [fromCity, toCity];

  if (travelDate) {
    query += ` WHERE ta.TravelDate = ?`;
    params.push(travelDate);
  }

  query += ` ORDER BY ta.TravelDate`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error in /by-city:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

// Query 2: Trains between two stations (optional travelDate)
router.get("/by-station", (req, res) => {
  const { fromStation, toStation, travelDate } = req.query;

  let query = `
    SELECT * 
    FROM (
        SELECT DISTINCT 
            r1.TrainID, 
            r1.arrivalTime, 
            r2.arrivalTime AS reachingTime 

        FROM Route r1 
        JOIN Route r2 ON r1.TrainID = r2.TrainID
        WHERE 
            r1.StationID = (SELECT StationID FROM Station WHERE StationName = ?) 
            AND r2.StationID = (SELECT StationID FROM Station WHERE StationName = ?) 
            AND r1.SequenceNumber < r2.SequenceNumber
    ) AS r3 
    NATURAL JOIN TrainAvailability
  `;

  const params = [fromStation, toStation];

  if (travelDate) {
    query += ` WHERE TravelDate = ?`;
    params.push(travelDate);
  }

  query += ` ORDER BY TravelDate`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error in /by-station:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

// Default: All Trains (min-max route logic)
router.get("/all", (req, res) => {
  const query = `
    SELECT 
      ta.TrainID,
      ta.TravelDate,
      ta.CoachID,
      ta.Price,
      ta.AvailableSeats,
      r1.ArrivalTime AS arrivalTime,
      r2.ArrivalTime AS reachingTime,
      s1.StationName AS sourceStation,
      s2.StationName AS destinationStation
    FROM TrainAvailability ta
    JOIN Route r1 ON ta.TrainID = r1.TrainID
    JOIN Route r2 ON ta.TrainID = r2.TrainID AND r1.SequenceNumber < r2.SequenceNumber
    JOIN Station s1 ON r1.StationID = s1.StationID
    JOIN Station s2 ON r2.StationID = s2.StationID
    WHERE r1.SequenceNumber = (
      SELECT MIN(r3.SequenceNumber) FROM Route r3 WHERE r3.TrainID = ta.TrainID
    )
    AND r2.SequenceNumber = (
      SELECT MAX(r4.SequenceNumber) FROM Route r4 WHERE r4.TrainID = ta.TrainID
    )
    ORDER BY ta.TravelDate;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ SQL Error in /trains/all:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

router.get("/by-time-range", (req, res) => {
  const { stationName, fromTime, toTime, travelDate } = req.query;

  const query = `
    SELECT 
  t1.TrainID as TrainID,
  t1.TrainName as TrainName,
  t2.TravelDate as TravelDate,
  t2.CoachID as CoachID,
  t2.Price as Price,
  t2.AvailableSeats as AvailableSeats,
  t2.ArrivalTime as arrivalTime
    FROM Train t1 
    INNER JOIN (
      SELECT ta.TrainID, ta.TravelDate, ta.CoachID, ta.Price, ta.AvailableSeats, r.ArrivalTime
      FROM TrainAvailability ta
      INNER JOIN Route r ON ta.TrainID = r.TrainID
      WHERE r.ArrivalTime BETWEEN ? AND ?
        AND ta.TravelDate = ?
        AND r.StationID = (SELECT StationID FROM Station WHERE StationName = ?)
    ) AS t2 ON t1.TrainID = t2.TrainID
    ORDER BY t2.ArrivalTime
  `;

  const params = [fromTime, toTime, travelDate, stationName];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error in /by-time-range:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;