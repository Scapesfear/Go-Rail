const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/transactions", (req, res) => {
  const query = `
    SELECT l1.LoginID, l1.LoginName, l1.ContactNumber, l1.Email, l2.Amount, l2.BookingDate
    FROM LoginDetails l1
    INNER JOIN (
      SELECT Transactions.LoginID, Transactions.Amount, Booking.BookingDate
      FROM Transactions
      INNER JOIN Booking ON Transactions.TransactionID = Booking.TransactionID
      GROUP BY Transactions.LoginID, Transactions.Amount, Booking.BookingDate
      ORDER BY Booking.BookingDate
    ) l2 ON l1.LoginID = l2.LoginID
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Transaction query error:", err);
      return res.status(500).json({ success: false });
    }
    res.json(results);
  });
});

module.exports = router;
