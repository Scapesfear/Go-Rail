document.addEventListener("DOMContentLoaded", () => {
  fetchAllTrains();
});

function renderTable(data) {
  const tbody = document.getElementById("trainTableBody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.TrainID}</td>
      <td>${row.arrivalTime}</td>
      <td>${row.reachingTime}</td>
      <td>${row.sourceStation}</td>
      <td>${row.destinationStation}</td>
      <td>${new Date(row.TravelDate).toLocaleDateString()}</td>
      <td>${row.CoachID}</td>
      <td>${row.Price}</td>
      <td>${row.AvailableSeats}</td>
    `;
    tbody.appendChild(tr);
  });
}

function fetchAllTrains() {
  fetch("http://localhost:3001/trains/all")
    .then(res => res.json())
    .then(data => renderTable(data))
    .catch(err => console.error("Error loading all trains:", err));
}

function fetchByCity() {
  const fromCity = document.getElementById("fromCity").value;
  const toCity = document.getElementById("toCity").value;
  const travelDate = document.getElementById("cityDate").value;

  const params = new URLSearchParams({ fromCity, toCity });
  if (travelDate) params.append("travelDate", travelDate);

  fetch(`http://localhost:3001/trains/by-city?${params.toString()}`)
    .then(res => res.json())
    .then(data => renderTable(data))
    .catch(err => console.error("Error fetching by city:", err));
}

function fetchByStation() {
  const fromStation = document.getElementById("fromStation").value;
  const toStation = document.getElementById("toStation").value;
  const travelDate = document.getElementById("stationDate").value;

  const params = new URLSearchParams({ fromStation, toStation });
  if (travelDate) params.append("travelDate", travelDate);

  fetch(`http://localhost:3001/trains/by-station?${params.toString()}`)
    .then(res => res.json())
    .then(data => renderTable(data))
    .catch(err => console.error("Error fetching by station:", err));
}

// Make these globally available for inline HTML onclick attributes
window.fetchByCity = fetchByCity;
window.fetchByStation = fetchByStation;
function fetchByTimeRange() {
  const stationName = document.getElementById("stationName").value;
  const fromTime = document.getElementById("fromTime").value;
  const toTime = document.getElementById("toTime").value;
  const travelDate = document.getElementById("arrivalDate").value;

  if (!stationName || !fromTime || !toTime || !travelDate) {
    alert("Please fill all fields for time range search.");
    return;
  }

  const params = new URLSearchParams({ stationName, fromTime, toTime, travelDate });

  fetch(`http://localhost:3001/trains/by-time-range?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      console.log("✅ Filtered by time:", data);
      // No need to remap!
      renderTable(data.map(row => ({
        ...row,
        reachingTime: "—",
        sourceStation: stationName,
        destinationStation: "—"
      })));
    })
    .catch(err => console.error("❌ Error fetching by time range:", err));
}


window.fetchByTimeRange = fetchByTimeRange;

