// Retrieve logged-in user's name and loginID from localStorage.
const userName = localStorage.getItem("userName") || "Passenger";
const loginID = localStorage.getItem("loginID");

document.getElementById("greeting").textContent = `Welcome, ${userName}`;

if (!loginID) {
  alert("You must be logged in to view your bookings.");
  window.location.href = "login.html";
}

// Function to create a table row with booking details.
function createBookingRow(booking) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${booking.TransactionID}</td>
    <td>${booking.TrainName}</td>
    <td>${booking.BookingDate?.split('T')[0]}</td>
    <td>
    <button class="view-btn" onclick="viewDetails('${booking.TransactionID}')">Show Details</button>
    </td>
  `;
  return tr;
}



  

// Fetch booking data from your backend route.
// Make sure your backend API route is set up at: /bookings/:loginID
fetch(`http://localhost:3001/bookings/${loginID}`)
  .then(response => response.json())
  .then(data => {
    const tbody = document.querySelector('#historyTable tbody');
    const noBookingsMsg = document.getElementById('noBookings');
    
    if (!data || data.length === 0) {
      noBookingsMsg.style.display = 'block';
    } else {
      data.forEach(booking => {
        const row = createBookingRow(booking);
        tbody.appendChild(row);
      });
    }
  })
  .catch(error => {
    console.error("Error fetching bookings:", error);
    alert("Failed to load your booking history. Please try again later.");
  });


  function viewDetails(transactionID) {
    // Store the transactionID in localStorage
    localStorage.setItem('currentTransaction', transactionID);
    // Redirect to details page
    window.location.href = 'ticketDetails.html';
  }