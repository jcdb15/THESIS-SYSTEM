let chartInstance;
const colorPalette = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(201, 203, 207, 1)'
];
let colorIndex = 0;

// Register plugin to show "no data" message
Chart.register({
  id: 'noDataLabel',
  beforeDraw: (chart) => {
    const allZero = chart.data.datasets.every(ds => ds.data.every(d => d === 0));
    if (allZero) {
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText('No data available', width / 2, height / 2);
      ctx.restore();
    }
  }
});

// Create empty chart with X and Y axis preserved
function createEmptyChart() {
  const ctx = document.getElementById('yieldChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2021', '2022', '2023'], // Dummy years for consistent layout
      datasets: [{
        label: 'No Data Available',
        data: [0, 0, 0],
        borderColor: 'rgba(201, 203, 207, 1)',
        backgroundColor: 'rgba(201, 203, 207, 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [4, 4]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Annual Yield Comparison'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Yield (cavans/ha)'
          }
        }
      }
    }
  });
}

createEmptyChart();

// Modal control
document.getElementById('generateChart').addEventListener('click', function () {
  document.getElementById('myModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', function () {
  document.getElementById('myModal').style.display = 'none';
});

// Predict and Add to Chart
document.getElementById('predictCanvasBtn').addEventListener('click', function (event) {
  event.preventDefault();

  const variety = document.getElementById('riceVariety').value;
  const plantedArea = parseFloat(document.getElementById('plantedArea').value);
  const predictedYear = parseInt(document.getElementById('predictedYear').value);

  if (!variety || isNaN(plantedArea) || isNaN(predictedYear)) {
    alert('Paki-kompleto ang lahat ng input.');
    return;
  }

  const formData = new FormData();
  formData.append("variety", variety);
  formData.append("planted_area", plantedArea);
  formData.append("predicted_year", predictedYear);

  const btn = this;
  btn.disabled = true;
  btn.innerText = 'Predicting...';

  Promise.all([
    fetch(`/get-variety-history/?variety=${encodeURIComponent(variety)}`).then(res => res.json()),
    fetch("/predict-yield/", {
      method: "POST",
      body: formData
    }).then(res => res.json())
  ])
    .then(([historyData, predictData]) => {
      if (predictData.error) {
        alert(predictData.error);
        return;
      }

      const predictedYield = predictData.predicted_yield;
      if (predictedYield === undefined || predictedYield === null) {
        alert('No predicted yield returned from the server.');
        return;
      }

      const bestHistory = {};
      if (historyData.status === 'success' && Array.isArray(historyData.history)) {
        historyData.history.forEach(entry => {
          const year = new Date(entry.date).getFullYear();
          const yieldVal = parseFloat(entry.yield_per_hectare);
          if (!isNaN(year) && !isNaN(yieldVal)) {
            if (!bestHistory[year] || yieldVal > bestHistory[year]) {
              bestHistory[year] = yieldVal;
            }
          }
        });
      }

      const allYears = Array.from(new Set([
        ...Object.keys(bestHistory),
        predictedYear.toString()
      ])).sort();

      // Reset chart labels
      chartInstance.data.labels = allYears;

      // Remove placeholder if exists
      chartInstance.data.datasets = chartInstance.data.datasets.filter(ds => ds.label !== 'No Data Available');

      const existingIndex = chartInstance.data.datasets.findIndex(ds => ds.label === `${variety} - Historical Yield`);
      const historicalData = allYears.map(year => bestHistory[year] || 0);

      if (existingIndex === -1) {
        const color = colorPalette[colorIndex % colorPalette.length];
        chartInstance.data.datasets.push({
          label: `${variety} - Historical Yield`,
          data: historicalData,
          borderColor: color,
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: false
        });
      } else {
        chartInstance.data.datasets[existingIndex].data = historicalData;
      }

      const predictedData = allYears.map(year => parseInt(year) === predictedYear ? predictedYield : 0);
      const color = colorPalette[colorIndex % colorPalette.length];

      chartInstance.data.datasets.push({
        label: `${variety} - Predicted Yield`,
        data: predictedData,
        borderColor: color,
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false
      });

      colorIndex++;
      chartInstance.update();
      document.getElementById('myModal').style.display = 'none';
    })
    .catch(error => {
      console.error("Prediction failed:", error);
      alert("Nagkaroon ng error sa prediction. Paki-ulit.");
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerText = 'Save';
    });
});