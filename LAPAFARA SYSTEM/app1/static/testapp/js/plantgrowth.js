let chartInstance;

// Initialize an empty chart with default values
const defaultData = {
  labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
  datasets: [{
    label: 'Growth Prediction (Default)',
    data: [1, 1, 1, 1, 1, 1], // Placeholder values
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    tension: 0.3,
    fill: true,
  }]
};

const defaultConfig = {
  type: 'line',
  data: defaultData,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Plant Growth Over Time (Default)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

const ctx = document.getElementById('growthGraph').getContext('2d');
chartInstance = new Chart(ctx, defaultConfig);

// When the 'predictCanvasBtn' button is clicked
document.getElementById('predictCanvasBtn').addEventListener('click', function () {
  const variety = document.getElementById('riceVariety').value;
  const area = parseFloat(document.getElementById('plantedArea').value);
  const year = parseInt(document.getElementById('predictedYear').value);

  if (!variety || isNaN(area) || isNaN(year)) {
    alert('Please complete all input fields.');
    return;
  }

  // Sample logic to generate mock growth data based on variety
  const baseData = {
    'TH82': [1.2, 2.1, 2.5, 3.0, 3.4, 3.9],
    '216': [1.0, 1.8, 2.3, 2.7, 3.1, 3.6],
    '222': [0.9, 1.7, 2.1, 2.6, 3.0, 3.5]
  };

  const labels = ['2020', '2021', '2022', '2023', '2024', '2025'];
  const dataValues = baseData[variety] || [1, 2, 1.5, 3, 2.8, 3.5];

  // Destroy previous chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  const data = {
    labels: labels,
    datasets: [{
      label: `Growth Prediction for ${variety} in ${year}`,
      data: dataValues.map(val => val * (1 + area / 10)), // simple mock impact from area
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
      fill: true,
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Plant Growth Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const ctx = document.getElementById('growthGraph').getContext('2d');
  chartInstance = new Chart(ctx, config);
});
