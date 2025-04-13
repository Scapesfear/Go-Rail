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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});