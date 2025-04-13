
document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("transactionsTableBody");

  try {
    const res = await fetch("http://localhost:3001/transactions");
    const data = await res.json();

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.LoginID}</td>
        <td>${row.LoginName}</td>
        <td>${row.ContactNumber}</td>
        <td>${row.Email}</td>
        <td>₹${parseFloat(row.Amount).toFixed(2)}</td>
        <td>${new Date(row.BookingDate).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading transactions:", err);
    tbody.innerHTML = "<tr><td colspan='6'>Error loading data</td></tr>";
  }
});
