let plantNames = [];
let isYearAscending = true;

// Function para mag-toggle ng visibility ng form
function toggleForm() {
  const form = document.getElementById('formContainer');
  const button = document.getElementById('toggleButton');
  const isFormVisible = form.style.display === 'block';
  form.style.display = isFormVisible ? 'none' : 'block';
  button.textContent = isFormVisible ? 'Add New Historical Data' : 'Close New Historical Data';
}

// Event listener para sa form submit
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

  populateTable(); // I-render ang updated na table
  updatePlantSelect();
  document.getElementById('dataForm').reset();
});

// Kunin ang data mula sa localStorage
function getStoredData() {
  return JSON.parse(localStorage.getItem('cropData')) || [];
}

// Function para i-populate ang table gamit ang data mula sa localStorage o CSV
function populateTable() {
  const data = getStoredData();
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = ''; // I-clear ang table

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

// Function para mag-delete ng row mula sa table at i-update ang localStorage
function deleteRow(index) {
  const data = getStoredData();
  data.splice(index, 1); // Alisin ang entry mula sa data
  localStorage.setItem('cropData', JSON.stringify(data)); // I-update ang localStorage
  populateTable(); // I-render muli ang table
  updatePlantSelect(); // I-update ang plant select options
}

// Function para i-update ang plant select dropdown
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

// Function para mag-filter ng table ayon sa selected na plant
function filterTableByPlant() {
  const selectedPlant = document.getElementById('plantNameSelect').value;
  const rows = document.querySelectorAll('#dataTable tbody tr');
  rows.forEach(row => {
    const plantName = row.cells[0].textContent;
    row.style.display = selectedPlant === '' || plantName === selectedPlant ? '' : 'none';
  });
}

// Function para mag-sort ng table ayon sa taon (ascending o descending)
function sortTableByYear() {
  const data = getStoredData();
  data.sort((a, b) => isYearAscending
    ? parseInt(a.year) - parseInt(b.year)
    : parseInt(b.year) - parseInt(a.year)
  );
  isYearAscending = !isYearAscending;
  localStorage.setItem('cropData', JSON.stringify(data)); // I-update ang localStorage
  populateTable(); // I-render muli ang table pagkatapos mag-sort
  document.getElementById('yearSortArrow').textContent = isYearAscending ? '↑' : '↓';
}

// Initial load ng table
populateTable();
updatePlantSelect();

// CSV File Handling
const uploadButton = document.getElementById('uploadButton');
const csvFileInput = document.getElementById('csvFileInput');

// Trigger ang file input kapag kinlick ang "Upload CSV File" button
uploadButton.addEventListener('click', function() {
    csvFileInput.click();
});

// Function para mag-handle ng file upload at ipakita ang data sa table
function handleFileUpload(event) {
    const file = event.target.files[0];

    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileContent = e.target.result;
            const data = parseCSV(fileContent);
            appendCSVDataToTable(data);
        };
        
        reader.readAsText(file); // Basahin ang file bilang text
    } else {
        alert('Puwede lamang mag-upload ng CSV files!');
    }
}

// Function para i-parse ang CSV content at gawing array ng objects
function parseCSV(csvContent) {
    const rows = csvContent.split('\n').map(row => row.trim()).filter(row => row !== ''); // Trim at alisin ang mga empty rows
    const header = rows[0].split(',').map(column => column.trim());  // Trim ang spaces sa headers
    console.log('Header:', header); // Debugging para makita ang headers
    
    return rows.slice(1).map((row, index) => {
        const values = row.split(',').map(value => value.trim());  // Trim ang spaces sa values
        console.log(`Row values ${index + 1}:`, values); // Debugging para makita ang values sa bawat row
        
        let obj = {};
        header.forEach((column, idx) => {
            // Magdagdag ng validation para siguraduhing hindi undefined o empty ang value
            obj[column] = values[idx] ? values[idx] : 'N/A'; // Kung walang value, ilagay 'N/A'
        });
        return obj;
    });
}

// Function para magdagdag ng data mula sa CSV sa existing na table at localStorage
function appendCSVDataToTable(data) {
    const existingData = getStoredData();
    const combinedData = existingData.concat(data); // Pagsamahin ang existing data at bagong CSV data

    localStorage.setItem('cropData', JSON.stringify(combinedData)); // I-update ang localStorage

    populateTable(); // I-render muli ang table
}

