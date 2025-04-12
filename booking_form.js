// Set user name from localStorage
const userName = localStorage.getItem("userName") || "Passenger";
document.getElementById("userGreet").textContent = `Welcome back, ${userName}`;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const trainId = urlParams.get('trainId');
const sourceStation = urlParams.get('source');
const destinationStation = urlParams.get('destination');
const journeyDate = urlParams.get('date');
const coachClass = urlParams.get('coach');
const passengerCount = urlParams.get('passengers');

// Function to create a passenger form
function createPassengerForm(passengerNumber) {
    const form = document.createElement('div');
    form.className = 'passenger-form';
    form.innerHTML = `
        <h3>Passenger ${passengerNumber}</h3>
        <div class="form-group">
            <label for="firstName${passengerNumber}">First Name</label>
            <input type="text" id="firstName${passengerNumber}" name="firstName${passengerNumber}" required>
        </div>
        <div class="form-group">
            <label for="lastName${passengerNumber}">Last Name</label>
            <input type="text" id="lastName${passengerNumber}" name="lastName${passengerNumber}" required>
        </div>
        <div class="form-group">
            <label for="aadharNo${passengerNumber}">Aadhar Number</label>
            <input type="text" id="aadharNo${passengerNumber}" name="aadharNo${passengerNumber}" pattern="[0-9]{12}" required>
        </div>
        <div class="form-group">
            <label for="gender${passengerNumber}">Gender</label>
            <select id="gender${passengerNumber}" name="gender${passengerNumber}" required>
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
            </select>
        </div>
        <div class="form-group">
            <label for="age${passengerNumber}">Age</label>
            <input type="number" id="age${passengerNumber}" name="age${passengerNumber}" min="1" max="120" required>
        </div>
        <div class="form-group">
            <label for="dob${passengerNumber}">Date of Birth</label>
            <input type="date" id="dob${passengerNumber}" name="dob${passengerNumber}" required>
        </div>
    `;
    return form;
}

// Function to display train information
function displayTrainInfo(train) {
    const trainInfo = document.getElementById('trainInfo');
    trainInfo.innerHTML = `
        <h2>Train Details</h2>
        <div class="train-details">
            <div class="train-detail-item">
                <span class="train-detail-label">Train Name</span>
                <span class="train-detail-value">${train.TrainName}</span>
            </div>
            <div class="train-detail-item">
                <span class="train-detail-label">Route</span>
                <span class="train-detail-value">${train.SourceStation} → ${train.DestinationStation}</span>
            </div>
            <div class="train-detail-item">
                <span class="train-detail-label">Departure</span>
                <span class="train-detail-value">${train.DepartureTime}</span>
            </div>
            <div class="train-detail-item">
                <span class="train-detail-label">Arrival</span>
                <span class="train-detail-value">${train.ArrivalTime}</span>
            </div>
            <div class="train-detail-item">
                <span class="train-detail-label">Coach Class</span>
                <span class="train-detail-value">${train.CoachName}</span>
            </div>
            <div class="train-detail-item">
                <span class="train-detail-label">Price per Ticket</span>
                <span class="train-detail-value">₹${train.Price}</span>
            </div>
        </div>
    `;
}

// Function to create passenger forms
function createPassengerForms() {
    const passengerForms = document.getElementById('passengerForms');
    passengerForms.innerHTML = '';

    for (let i = 1; i <= passengerCount; i++) {
        passengerForms.appendChild(createPassengerForm(i));
    }
}

// Function to handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Collect all passenger details
    const passengers = [];
    for (let i = 1; i <= passengerCount; i++) {
        passengers.push({
            firstName: document.getElementById(`firstName${i}`).value,
            lastName: document.getElementById(`lastName${i}`).value,
            aadharNo: document.getElementById(`aadharNo${i}`).value,
            gender: document.getElementById(`gender${i}`).value,
            age: document.getElementById(`age${i}`).value,
            dob: document.getElementById(`dob${i}`).value
        });
    }

    // Create booking data
    const bookingData = {
        trainId,
        sourceStation,
        destinationStation,
        journeyDate,
        coachClass,
        passengers,
        paymentMethod: document.getElementById('paymentMethod').value
    };

    // Store booking data in localStorage
    localStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Redirect to payment page (to be implemented)
    alert('Booking details saved. Payment integration to be implemented.');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!trainId || !sourceStation || !destinationStation || !journeyDate || !coachClass || !passengerCount) {
        alert('Invalid booking parameters. Please try again.');
        window.location.href = 'available_trains.html';
        return;
    }

    // Fetch train details
    fetch(`http://localhost:3001/train-details/${trainId}?coach=${encodeURIComponent(coachClass)}&source=${encodeURIComponent(sourceStation)}&destination=${encodeURIComponent(destinationStation)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(train => {
            if (!train) {
                throw new Error('Train details not found');
            }
            displayTrainInfo(train);
            createPassengerForms();
        })
        .catch(error => {
            console.error('Error fetching train details:', error);
            alert('Failed to fetch train details. Please try again later.');
            window.location.href = 'available_trains.html';
        });

    // Add form submit handler
    document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
}); 