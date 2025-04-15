// Set user name from localStorage
const userName = localStorage.getItem("userName") || "Passenger";
document.getElementById("userGreet").textContent = `Welcome back, ${userName}`;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const sourceStation = urlParams.get('source');
const destinationStation = urlParams.get('destination');
const journeyDate = urlParams.get('date');
const coachClass = urlParams.get('coach');
const passengerCount = urlParams.get('passengers');

let trains = []; // Store the original train data
let isSortedByPrice = false;

// Function to fetch available trains
async function fetchAvailableTrains() {
    try {
        const response = await fetch(`http://localhost:3001/available-trains?source=${sourceStation}&destination=${destinationStation}&date=${journeyDate}&coach=${coachClass}&passengers=${passengerCount}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        trains = await response.json();
        displayTrains(trains);
    } catch (error) {
        console.error('Error fetching trains:', error);
        alert('Failed to fetch available trains. Please try again later.');
    }
}

// Function to create a train card
function createTrainCard(train) {
    const card = document.createElement('div');
    card.className = 'train-card';
    
    // Calculate confirmed and waitlist seats
    const confirmedSeats = Math.min(train.AvailableSeats, passengerCount);
    const waitlistSeats = train.AvailableSeats < passengerCount ? passengerCount - train.AvailableSeats : 0;
    
    // Determine booking status message
    let seatsText = '';
    let buttonText = '';
    let buttonClass = 'book-btn';
    
    if (train.AvailableSeats === 0) {
        seatsText = `All ${passengerCount} tickets will be waitlisted`;
        buttonText = 'Join Waitlist';
        buttonClass = 'book-btn waitlist';
    } else if (waitlistSeats > 0) {
        seatsText = `${confirmedSeats} tickets will be confirmed, ${waitlistSeats} will be waitlisted`;
        buttonText = 'Book Split Tickets';
        buttonClass = 'book-btn split';
    } else {
        seatsText = `${train.AvailableSeats} seats left`;
        buttonText = 'Book Now';
    }
    
    card.innerHTML = `
        <div class="train-info">
            <div class="train-name">${train.TrainName}</div>
            <div class="train-stations">${train.SourceStation} → ${train.DestinationStation}</div>
        </div>
        <div class="time-info">
            <div class="time-label">Departure</div>
            <div class="time-value">${train.DepartureTime}</div>
        </div>
        <div class="time-info">
            <div class="time-label">Arrival</div>
            <div class="time-value">${train.ArrivalTime}</div>
        </div>
        <div class="price-info">
            <div class="price">₹${train.Price}</div>
            <div class="seats ${waitlistSeats > 0 ? 'split-seats' : train.AvailableSeats === 0 ? 'no-seats' : ''}">${seatsText}</div>
        </div>
        <button class="${buttonClass}" onclick="bookTrain(${train.TrainID})">${buttonText}</button>
    `;
    return card;
}

// Function to display trains
function displayTrains(trainsToDisplay) {
    const trainsList = document.getElementById('trainsList');
    trainsList.innerHTML = '';
    
    if (trainsToDisplay.length === 0) {
        trainsList.innerHTML = '<p class="no-trains">No trains available for the selected criteria.</p>';
        return;
    }

    trainsToDisplay.forEach(train => {
        trainsList.appendChild(createTrainCard(train));
    });
}

// Function to sort trains by price
function sortTrainsByPrice() {
    const sortedTrains = [...trains].sort((a, b) => {
        return isSortedByPrice ? b.Price - a.Price : a.Price - b.Price;
    });
    isSortedByPrice = !isSortedByPrice;
    displayTrains(sortedTrains);
}

// Function to handle train booking
function bookTrain(trainId) {
    // Redirect to booking form with parameters
    window.location.href = `booking_form.html?trainId=${trainId}&source=${encodeURIComponent(sourceStation)}&destination=${encodeURIComponent(destinationStation)}&date=${journeyDate}&coach=${encodeURIComponent(coachClass)}&passengers=${passengerCount}`;
}

// Add event listener for sort button
document.getElementById('sortPrice').addEventListener('click', sortTrainsByPrice);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!sourceStation || !destinationStation || !journeyDate || !coachClass) {
        alert('Invalid booking parameters. Please try again.');
        window.location.href = 'book_ticket.html';
        return;
    }
    fetchAvailableTrains();
}); 