document.getElementById('toggleButton').addEventListener('click', () => {
  const form = document.getElementById('formContainer');
  const visible = form.style.display === 'block';
  form.style.display = visible ? 'none' : 'block';
  document.getElementById('toggleButton').textContent = visible ? 'Add New Historical Data' : 'Close Form';
});

function getStoredData() {
  return JSON.parse(localStorage.getItem('cropData')) || [];
}

function renderTable(filter = '') {
  const data = getStoredData();
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = '';

  const filtered = data.filter(entry =>
    entry.plantName.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; font-style:italic; color:#888;">No historical data listed</td></tr>`;
  } else {
    filtered.forEach((entry, i) => {
      tableBody.innerHTML += `
        <tr>
          <td>${entry.plantName}</td>
          <td>${entry.year}</td>
          <td>${entry.plantingMonth}</td>
          <td>${entry.soilType}</td>
          <td>${entry.fertilizer}</td>
          <td>${entry.growthDuration}</td>
          <td>${entry.harvestMonth}</td>
          <td><button class="delete-btn" onclick="deleteRow(${i})">🗑️</button></td>
        </tr>`;
    });
  }
}

function deleteRow(index) {
  const data = getStoredData();
  data.splice(index, 1);
  localStorage.setItem('cropData', JSON.stringify(data));
  renderTable(document.getElementById('searchBar').value);
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
  renderTable(document.getElementById('searchBar').value);
  this.reset();
});

document.getElementById('uploadCsvButton').addEventListener('click', () => {
  document.getElementById('csvFileInput').click();
});

document.getElementById('csvFileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const rows = event.target.result.split('\n').filter(r => r.trim() !== '');
    const entries = rows.slice(1).map(row => {
      const vals = row.split(',').map(v => v.trim());
      return {
        plantName: vals[0] || '',
        year: vals[1] || '',
        plantingMonth: vals[2] || '',
        soilType: vals[3] || '',
        fertilizer: vals[4] || '',
        growthDuration: vals[5] || '',
        harvestMonth: vals[6] || ''
      };
    });
    const data = getStoredData().concat(entries);
    localStorage.setItem('cropData', JSON.stringify(data));
    renderTable(document.getElementById('searchBar').value);
  };
  reader.readAsText(file);
});

document.getElementById('searchBar').addEventListener('input', function () {
  renderTable(this.value);
});

renderTable();
