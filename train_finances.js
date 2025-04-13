document.addEventListener("DOMContentLoaded", () => {
    fetchRevenue();
  });
  
  function renderTable(headers, data) {
    const thead = document.getElementById("tableHead");
    const tbody = document.getElementById("tableBody");
  
    // Clear previous content
    thead.innerHTML = "";
    tbody.innerHTML = "";
  
    // Set table headers
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
  
    // Populate table rows
    data.forEach(row => {
      const tr = document.createElement("tr");
      headers.forEach(key => {
        const td = document.createElement("td");
        td.textContent = row[key];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  
  function fetchRevenue() {
    fetch("http://localhost:3001/finances/revenue")
      .then(res => res.json())
      .then(data => {
        renderTable(["TrainID", "TrainName", "Revenue"], data);
      })
      .catch(err => console.error("❌ Error fetching revenue:", err));
  }
  
  function fetchMaxBookings() {
    fetch("http://localhost:3001/finances/max-bookings")
      .then(res => res.json())
      .then(data => {
        renderTable(["TrainID", "TrainName", "TravelDate", "MaxBookings"], data);
      })
      .catch(err => console.error("❌ Error fetching max bookings:", err));
  }
  