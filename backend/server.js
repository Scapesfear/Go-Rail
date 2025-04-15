const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 3001;// You can change this port if needed

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'] // Explicitly allow your frontend origin
}));
app.use(bodyParser.json());

// Import your route handlers
const loginRoutes = require('./login');
const signupRoutes = require('./signup');
const bookingsRoutes = require('./bookings');
const passengerRoutes = require('./passengers');
const transactionRoutes = require('./transactions');
const trainRoutes = require('./trains');
const financeRoutes = require("./finances");
const routeRoutes = require('./routes');
const ticketDetailsRoutes = require('./ticketDetails');





// Use the routes
// app.post('/login', loginRoutes); //When request is made to /login loginRoutes handles it
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
app.use('/bookings', bookingsRoutes);    
app.use('/passengers', passengerRoutes);
app.use('/', transactionRoutes);
app.use('/trains', trainRoutes);
app.use("/finances", financeRoutes);
app.use('/routes', routeRoutes);
app.use('/', ticketDetailsRoutes);

// New routes for booking page
app.get('/stations', (req, res) => {
    const query = 'SELECT StationID, StationName, City, State FROM Station ORDER BY StationName';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stations:', err);
            return res.status(500).json({ error: 'Error fetching stations' });
        }
        res.json(results);
    });
});

app.get('/journey-dates', (req, res) => {
    const query = 'SELECT DISTINCT TravelDate FROM TrainAvailability ORDER BY TravelDate';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching journey dates:', err);
            return res.status(500).json({ error: 'Error fetching journey dates' });
        }
        // Format dates in JavaScript instead of SQL
        const formattedResults = results.map(date => ({
            TravelDate: new Date(date.TravelDate).toISOString().split('T')[0]
        }));
        res.json(formattedResults);
    });
});

app.get('/coaches', (req, res) => {
    const query = 'SELECT CoachID, CoachName FROM Coach ORDER BY CoachID';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching coaches:', err);
            return res.status(500).json({ error: 'Error fetching coaches' });
        }
        res.json(results);
    });
});

app.get('/available-trains', (req, res) => {
    const { source, destination, date, coach, passengers } = req.query;
    
    const query = `
        SELECT 
            t.TrainID,
            t.TrainName,
            src.StationName AS SourceStation,
            dest.StationName AS DestinationStation,
            r_src.ArrivalTime AS DepartureTime,
            r_dest.ArrivalTime AS ArrivalTime,
            c.CoachName,
            ta.Price,
            ta.AvailableSeats
        FROM Route r_src
        JOIN Route r_dest ON r_src.TrainID = r_dest.TrainID
        JOIN Train t ON r_src.TrainID = t.TrainID
        JOIN Station src ON r_src.StationID = src.StationID
        JOIN Station dest ON r_dest.StationID = dest.StationID
        JOIN TrainAvailability ta ON r_src.TrainID = ta.TrainID AND ta.TravelDate = ?
        JOIN Coach c ON ta.CoachID = c.CoachID AND c.CoachName = ?
        WHERE 
            src.StationName = ?
            AND dest.StationName = ?
            AND r_src.SequenceNumber < r_dest.SequenceNumber
        ORDER BY 
            t.TrainName, c.CoachName
    `;

    db.query(query, [date, coach, source, destination], (err, results) => {
        if (err) {
            console.error('Error fetching available trains:', err);
            return res.status(500).json({ error: 'Error fetching available trains' });
        }
        res.json(results);
    });
});

app.get('/train-details/:trainId', (req, res) => {
    const trainId = req.params.trainId;
    const { coach, source, destination } = req.query;
    
    const query = `
        SELECT 
            t.TrainID,
            t.TrainName,
            src.StationName AS SourceStation,
            dest.StationName AS DestinationStation,
            r_src.ArrivalTime AS DepartureTime,
            r_dest.ArrivalTime AS ArrivalTime,
            c.CoachName,
            ta.Price,
            ta.AvailableSeats
        FROM Route r_src
        JOIN Route r_dest ON r_src.TrainID = r_dest.TrainID
        JOIN Train t ON r_src.TrainID = t.TrainID
        JOIN Station src ON r_src.StationID = src.StationID
        JOIN Station dest ON r_dest.StationID = dest.StationID
        JOIN TrainAvailability ta ON r_src.TrainID = ta.TrainID
        JOIN Coach c ON ta.CoachID = c.CoachID AND c.CoachName = ?
        WHERE 
            t.TrainID = ?
            AND src.StationName = ?
            AND dest.StationName = ?
            AND r_src.SequenceNumber < r_dest.SequenceNumber
        LIMIT 1
    `;

    db.query(query, [coach, trainId, source, destination], (err, results) => {
        if (err) {
            console.error('Error fetching train details:', err);
            return res.status(500).json({ error: 'Error fetching train details' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Train not found' });
        }
        res.json(results[0]);
    });
});

// Book tickets endpoint
app.post('/book-tickets', (req, res) => {
    const {
        loginId,
        trainId,
        travelDate,
        coachClass,
        paymentMethod,
        totalAmount,
        passengers,
        sourceStation,
        destinationStation
    } = req.body;

    // Input validation
    if (!loginId || !trainId || !travelDate || !coachClass || !paymentMethod || !totalAmount || !passengers || !sourceStation || !destinationStation) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields in booking request'
        });
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid passenger data'
        });
    }

    // Validate each passenger's data
    for (const passenger of passengers) {
        if (!passenger.firstName || !passenger.lastName || !passenger.aadharNo || !passenger.gender || !passenger.age || !passenger.dob) {
            return res.status(400).json({
                success: false,
                message: 'Invalid passenger details. All fields are required.'
            });
        }
    }

    console.log('Starting booking process for:', {
        loginId,
        trainId,
        travelDate,
        coachClass,
        passengerCount: passengers.length
    });

    // Start transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({
                success: false,
                message: 'Error starting booking transaction'
            });
        }

        // Get coach ID from coach class
        db.query(
            'SELECT CoachID FROM Coach WHERE CoachName = ?',
            [coachClass],
            (err, coachResult) => {
                if (err) {
                    db.rollback(() => {
                        console.error('Error getting coach ID:', err);
                        res.status(500).json({
                            success: false,
                            message: 'Error retrieving coach information'
                        });
                    });
                    return;
                }

                if (!coachResult || coachResult.length === 0) {
                    db.rollback(() => {
                        res.status(400).json({
                            success: false,
                            message: 'Invalid coach class'
                        });
                    });
                    return;
                }

                const coachId = coachResult[0].CoachID;
                console.log('Retrieved coach ID:', coachId);

                // Get source and destination station IDs
                db.query(
                    'SELECT StationID FROM Station WHERE StationName = ?',
                    [sourceStation],
                    (err, sourceStationResult) => {
                        if (err) {
                            db.rollback(() => {
                                console.error('Error getting source station:', err);
                                res.status(500).json({
                                    success: false,
                                    message: 'Error retrieving source station information'
                                });
                            });
                            return;
                        }

                        if (!sourceStationResult || sourceStationResult.length === 0) {
                            db.rollback(() => {
                                res.status(400).json({
                                    success: false,
                                    message: 'Invalid source station'
                                });
                            });
                            return;
                        }

                        const sourceStationId = sourceStationResult[0].StationID;

                        db.query(
                            'SELECT StationID FROM Station WHERE StationName = ?',
                            [destinationStation],
                            (err, destStationResult) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error('Error getting destination station:', err);
                                        res.status(500).json({
                                            success: false,
                                            message: 'Error retrieving destination station information'
                                        });
                                    });
                                    return;
                                }

                                if (!destStationResult || destStationResult.length === 0) {
                                    db.rollback(() => {
                                        res.status(400).json({
                                            success: false,
                                            message: 'Invalid destination station'
                                        });
                                    });
                                    return;
                                }

                                const destStationId = destStationResult[0].StationID;

                                // Check available seats
                                db.query(
                                    'SELECT AvailableSeats FROM TrainAvailability WHERE TrainID = ? AND TravelDate = ? AND CoachID = ?',
                                    [trainId, travelDate, coachId],
                                    (err, availability) => {
                                        if (err) {
                                            db.rollback(() => {
                                                console.error('Error checking availability:', err);
                                                res.status(500).json({
                                                    success: false,
                                                    message: 'Error checking seat availability'
                                                });
                                            });
                                            return;
                                        }

                                        // First check if we have a record
                                        if (!availability || availability.length === 0) {
                                            // Try to create a new availability record if none exists
                                            db.query(
                                                'INSERT INTO TrainAvailability (TrainID, TravelDate, CoachID, AvailableSeats) VALUES (?, ?, ?, 11)',
                                                [trainId, travelDate, coachId],
                                                (err, result) => {
                                                    if (err) {
                                                        db.rollback(() => {
                                                            console.error('Error creating availability record:', err);
                                                            res.status(500).json({
                                                                success: false,
                                                                message: 'Error creating availability record'
                                                            });
                                                        });
                                                        return;
                                                    }
                                                    
                                                    const availableSeats = 11;
                                                    processBookingWithSeats(coachId, sourceStationId, destStationId, availableSeats);
                                                }
                                            );
                                        } else {
                                            const availableSeats = availability[0].AvailableSeats;
                                            processBookingWithSeats(coachId, sourceStationId, destStationId, availableSeats);
                                        }
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });

    function processBookingWithSeats(coachId, sourceStationId, destStationId, availableSeats) {
        // Insert transaction record
        db.query(
            'INSERT INTO Transactions (TransactionID, LoginID, PaymentMean, Amount) VALUES (NULL, ?, ?, ?)',
            [loginId, paymentMethod, totalAmount],
            (err, transactionResult) => {
                if (err) {
                    db.rollback(() => {
                        console.error('Error creating transaction:', err);
                        res.status(500).json({
                            success: false,
                            message: 'Error creating transaction record'
                        });
                    });
                    return;
                }

                const transactionId = transactionResult.insertId;
                const confirmedSeats = Math.min(availableSeats, passengers.length);
                const waitlistedSeats = Math.max(0, passengers.length - availableSeats);

                // Process each passenger
                let processedPassengers = 0;
                let hasError = false;

                passengers.forEach((passenger, index) => {
                    if (hasError) return;

                    const isWaitlisted = index >= confirmedSeats;
                    
                    // Insert passenger record
                    db.query(
                        'INSERT INTO Passenger (LoginID, FirstName, LastName, AadharNO, Gender, Age, DOB) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [
                            loginId,
                            passenger.firstName,
                            passenger.lastName,
                            passenger.aadharNo,
                            passenger.gender,
                            passenger.age,
                            passenger.dob
                        ],
                        (err, passengerResult) => {
                            if (err) {
                                hasError = true;
                                db.rollback(() => {
                                    console.error('Error creating passenger:', err);
                                    res.status(500).json({
                                        success: false,
                                        message: 'Error creating passenger record'
                                    });
                                });
                                return;
                            }

                            const passengerId = passengerResult.insertId;

                            // Insert booking record
                            db.query(
                                'INSERT INTO Booking (TransactionID, PassengerID, TrainID, LoginID, CoachID, BookingDate, BookingStatus, RefundStatus, Source, TravelDate, Destination) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)',
                                [
                                    transactionId,
                                    passengerId,
                                    trainId,
                                    loginId,
                                    coachId,
                                    isWaitlisted ? 'WAITING' : 'CONFIRMED',
                                    'Not requested',
                                    sourceStationId,
                                    travelDate,
                                    destStationId
                                ],
                                (err, bookingResult) => {
                                    if (err) {
                                        hasError = true;
                                        db.rollback(() => {
                                            console.error('Error creating booking:', err);
                                            res.status(500).json({
                                                success: false,
                                                message: 'Error creating booking record'
                                            });
                                        });
                                        return;
                                    }

                                    const ticketId = bookingResult.insertId;

                                    // If waitlisted, insert into WaitingList table
                                    if (isWaitlisted) {
                                        // Get the next waiting ID for this train, coach, and travel date
                                        db.query(
                                            'SELECT COALESCE(MAX(WaitingID), 0) + 1 as nextWaitingId FROM WaitingList WHERE TrainID = ? AND CoachID = ? AND TravelDate = ?',
                                            [trainId, coachId, travelDate],
                                            (err, waitingIdResult) => {
                                                if (err) {
                                                    hasError = true;
                                                    db.rollback(() => {
                                                        console.error('Error getting next waiting ID:', err);
                                                        res.status(500).json({
                                                            success: false,
                                                            message: 'Error getting waiting list ID'
                                                        });
                                                    });
                                                    return;
                                                }

                                                const waitingId = waitingIdResult[0].nextWaitingId;

                                                // Insert into WaitingList
                                                db.query(
                                                    'INSERT INTO WaitingList (WaitingID, PassengerID, TrainID, CoachID, TicketID, TravelDate) VALUES (?, ?, ?, ?, ?, ?)',
                                                    [waitingId, passengerId, trainId, coachId, ticketId, travelDate],
                                                    (err) => {
                                                        if (err) {
                                                            hasError = true;
                                                            db.rollback(() => {
                                                                console.error('Error creating waiting list entry:', err);
                                                                res.status(500).json({
                                                                    success: false,
                                                                    message: 'Error creating waiting list entry'
                                                                });
                                                            });
                                                            return;
                                                        }

                                                        processNextPassenger();
                                                    }
                                                );
                                            }
                                        );
                                    } else {
                                        processNextPassenger();
                                    }
                                }
                            );
                        }
                    );
                });

                function processNextPassenger() {
                    processedPassengers++;
                    if (processedPassengers === passengers.length && !hasError) {
                        // Update available seats only for confirmed bookings
                        if (confirmedSeats > 0) {
                            db.query(
                                'UPDATE TrainAvailability SET AvailableSeats = AvailableSeats - ? WHERE TrainID = ? AND TravelDate = ? AND CoachID = ?',
                                [confirmedSeats, trainId, travelDate, coachId],
                                (err) => {
                                    if (err) {
                                        db.rollback(() => {
                                            console.error('Error updating availability:', err);
                                            res.status(500).json({
                                                success: false,
                                                message: 'Error updating seat availability'
                                            });
                                        });
                                        return;
                                    }
                                    completeBooking();
                                }
                            );
                        } else {
                            completeBooking();
                        }
                    }
                }

                function completeBooking() {
                    // Get train details for confirmation
                    db.query(
                        'SELECT t.TrainName, t.TrainID, c.CoachName, ta.AvailableSeats FROM Train t JOIN Coach c ON c.CoachID = ? JOIN TrainAvailability ta ON ta.TrainID = t.TrainID AND ta.CoachID = c.CoachID WHERE t.TrainID = ?',
                        [coachId, trainId],
                        (err, trainDetails) => {
                            if (err) {
                                db.rollback(() => {
                                    console.error('Error getting train details:', err);
                                    res.status(500).json({
                                        success: false,
                                        message: 'Error getting train details'
                                    });
                                });
                                return;
                            }

                            // Commit transaction
                            db.commit((err) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error('Error committing transaction:', err);
                                        res.status(500).json({
                                            success: false,
                                            message: 'Error finalizing booking'
                                        });
                                    });
                                    return;
                                }

                                console.log('Booking completed successfully:', {
                                    transactionId,
                                    confirmedSeats,
                                    waitlistedSeats
                                });

                                res.json({
                                    success: true,
                                    message: 'Tickets booked successfully',
                                    transactionId: transactionId,
                                    bookingDetails: {
                                        passengers: passengers.map(p => ({
                                            name: `${p.firstName} ${p.lastName}`,
                                            aadhar: p.aadharNo,
                                            age: p.age,
                                            gender: p.gender
                                        })),
                                        train: trainDetails[0],
                                        totalAmount,
                                        paymentMethod,
                                        travelDate,
                                        sourceStation,
                                        destinationStation,
                                        confirmedSeats,
                                        waitlistedSeats
                                    }
                                });
                            });
                        }
                    );
                }
            }
        );
    }
});

// Update user details endpoint
app.post('/update-details', (req, res) => {
    const { loginId, loginName, contactNumber, email } = req.body;

    if (!loginId) {
        return res.status(400).json({
            success: false,
            message: 'Login ID is required'
        });
    }

    const query = `
        UPDATE LoginDetails 
        SET LoginName = ?, ContactNumber = ?, Email = ?
        WHERE LoginID = ?
    `;

    db.query(query, [loginName, contactNumber, email, loginId], (err, result) => {
        if (err) {
            console.error('Error updating user details:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating user details'
            });
        }

        res.json({
            success: true,
            message: 'User details updated successfully'
        });
    });
});

// Get user details endpoint
app.get('/user-details', (req, res) => {
    const loginId = req.query.loginId;

    if (!loginId) {
        return res.status(400).json({
            success: false,
            message: 'Login ID is required'
        });
    }

    const query = `
        SELECT LoginID, LoginName, ContactNumber, Email 
        FROM LoginDetails 
        WHERE LoginID = ?
    `;

    db.query(query, [loginId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching user details'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: results[0]
        });
    });
});

// Change password endpoint
app.post('/change-password', (req, res) => {
    const { loginId, currentPassword, newPassword } = req.body;

    if (!loginId || !currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    // First verify the current password
    const verifyQuery = `
        SELECT * FROM LoginDetails 
        WHERE LoginID = ? AND Password = ?
    `;

    db.query(verifyQuery, [loginId, currentPassword], (err, results) => {
        if (err) {
            console.error('Error verifying password:', err);
            return res.status(500).json({
                success: false,
                message: 'Error verifying current password'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // If current password is correct, update to new password
        const updateQuery = `
            UPDATE LoginDetails 
            SET Password = ?
            WHERE LoginID = ?
        `;

        db.query(updateQuery, [newPassword, loginId], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating password'
                });
            }

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});