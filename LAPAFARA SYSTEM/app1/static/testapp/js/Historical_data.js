let plantNames = [];
let isYearAscending = true;

document.addEventListener('DOMContentLoaded', async () => {
  const existingData = localStorage.getItem('cropData');

  if (!existingData || JSON.parse(existingData).length === 0) {
    try {
      const response = await fetch('/media/historical_plant_data.csv');
      const csvText = await response.text();
      const lines = csvText.trim().split('\n').slice(1); // Skip header

      const parsedData = lines.map(line => {
        const [plantName, soilType, fertilizer, plantingMonth, growthDuration, harvestMonth] = line.split(',').map(cell => cell.trim());
        return {
          plantName,
          year: "2024",
          plantingMonth: monthNumberToName(plantingMonth),
          soilType,
          fertilizer,
          growthDuration: `${growthDuration} months`,
          harvestMonth: monthNumberToName(harvestMonth)
        };
      });

      localStorage.setItem('cropData', JSON.stringify(parsedData));
      renderTable();
      updatePlantSelect();
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  } else {
    renderTable();
    updatePlantSelect();
  }
});

function monthNumberToName(num) {
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return months[parseInt(num, 10) - 1] || "Unknown";
}

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
  const rowToDelete = data[index];
  data.splice(index, 1);
  localStorage.setItem('cropData', JSON.stringify(data));

  renderTable();
  updatePlantSelect();

  fetch('/delete-row/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify({
      plantName: rowToDelete.plantName,
      soilType: rowToDelete.soilType,
      fertilizer: rowToDelete.fertilizer,
      plantingMonth: nameToMonthNumber(rowToDelete.plantingMonth),
      growthDuration: rowToDelete.growthDuration.replace(' months', ''),
      harvestMonth: nameToMonthNumber(rowToDelete.harvestMonth)
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message === "CSV updated successfully") {
      console.log("Row deleted from CSV");
    } else {
      alert("Error: " + data.message);
    }
  })
  .catch(error => {
    console.error("Error deleting row:", error);
    alert("Network error deleting row.");
  });
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

function getCsrfToken() {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
  return csrfToken || '';
}

function nameToMonthNumber(monthName) {
  const months = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
  };
  return months[monthName] || 0;
}
