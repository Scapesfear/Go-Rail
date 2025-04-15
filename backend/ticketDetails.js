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
      B.BookingDate,
      W.WaitingID AS WaitingNumber
    FROM Booking B
    JOIN Passenger P ON B.PassengerID = P.PassengerID
    JOIN Coach C ON B.CoachID = C.CoachID
    JOIN Station S1 ON B.Source = S1.StationID
    JOIN Station S2 ON B.Destination = S2.StationID
    JOIN Train T ON B.TrainID = T.TrainID
    LEFT JOIN WaitingList W ON B.TicketID = W.TicketID
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

// Cancel ticket endpoint
router.post('/cancel-ticket/:ticketId', (req, res) => {
  const ticketId = req.params.ticketId;

  // Start transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ success: false, message: 'Error starting transaction' });
    }

    // First get ticket details
    db.query(`
      SELECT B.TrainID, B.CoachID, B.TravelDate, B.BookingStatus 
      FROM Booking B 
      WHERE B.TicketID = ? FOR UPDATE
    `, [ticketId], (err, ticketResults) => {
      if (err || ticketResults.length === 0) {
        return db.rollback(() => {
          res.status(400).json({ success: false, message: 'Ticket not found' });
        });
      }

      const ticket = ticketResults[0];
      
      // Check if ticket is already cancelled
      if (ticket.BookingStatus === 'CANCELLED') {
        return db.rollback(() => {
          res.status(400).json({ success: false, message: 'Ticket already cancelled' });
        });
      }

      // Update booking status to CANCELLED
      db.query(`
        UPDATE Booking 
        SET BookingStatus = 'CANCELLED', RefundStatus = 'Pending' 
        WHERE TicketID = ?
      `, [ticketId], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error updating booking status:', err);
            res.status(500).json({ success: false, message: 'Error cancelling ticket' });
          });
        }

        // Check if there are any waiting passengers for this train, coach and date
        db.query(`
          SELECT * FROM WaitingList 
          WHERE TrainID = ? AND CoachID = ? AND TravelDate = ?
          ORDER BY WaitingID ASC
          LIMIT 1
          FOR UPDATE
        `, [ticket.TrainID, ticket.CoachID, ticket.TravelDate], (err, waitingResults) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error checking waiting list:', err);
              res.status(500).json({ success: false, message: 'Error checking waiting list' });
            });
          }

          if (waitingResults.length > 0) {
            // There is someone in waiting list - confirm their ticket
            const waitingTicket = waitingResults[0];
            
            // Update the waiting passenger's booking to CONFIRMED
            db.query(`
              UPDATE Booking 
              SET BookingStatus = 'CONFIRMED' 
              WHERE TicketID = ?
            `, [waitingTicket.TicketID], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error confirming waiting ticket:', err);
                  res.status(500).json({ success: false, message: 'Error confirming waiting ticket' });
                });
              }

              // Remove from waiting list
              db.query(`
                DELETE FROM WaitingList 
                WHERE TicketID = ?
              `, [waitingTicket.TicketID], (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error removing from waiting list:', err);
                    res.status(500).json({ success: false, message: 'Error removing from waiting list' });
                  });
                }

                // Decrement waiting numbers for others in the same train/coach/date
                db.query(`
                  UPDATE WaitingList 
                  SET WaitingID = WaitingID - 1 
                  WHERE TrainID = ? AND CoachID = ? AND TravelDate = ? 
                  AND WaitingID > ?
                `, [ticket.TrainID, ticket.CoachID, ticket.TravelDate, waitingTicket.WaitingID], (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Error updating waiting numbers:', err);
                      res.status(500).json({ success: false, message: 'Error updating waiting numbers' });
                    });
                  }

                  // Commit transaction
                  db.commit(err => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Error committing transaction:', err);
                        res.status(500).json({ success: false, message: 'Error completing cancellation' });
                      });
                    }

                    res.json({ 
                      success: true, 
                      message: 'Ticket cancelled and waiting passenger confirmed',
                      confirmedTicketId: waitingTicket.TicketID
                    });
                  });
                });
              });
            });
          } else {
            // No one in waiting list - just increase available seats
            db.query(`
              UPDATE TrainAvailability 
              SET AvailableSeats = AvailableSeats + 1 
              WHERE TrainID = ? AND CoachID = ? AND TravelDate = ?
            `, [ticket.TrainID, ticket.CoachID, ticket.TravelDate], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error updating available seats:', err);
                  res.status(500).json({ success: false, message: 'Error updating available seats' });
                });
              }

              // Commit transaction
              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error committing transaction:', err);
                    res.status(500).json({ success: false, message: 'Error completing cancellation' });
                  });
                }

                res.json({ 
                  success: true, 
                  message: 'Ticket cancelled successfully',
                  seatsIncreased: 1
                });
              });
            });
          }
        });
      });
    });
  });
});

module.exports = router;