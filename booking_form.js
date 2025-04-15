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
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');

    // Get user's login ID from localStorage
    const loginId = localStorage.getItem("loginID");
    if (!loginId) {
        alert('Please login to book tickets');
        window.location.href = 'login.html';
        return;
    }

    // Collect all passenger details
    const passengers = [];
    for (let i = 1; i <= passengerCount; i++) {
        const firstName = document.getElementById(`firstName${i}`).value;
        const lastName = document.getElementById(`lastName${i}`).value;
        const aadharNo = document.getElementById(`aadharNo${i}`).value;
        const gender = document.getElementById(`gender${i}`).value;
        const age = document.getElementById(`age${i}`).value;
        const dob = document.getElementById(`dob${i}`).value;

        if (!firstName || !lastName || !aadharNo || !gender || !age || !dob) {
            alert(`Please fill in all details for Passenger ${i}`);
            return;
        }

        passengers.push({
            firstName,
            lastName,
            aadharNo,
            gender,
            age,
            dob
        });
    }

    // Get payment method
    const paymentMethod = document.getElementById('paymentMethod').value;
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }

    // Calculate total amount
    const totalAmount = train.Price * passengerCount;

    // Create booking data
    const bookingData = {
        loginId: parseInt(loginId),
        trainId: parseInt(trainId),
        travelDate: journeyDate,
        coachClass: coachClass,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        passengers: passengers,
        sourceStation: sourceStation,
        destinationStation: destinationStation
    };

    console.log('Booking data:', bookingData);

    try {
        // Show loading state
        const submitButton = document.querySelector('.book-tickets-btn');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Make API call to book tickets
        const response = await fetch('http://localhost:3001/book-tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            // Store booking details in localStorage for confirmation page
            localStorage.setItem('bookingConfirmation', JSON.stringify({
                ...result.bookingDetails,
                trainDetails: {
                    trainName: train.TrainName,
                    sourceStation: sourceStation,
                    destinationStation: destinationStation,
                    departureTime: train.DepartureTime,
                    arrivalTime: train.ArrivalTime,
                    coachClass: coachClass,
                    price: train.Price
                },
                passengers: passengers,
                travelDate: journeyDate,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                transactionId: result.transactionId
            }));
            
            // Redirect to confirmation page
            window.location.href = 'booking_confirmation.html';
        } else {
            alert(result.message || 'Failed to book tickets');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-ticket-alt"></i> Book Tickets';
        }
    } catch (error) {
        console.error('Error booking tickets:', error);
        alert('An error occurred while booking tickets. Please try again.');
        const submitButton = document.querySelector('.book-tickets-btn');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-ticket-alt"></i> Book Tickets';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');
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
            window.train = train; // Store train details globally
            displayTrainInfo(train);
            createPassengerForms();
        })
        .catch(error => {
            console.error('Error fetching train details:', error);
            alert('Failed to fetch train details. Please try again later.');
            window.location.href = 'available_trains.html';
        });

    // Add form submit handler
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
        console.log('Form submit handler added');
    } else {
        console.error('Booking form not found');
    }
}); 