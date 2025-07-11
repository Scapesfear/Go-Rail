// Set user name from localStorage
const userName = localStorage.getItem("userName") || "Passenger";
document.getElementById("userGreet").textContent = `Welcome back, ${userName}`;

// Function to fetch data from the server
async function fetchData(endpoint) {
    try {
        const response = await fetch(`http://localhost:3001/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Function to populate dropdown
function populateDropdown(elementId, data, valueField, displayField) {
    const select = document.getElementById(elementId);
    select.innerHTML = '<option value="">Select ' + elementId.replace(/([A-Z])/g, ' $1').trim() + '</option>';
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[displayField];
        select.appendChild(option);
    });
}

// Populate stations dropdown
async function populateStations() {
    const stations = await fetchData('stations');
    populateDropdown('sourceStation', stations, 'StationID', 'StationName');
    populateDropdown('destinationStation', stations, 'StationID', 'StationName');
}

// Populate journey dates dropdown
async function populateJourneyDates() {
    const dates = await fetchData('journey-dates');
    const select = document.getElementById('journeyDate');
    select.innerHTML = '<option value="">Select Journey Date</option>';
    
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date.TravelDate;
        option.textContent = date.TravelDate;
        select.appendChild(option);
    });
}

// Populate coach classes dropdown
async function populateCoachClasses() {
    const coaches = await fetchData('coaches');
    populateDropdown('coachClass', coaches, 'CoachID', 'CoachName');
}

// Handle passenger count
const passengerCount = document.getElementById('passengerCount');
const decreaseBtn = document.getElementById('decreasePassengers');
const increaseBtn = document.getElementById('increasePassengers');

decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(passengerCount.value);
    if (currentValue > 1) {
        passengerCount.value = currentValue - 1;
    }
});

increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(passengerCount.value);
    passengerCount.value = currentValue + 1;
});

// Handle show seats button click
document.getElementById('showSeatsBtn').addEventListener('click', async () => {
    const sourceStation = document.getElementById('sourceStation').value;
    const destinationStation = document.getElementById('destinationStation').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const coachClass = document.getElementById('coachClass').value;
    const passengerCount = document.getElementById('passengerCount').value;

    if (!sourceStation || !destinationStation || !journeyDate || !coachClass) {
        alert('Please fill in all the required fields');
        return;
    }

    if (sourceStation === destinationStation) {
        alert('Source and destination stations cannot be the same');
        return;
    }

    // Get the selected station names
    const sourceStationName = document.getElementById('sourceStation').options[document.getElementById('sourceStation').selectedIndex].text;
    const destinationStationName = document.getElementById('destinationStation').options[document.getElementById('destinationStation').selectedIndex].text;
    const coachClassName = document.getElementById('coachClass').options[document.getElementById('coachClass').selectedIndex].text;

    // Redirect to available trains page with parameters
    window.location.href = `available_trains.html?source=${encodeURIComponent(sourceStationName)}&destination=${encodeURIComponent(destinationStationName)}&date=${journeyDate}&coach=${encodeURIComponent(coachClassName)}&passengers=${passengerCount}`;
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    populateStations();
    populateJourneyDates();
    populateCoachClasses();
}); 