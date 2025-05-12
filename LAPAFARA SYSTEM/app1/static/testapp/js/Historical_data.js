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
  const entry = data[index];

  // Send deletion request to the Django backend
  fetch('/delete-row/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "Name of Farmer": entry.farmerName,
      "Lot No.": entry.lotNo
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.status === 'success') {
      // Remove from localStorage and re-render table
      data.splice(index, 1);
      localStorage.setItem('cropData', JSON.stringify(data));
      renderTable(document.getElementById('searchBar').value);
    } else {
      alert('Failed to delete entry: ' + (result.message || 'Unknown error.'));
    }
  })
  .catch(error => {
    alert('Error deleting entry: ' + error);
  });
}

// Event listener for submitting the form to add new data
document.getElementById('dataForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const entry = {
  farmerName: document.getElementById('farmer_name').value.trim(),
  lotNo: document.getElementById('lot_no').value.trim(),
  sectorNo: document.getElementById('sector_no').value.trim(),
  serviceArea: document.getElementById('service_area').value.trim(),
  plantedArea: document.getElementById('planted_area').value.trim(),
  datePlanted: document.getElementById('date_planted').value,
  variety: document.getElementById('variety').value.trim(),
  avgYield: document.getElementById('avg_yield').value.trim(),
  productionCost: document.getElementById('production_cost').value.trim(),
  pricePerKilo: document.getElementById('price_per_kilo').value.trim()
};

  try {
    const response = await fetch('/add-row/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });

    const result = await response.json();

    if (result.status === 'success') {
  const data = getStoredData();
  data.push(entry);
  localStorage.setItem('cropData', JSON.stringify(data));
  renderTable();
  this.reset();
  document.getElementById('yield_display').textContent = '';
} else {
      alert('Failed to save data: ' + result.message);
    }
  } catch (error) {
    alert('Error submitting form: ' + error);
  }
});

// Handle upload button click
document.getElementById('uploadCsvButton').addEventListener('click', () => {
  document.getElementById('csvFileInput').click();
});

// Handle file selection and send to backend
document.getElementById('csvFileInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload-csv/', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('CSV uploaded successfully!');
        syncWithCSVBackend(); // Optional: reload data from updated CSV
      } else {
        alert('Upload failed: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error uploading CSV:', error);
      alert('An error occurred during upload.');
    });
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

// Event listener for the yield input to display the yield in cavans
document.getElementById('avg_yield').addEventListener('input', function () {
  const value = this.value.trim();
  document.getElementById('yield_display').textContent = value ? `${value} cavans` : '';
});

// Sync crop data from backend CSV on page load
async function syncWithCSVBackend() {
  try {
    const response = await fetch('/api/get-csv-data/');
    const data = await response.json();
    localStorage.setItem('cropData', JSON.stringify(data));
    renderTable();
  } catch (error) {
    console.error('Error fetching CSV data from backend:', error);
  }
}

// Initial call on page load
document.addEventListener('DOMContentLoaded', () => {
  syncWithCSVBackend();
});