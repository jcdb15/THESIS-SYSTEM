// Function to toggle the form visibility
document.getElementById('toggleButton').addEventListener('click', () => {
  const form = document.getElementById('formContainer');
  const visible = form.style.display === 'block';
  form.style.display = visible ? 'none' : 'block';
  document.getElementById('toggleButton').textContent = visible ? 'Add New Historical Data' : 'Close Form';
});

// Function to retrieve stored data from localStorage
function getStoredData() {
  return JSON.parse(localStorage.getItem('cropData')) || [];
}

// Function to format the date to MM/DD/YYYY format
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month and pad it with 0 if needed
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad it with 0 if needed
  const year = date.getFullYear(); // Get year
  return `${month}/${day}/${year}`; // Format as MM/DD/YYYY
}

// Function to render the table with filtering
function renderTable(filter = '') {
  const data = getStoredData();
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = '';

  const filtered = data.filter(entry =>
    entry.farmerName.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; font-style:italic; color:#888;">No historical data listed</td></tr>`;
  } else {
    filtered.forEach((entry, i) => {
      tableBody.innerHTML += `
        <tr>
          <td>${entry.farmerName}</td>
          <td>${entry.lotNo}</td>
          <td>${entry.sectorNo}</td>
          <td>${entry.serviceArea}</td>
          <td>${entry.plantedArea}</td>
          <td>${formatDate(entry.datePlanted)}</td> <!-- Format the date -->
          <td>${entry.variety}</td>
          <td>${entry.avgYield} cavans</td>
          <td>₱${entry.productionCost}</td>
          <td>₱${entry.pricePerKilo}</td>
          <td><button class="delete-btn" onclick="deleteRow(${i})">🗑️</button></td>
        </tr>`;
    });
  }
}

// Function to delete a row from the table
function deleteRow(index) {
  const data = getStoredData();
  data.splice(index, 1);
  localStorage.setItem('cropData', JSON.stringify(data));
  renderTable(document.getElementById('searchBar').value);
}

// Event listener for submitting the form to add new data
document.getElementById('dataForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const entry = {
    "Name of Farmer": document.getElementById('farmer_name').value.trim(),
    "Lot No.": document.getElementById('lot_no').value.trim(),
    "Sector No.": document.getElementById('sector_no').value.trim(),
    "Sector Area(ha.)": document.getElementById('service_area').value.trim(),
    "Planted Area(ha.)": document.getElementById('planted_area').value.trim(),
    "Date Planted": document.getElementById('date_planted').value,
    "Variety": document.getElementById('variety').value.trim(),
    "Average Yield": document.getElementById('avg_yield').value.trim(),
    "Production Cost": document.getElementById('production_cost').value.trim(),
    "Price/Kilo": document.getElementById('price_per_kilo').value.trim()
  };

  try {
    const response = await fetch('/add-row/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });

    const result = await response.json();

    if (result.status === 'success') {
      renderTable();  // optional: refresh the table if using backend for data
      this.reset();
      document.getElementById('yield_display').textContent = '';
    } else {
      alert('Failed to save data: ' + result.message);
    }
  } catch (error) {
    alert('Error submitting form: ' + error);
  }
});

// Upload CSV FILE
document.getElementById('uploadCsvButton').addEventListener('click', () => {
  document.getElementById('csvFileInput').click();
});

// Event listener for reading and processing the uploaded CSV file
document.getElementById('csvFileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const rows = event.target.result.split('\n').filter(r => r.trim() !== '');
    const entries = rows.slice(1).map(row => {
      const vals = row.split(',').map(v => v.trim());
      return {
        farmerName: vals[0] || '',
        lotNo: vals[1] || '',
        sectorNo: vals[2] || '',
        serviceArea: vals[3] || '',
        plantedArea: vals[4] || '',
        datePlanted: vals[5] || '',
        variety: vals[6] || '',
        avgYield: vals[7] || '',
        productionCost: vals[8] || '',
        pricePerKilo: vals[9] || ''
      };
    });
    const data = getStoredData().concat(entries);
    localStorage.setItem('cropData', JSON.stringify(data));
    renderTable(document.getElementById('searchBar').value);
  };
  reader.readAsText(file);
});

// Event listener for the search bar input to filter the table
document.getElementById('searchBar').addEventListener('input', function () {
  renderTable(this.value);
});

// Event listener for the yield input to display the yield in cavans
document.getElementById('avg_yield').addEventListener('input', function () {
  const value = this.value.trim();
  document.getElementById('yield_display').textContent = value ? `${value} cavans` : '';
});

// Initial call to render the table
renderTable();

