let passengerData = [];
let currentSort = "default";

async function loadPassengers(applyFilters) {
  applyFilters = applyFilters === undefined ? false : applyFilters;
  const loginID = document.getElementById("loginIdFilter").value;
  const fromStation = document.getElementById("fromStation").value;
  const toStation = document.getElementById("toStation").value;

  let url = "http://localhost:3001/passengers";
  const params = new URLSearchParams();

  if (applyFilters) {
    if (loginID) params.append("loginID", loginID);
    if (fromStation) params.append("fromStation", fromStation);
    if (toStation) params.append("toStation", toStation);
  }

  if (currentSort === "bookings") {
    params.append("sortByBookings", "true");
  }

  const res = await fetch(url + "?" + params.toString());
  const data = await res.json();
  passengerData = data;
  renderTable(passengerData);
}

function renderTable(data) {
  const tbody = document.getElementById("passengerTableBody");
  tbody.innerHTML = "";
  data.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.LoginID}</td>
      <td>${p.PassengerID}</td>
      <td>${p.FirstName} ${p.LastName}</td>
      <td>${p.AadharNO}</td>
      <td>${p.Gender}</td>
      <td>${p.Age}</td>
      <td>${p.DOB ? new Date(p.DOB).toLocaleDateString() : '—'}</td>
      <td>${p.TrainID}</td>
      <td>${new Date(p.TravelDate).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
})}</td>

    `;
    tbody.appendChild(row);
  });
}

function sortByBookings() {
  currentSort = "bookings";
  loadPassengers(true);
}

window.onload = () => loadPassengers(false);
