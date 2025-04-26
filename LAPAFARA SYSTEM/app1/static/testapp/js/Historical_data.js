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