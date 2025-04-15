// Set user name from localStorage
const userName = localStorage.getItem("userName") || "Passenger";
document.getElementById("userGreet").textContent = `Welcome back, ${userName}`;

// Get booking details from localStorage
const bookingDetails = JSON.parse(localStorage.getItem('bookingConfirmation'));

if (!bookingDetails) {
    alert('No booking details found. Please make a booking first.');
    window.location.href = 'book_ticket.html';
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Display train details
document.getElementById('trainName').textContent = bookingDetails.trainDetails.trainName || 'N/A';
document.getElementById('route').textContent = `${bookingDetails.trainDetails.sourceStation} → ${bookingDetails.trainDetails.destinationStation}`;
document.getElementById('departureTime').textContent = bookingDetails.trainDetails.departureTime || 'N/A';
document.getElementById('arrivalTime').textContent = bookingDetails.trainDetails.arrivalTime || 'N/A';
document.getElementById('travelDate').textContent = formatDate(bookingDetails.travelDate);
document.getElementById('coachClass').textContent = bookingDetails.trainDetails.coachClass || 'N/A';

// Display passenger details
const passengersList = document.getElementById('passengersList');
if (bookingDetails.passengers && bookingDetails.passengers.length > 0) {
    bookingDetails.passengers.forEach((passenger, index) => {
        const passengerCard = document.createElement('div');
        passengerCard.className = 'passenger-card';
        passengerCard.innerHTML = `
            <h3>Passenger ${index + 1}</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="label">Name</span>
                    <span class="value">${passenger.firstName} ${passenger.lastName}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Aadhar No.</span>
                    <span class="value">${passenger.aadharNo}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Gender</span>
                    <span class="value">${passenger.gender === 'M' ? 'Male' : 'Female'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Age</span>
                    <span class="value">${passenger.age}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Date of Birth</span>
                    <span class="value">${formatDate(passenger.dob)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Ticket Status</span>
                    <span class="value ${index < bookingDetails.confirmedSeats ? 'status-confirmed' : 'status-waiting'}">
                        ${index < bookingDetails.confirmedSeats ? 'CONFIRMED' : 'WAITING'}
                    </span>
                </div>
            </div>
        `;
        passengersList.appendChild(passengerCard);
    });
} else {
    passengersList.innerHTML = '<p>No passenger details available</p>';
}

// Display payment details
document.getElementById('totalAmount').textContent = `₹${bookingDetails.totalAmount.toFixed(2)}`;
document.getElementById('paymentMethod').textContent = bookingDetails.paymentMethod;
document.getElementById('transactionId').textContent = bookingDetails.transactionId || 'N/A';

// Clear the booking confirmation from localStorage after displaying
// This prevents showing old booking details if the page is refreshed
localStorage.removeItem('bookingConfirmation'); 