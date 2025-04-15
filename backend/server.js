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
            AND ta.AvailableSeats >= ?
        ORDER BY 
            t.TrainName, c.CoachName
    `;

    db.query(query, [date, coach, source, destination, passengers], (err, results) => {
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

    console.log('Booking request received:', {
        trainId,
        travelDate,
        coachClass,
        passengerCount: passengers.length,
        sourceStation,
        destinationStation
    });

    // Start transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({
                success: false,
                message: 'Error starting transaction'
            });
        }

        // Get coach ID from coach class
        db.query(
            'SELECT CoachID FROM Coach WHERE CoachName = ?',
            [coachClass],
            (err, coachResult) => {
                if (err || !coachResult[0]) {
                    db.rollback(() => {
                        console.error('Error getting coach ID:', err);
                        res.status(400).json({
                            success: false,
                            message: 'Invalid coach class'
                        });
                    });
                    return;
                }
                
                const coachId = coachResult[0].CoachID;
                console.log('Retrieved coach ID:', coachId);
                
                // Continue with the booking process using the coach ID
                processBooking(coachId);
            }
        );
    });

    function processBooking(coachId) {
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
                            message: 'Error getting source station'
                        });
                    });
                    return;
                }

                db.query(
                    'SELECT StationID FROM Station WHERE StationName = ?',
                    [destinationStation],
                    (err, destStationResult) => {
                        if (err) {
                            db.rollback(() => {
                                console.error('Error getting destination station:', err);
                                res.status(500).json({
                                    success: false,
                                    message: 'Error getting destination station'
                                });
                            });
                            return;
                        }

                        if (!sourceStationResult[0] || !destStationResult[0]) {
                            db.rollback(() => {
                                res.status(400).json({
                                    success: false,
                                    message: 'Invalid source or destination station'
                                });
                            });
                            return;
                        }

                        const sourceStationId = sourceStationResult[0].StationID;
                        const destStationId = destStationResult[0].StationID;

                        // Check available seats with detailed logging
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

                                console.log('Seat availability check:', {
                                    trainId,
                                    travelDate,
                                    coachId,
                                    availability: availability[0],
                                    requestedSeats: passengers.length
                                });

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
                                            
                                            // Now proceed with the booking
                                            const availableSeats = 11; // New record created with 11 seats
                                            if (availableSeats < passengers.length) {
                                                db.rollback(() => {
                                                    res.status(400).json({
                                                        success: false,
                                                        message: `Not enough seats available. Available: ${availableSeats}, Requested: ${passengers.length}`
                                                    });
                                                });
                                                return;
                                            }

                                            // Continue with the rest of the booking process...
                                            processBookingWithSeats(coachId, sourceStationId, destStationId);
                                        }
                                    );
                                } else {
                                    // Existing availability record found
                                    const availableSeats = availability[0].AvailableSeats;
                                    if (availableSeats < passengers.length) {
                                        db.rollback(() => {
                                            res.status(400).json({
                                                success: false,
                                                message: `Not enough seats available. Available: ${availableSeats}, Requested: ${passengers.length}`
                                            });
                                        });
                                        return;
                                    }

                                    // Continue with the rest of the booking process...
                                    processBookingWithSeats(coachId, sourceStationId, destStationId);
                                }
                            }
                        );
                    }
                );
            }
        );
    }

    function processBookingWithSeats(coachId, sourceStationId, destStationId) {
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
                            message: 'Error creating transaction'
                        });
                    });
                    return;
                }

                const transactionId = transactionResult.insertId;

                // Process each passenger
                let processedPassengers = 0;
                passengers.forEach((passenger, index) => {
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
                                    'CONFIRMED',
                                    'Not requested',
                                    sourceStationId,
                                    travelDate,
                                    destStationId
                                ],
                                (err) => {
                                    if (err) {
                                        db.rollback(() => {
                                            console.error('Error creating booking:', err);
                                            res.status(500).json({
                                                success: false,
                                                message: 'Error creating booking record'
                                            });
                                        });
                                        return;
                                    }

                                    processedPassengers++;
                                    if (processedPassengers === passengers.length) {
                                        // Update available seats
                                        db.query(
                                            'UPDATE TrainAvailability SET AvailableSeats = AvailableSeats - ? WHERE TrainID = ? AND TravelDate = ? AND CoachID = ?',
                                            [passengers.length, trainId, travelDate, coachId],
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
                                                                        message: 'Error committing transaction'
                                                                    });
                                                                });
                                                                return;
                                                            }

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
                                                                    destinationStation
                                                                }
                                                            });
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                });
            }
        );
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});