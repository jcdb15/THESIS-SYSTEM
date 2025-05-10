let chartInstance;
const colorPalette = [
  'rgba(75, 192, 192, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)'
];
let colorIndex = 0;

// Ipakita ang modal
document.getElementById('generateChart').addEventListener('click', function () {
  document.getElementById('myModal').style.display = 'block';
});

// Isara ang modal
document.getElementById('closeModal').addEventListener('click', function () {
  document.getElementById('myModal').style.display = 'none';
});

// Gumawa ng chart agad sa pag-load ng page
window.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('yieldChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024', '2025'], // Static year labels
      datasets: [
        {
          label: 'No Data Available', // Placeholder for when there's no data
          data: [0, 0, 0, 0, 0, 0],  // Default empty data
          borderColor: 'rgba(0, 0, 0, 0.1)',  // Light color for the no data line
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          fill: false,
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Predicted Yields Over the Years'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Yield: ${context.parsed.y} cavans`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Yield (cavans)'
          }
        }
      }
    }
  });
});

// Predict at iguhit ang chart
document.getElementById('predictCanvasBtn').addEventListener('click', function () {
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

  const btn = document.getElementById('predictCanvasBtn');
  btn.disabled = true;
  btn.innerText = 'Predicting...';

  fetch("/predict-yield/", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      const predictedYield = data.predicted_yield;
      let labels = chartInstance.data.labels;

      // Remove the "No Data Available" dataset if it exists
      chartInstance.data.datasets = chartInstance.data.datasets.filter(dataset => dataset.label !== 'No Data Available');

      // Ensure the predicted year is added to the labels if it's not already there
      if (!labels.includes(predictedYear.toString())) {
        labels.push(predictedYear.toString());
        labels.sort((a, b) => parseInt(a) - parseInt(b));
      }

      const dataValues = labels.map(labelYear =>
        parseInt(labelYear) === predictedYear ? predictedYield : 0
      );

      const borderColor = colorPalette[colorIndex % colorPalette.length];
      const backgroundColor = borderColor.replace('1)', '0.2)');

      const newDataset = {
        label: `Prediction for ${variety} (${predictedYear})`,
        data: dataValues,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        tension: 0.4,
        fill: false,
        spanGaps: true,
        pointRadius: 4,
        borderWidth: 2
      };

      // Check if the dataset for this year already exists. If so, update it; otherwise, add a new dataset.
      let existingDataset = chartInstance.data.datasets.find(dataset => dataset.label.includes(predictedYear.toString()));

      if (existingDataset) {
        existingDataset.data = dataValues; // Update the data for the existing dataset
        existingDataset.label = `Prediction for ${variety} (${predictedYear})`; // Update the label
        chartInstance.update();  // Refresh the chart with updated dataset
      } else {
        // No existing dataset, so add the new one
        chartInstance.data.datasets.push(newDataset);
        chartInstance.update();  // Refresh the chart with the new dataset
      }

      colorIndex++;
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
