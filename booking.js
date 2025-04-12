document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#bookingTable tbody");

  async function loadBookings() {
    const res = await fetch("http://localhost:3001/bookings/all");
    const data = await res.json();
    tableBody.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      const bookingDate = row.BookingDate ? new Date(row.BookingDate).toLocaleString() : "—";

      let actionHTML = "";
      if (row.BookingStatus === "CANCELLED") {
        if (row.RefundStatus === "Processed") {
          actionHTML = "<button disabled>Refunded</button>";
        } else {
          actionHTML = `<button onclick="refund(${row.TicketID})">Refund</button>`;
        }
      } else {
        actionHTML = "<button disabled>N/A</button>";
      }

      tr.innerHTML = `
        <td>${row.TicketID}</td>
        <td>${row.PassengerID}</td>
        <td>${row.TrainID}</td>
        <td>${row.CoachID}</td>
        <td>${bookingDate}</td>
        <td>${row.BookingStatus}</td>
        <td>${row.RefundStatus}</td>
        <td>${actionHTML}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.refund = async function (ticketID) {
    const res = await fetch("http://localhost:3001/bookings/refund/" + ticketID, {
      method: "POST"
    });
    const result = await res.json();
    if (result.success) {
      alert("Refund processed.");
      loadBookings();
    } else {
      alert("Refund failed.");
    }
  };

  loadBookings();
});
