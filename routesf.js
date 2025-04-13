function renderTable(headers, rows) {
  const thead = document.getElementById("tableHead");
  const tbody = document.getElementById("tableBody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headerRow = document.createElement("tr");
  headers.forEach(head => {
    const th = document.createElement("th");
    th.textContent = head;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  rows.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key] || "—";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function fetchArrivalTimes() {
  const trainID = document.getElementById("trainIdInput").value;
  if (!trainID) return alert("Please enter a Train ID.");

  fetch(`http://localhost:3001/routes/arrival-times/${trainID}`)
    .then(res => res.json())
    .then(data => {
      renderTable(["StationName", "ArrivalTime"], data);
    })
    .catch(err => console.error("❌ Error fetching arrival times:", err));
}

function fetchRouteDetails() {
  const trainID = document.getElementById("trainIdInput").value;
  if (!trainID) return alert("Please enter a Train ID.");

  fetch(`http://localhost:3001/routes/full/${trainID}`)
    .then(res => res.json())
    .then(data => {
      renderTable(["TrainID", "SequenceNumber", "StationID", "StationName", "City", "State", "ArrivalTime"], data);
    })
    .catch(err => console.error("❌ Error fetching route details:", err));
}
