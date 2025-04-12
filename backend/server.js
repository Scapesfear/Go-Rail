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
const bookingsRoutes = require('./bookings'); // ✅ exact filename
     // ✅ mounts the route correctly


// Use the routes
// app.post('/login', loginRoutes); //When request is made to /login loginRoutes handles it
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
app.use('/bookings', bookingsRoutes);    

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
        res.json(results);
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});