const transactionID = localStorage.getItem('currentTransaction');

if (!transactionID) {
  alert("Transaction ID not found.");
  window.location.href = "booking_history.html";
}

fetch(`http://localhost:3001/ticket-details/${transactionID}`)
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector('#detailsTable tbody');

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No details found.</td></tr>`;
      return;
    }

    data.forEach(ticket => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ticket.FirstName} ${ticket.LastName}</td>
        <td>${ticket.TrainName}</td>
        <td>${ticket.CoachName}</td>
        <td>${ticket.TravelDate}</td>
        <td>${ticket.BookingStatus}</td>
        <td>${ticket.SourceStation}</td>
        <td>${ticket.DestinationStation}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Error loading ticket details:", err);
    alert("Failed to load ticket details.");
  });