const transactionID = localStorage.getItem('currentTransaction');
let currentTicketToCancel = null;

if (!transactionID) {
  alert("Transaction ID not found.");
  window.location.href = "booking_history.html";
}

// Modal elements
const modal = document.getElementById('confirmationModal');
const confirmBtn = document.getElementById('confirmCancel');
const cancelBtn = document.getElementById('cancelCancel');

// Modal event listeners
confirmBtn.addEventListener('click', () => {
  if (currentTicketToCancel) {
    cancelTicket(currentTicketToCancel);
  }
  modal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Function to show confirmation modal
function showCancelConfirmation(ticketId) {
  currentTicketToCancel = ticketId;
  modal.style.display = 'block';
}

// Function to cancel ticket
function cancelTicket(ticketId) {
  fetch(`http://localhost:3001/cancel-ticket/${ticketId}`, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Ticket cancelled successfully!');
      // Refresh the ticket details
      loadTicketDetails();
    } else {
      alert('Failed to cancel ticket: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error cancelling ticket:', error);
    alert('Error cancelling ticket');
  });
}

// Function to load ticket details
function loadTicketDetails() {
  fetch(`http://localhost:3001/ticket-details/${transactionID}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#detailsTable tbody');
      tbody.innerHTML = '';

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10">No details found.</td></tr>`;
        return;
      }

      data.forEach(ticket => {
        const row = document.createElement('tr');
        
        // Determine waiting number display
        const waitingNumber = ticket.BookingStatus === 'WAITING' ? 
          (ticket.WaitingNumber || 'N/A') : 'Not applicable';
        
        // Create cancel button if status is CONFIRMED
        const cancelButton = ticket.BookingStatus === 'CONFIRMED' ? 
          `<button class="cancel-btn" onclick="showCancelConfirmation(${ticket.TicketID})">Cancel</button>` : 
          `<button class="cancel-btn" disabled>Cancel</button>`;
        
        row.innerHTML = `
          <td>${ticket.TicketID}</td>
          <td>${ticket.FirstName} ${ticket.LastName}</td>
          <td>${ticket.TrainName}</td>
          <td>${ticket.CoachName}</td>
          <td>${new Date(ticket.TravelDate).toLocaleDateString('en-CA')}</td>
          <td>${ticket.BookingStatus}</td>
          <td>${ticket.RefundStatus}
          <td>${ticket.SourceStation}</td>
          <td>${ticket.DestinationStation}</td>
          <td>${waitingNumber}</td>
          <td>${cancelButton}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Error loading ticket details:", err);
      alert("Failed to load ticket details.");
    });
}

// Initial load
loadTicketDetails();