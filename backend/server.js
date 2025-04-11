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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});