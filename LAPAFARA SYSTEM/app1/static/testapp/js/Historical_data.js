let plantNames = [];
let isYearAscending = true;

function toggleForm() {
  const form = document.getElementById('formContainer');
  const button = document.getElementById('toggleButton');
  const isFormVisible = form.style.display === 'block';
  form.style.display = isFormVisible ? 'none' : 'block';
  button.textContent = isFormVisible ? 'Add New Historical Data' : 'Close New Historical Data';
}

document.getElementById('dataForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const entry = {
    plantName: document.getElementById('plant_name').value.trim(),
    year: document.getElementById('year').value,
    plantingMonth: document.getElementById('planting_month').value,
    soilType: document.getElementById('soil_type').value,
    fertilizer: document.getElementById('fertilizer').value,
    growthDuration: document.getElementById('growth_duration').value,
    harvestMonth: document.getElementById('harvest_month').value
  };

  const data = getStoredData();
  data.push(entry);
  localStorage.setItem('cropData', JSON.stringify(data));

  renderTable();
  updatePlantSelect();
  document.getElementById('dataForm').reset();
});

function getStoredData() {
  return JSON.parse(localStorage.getItem('cropData')) || [];
}

function renderTable() {
  const data = getStoredData();
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = '';
  data.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.plantName}</td>
      <td>${entry.year}</td>
      <td>${entry.plantingMonth}</td>
      <td>${entry.soilType}</td>
      <td>${entry.fertilizer}</td>
      <td>${entry.growthDuration}</td>
      <td>${entry.harvestMonth}</td>
      <td><button onclick="deleteRow(${index})">🗑️</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteRow(index) {
  const data = getStoredData();
  data.splice(index, 1);
  localStorage.setItem('cropData', JSON.stringify(data));
  renderTable();
  updatePlantSelect();
}

function updatePlantSelect() {
  const data = getStoredData();
  const uniquePlants = [...new Set(data.map(entry => entry.plantName))];
  const plantSelect = document.getElementById('plantNameSelect');
  plantSelect.innerHTML = '<option value="">Select a Plant</option>';
  uniquePlants.forEach(plantName => {
    const option = document.createElement('option');
    option.value = plantName;
    option.textContent = plantName;
    plantSelect.appendChild(option);
  });
}

function filterTableByPlant() {
  const selectedPlant = document.getElementById('plantNameSelect').value;
  const rows = document.querySelectorAll('#dataTable tbody tr');
  rows.forEach(row => {
    const plantName = row.cells[0].textContent;
    row.style.display = selectedPlant === '' || plantName === selectedPlant ? '' : 'none';
  });
}

function sortTableByYear() {
  const data = getStoredData();
  data.sort((a, b) => isYearAscending
    ? parseInt(a.year) - parseInt(b.year)
    : parseInt(b.year) - parseInt(a.year)
  );
  isYearAscending = !isYearAscending;
  localStorage.setItem('cropData', JSON.stringify(data));
  renderTable();
  document.getElementById('yearSortArrow').textContent = isYearAscending ? '↑' : '↓';
}

// Initial load
renderTable();
updatePlantSelect();

//START UPLOAD CSV FILE START
function handleFileUpload(event) {
  // Show loading indicator
  document.getElementById('loadingIndicator').style.display = 'block';
  
  const file = event.target.files[0];
  if (file && file.name.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvData = e.target.result;
      console.log('CSV Content:', csvData);  // Log CSV content to check

      const parsedData = parseCSV(csvData);
      console.log('Parsed Data:', parsedData);  // Log parsed data for debugging
      displayDataInTable(parsedData);

      // Save data to localStorage
      localStorage.setItem('csvData', JSON.stringify(parsedData));

      // Send CSV data to the server
      uploadCSVToServer(csvData);
    };
    reader.readAsText(file);
  }
}

// Function to parse CSV data into an array of objects
function parseCSV(csvData) {
  const rows = csvData.split('\n');
  const headers = rows[0].split(',');
  const data = rows.slice(1).map(row => {
    const values = row.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index].trim();
      return obj;
    }, {});
  });
  return data;
}

// Function to display CSV data in the table
function displayDataInTable(data) {
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = ''; // Clear existing table data

  data.forEach(row => {
    const tr = document.createElement('tr');
    
    // Create table cells for each column
    Object.values(row).forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });

    // Add Action button
    const actionTd = document.createElement('td');
    const actionButton = document.createElement('button');
    actionButton.textContent = 'Delete';
    actionButton.onclick = function() {
      tr.remove();
      // Save the updated data to localStorage after deletion
      const updatedData = getTableData();
      localStorage.setItem('csvData', JSON.stringify(updatedData));
    };
    actionTd.appendChild(actionButton);
    tr.appendChild(actionTd);

    tableBody.appendChild(tr);
  });

  // Hide loading indicator
  document.getElementById('loadingIndicator').style.display = 'none';
}

// Function to get the current table data
function getTableData() {
  const rows = document.querySelectorAll('#dataTable tbody tr');
  const data = [];
  rows.forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    rowData['Plant Name'] = cells[0].textContent;
    rowData['Year'] = cells[1].textContent;
    rowData['Planting Month'] = cells[2].textContent;
    rowData['Soil Type'] = cells[3].textContent;
    rowData['Fertilizer'] = cells[4].textContent;
    rowData['Growth Duration'] = cells[5].textContent;
    rowData['Harvest Month'] = cells[6].textContent;
    data.push(rowData);
  });
  return data;
}

// Function to sort table by Year (ascending/descending)
function sortTableByYear() {
  const table = document.getElementById('dataTable');
  const rows = Array.from(table.rows).slice(1); // Skip the header row
  const arrow = document.getElementById('yearSortArrow');
  let ascending = arrow.textContent === '↑';

  rows.sort((rowA, rowB) => {
    const yearA = rowA.cells[1].textContent;
    const yearB = rowB.cells[1].textContent;
    return ascending ? yearA - yearB : yearB - yearA;
  });

  // Reattach sorted rows to the table
  rows.forEach(row => table.appendChild(row));

  // Toggle the arrow direction
  arrow.textContent = ascending ? '↓' : '↑';
}

// On page load, check if there's saved data in localStorage
window.onload = function() {
  const savedData = localStorage.getItem('csvData');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    displayDataInTable(parsedData);
  }
}

// Function to send CSV data to the server
function uploadCSVToServer(csvContent) {
  const data = {
    csv: csvContent
  };

  // Send the CSV data to the backend via POST
  fetch('/upload_csv/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken') // CSRF token if you're using CSRF protection
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert('CSV file uploaded and saved successfully!');
    } else {
      alert('Error: ' + result.error);
    }
  })
  .catch(error => {
    console.error('Error uploading CSV:', error);
    alert('Error uploading CSV: ' + error.message);
  });
}

// Function to get CSRF token for AJAX requests (if CSRF is enabled in Django)
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
//END UPLOAD CSV FILE END
