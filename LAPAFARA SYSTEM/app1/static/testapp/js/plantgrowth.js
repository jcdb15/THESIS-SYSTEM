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

const ctx = document.getElementById('yieldChart').getContext('2d');
chartInstance = new Chart(ctx, defaultConfig);

// Show modal when "Input Data" is clicked
document.getElementById('generateChart').addEventListener('click', function () {
  document.getElementById('myModal').style.display = 'block';
});

// Close modal when 'X' is clicked
document.getElementById('closeModal').addEventListener('click', function () {
  document.getElementById('myModal').style.display = 'none';
});

// Predict button logic
document.getElementById('predictCanvasBtn').addEventListener('click', function () {
  const variety = document.getElementById('riceVariety').value;
  const plantedArea = parseFloat(document.getElementById('plantedArea').value);
  const predictedYear = parseInt(document.getElementById('predictedYear').value);

  if (!variety || isNaN(plantedArea) || isNaN(predictedYear)) {
    alert('Please complete all input fields.');
    return;
  }

  const formData = new FormData();
  formData.append("variety", variety);
  formData.append("planted_area", plantedArea);
  formData.append("predicted_year", predictedYear);

  // Disable Predict button while loading
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
      const labels = ['2020', '2021', '2022', '2023', '2024', '2025'];

      // Dynamically add predictedYear if not present in labels
      if (!labels.includes(predictedYear.toString())) {
        labels.push(predictedYear.toString());
        labels.sort(); // Optional: sort labels if needed
      }

      // Prepare data for chart (show 0 instead of null)
      const dataValues = labels.map(labelYear =>
        parseInt(labelYear) === predictedYear ? predictedYield : 0
      );

      // Destroy the previous chart if it exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Prepare the new chart data
      const chartData = {
        labels: labels,
        datasets: [{
          label: `Predicted Yield for ${variety} in ${predictedYear}`,
          data: dataValues,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true,
        }]
      };

      const config = {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Predicted Yield Over Time'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };

      // Render the new chart
      const ctx = document.getElementById('yieldChart').getContext('2d');
      chartInstance = new Chart(ctx, config);

      // Close the modal after prediction
      document.getElementById('myModal').style.display = 'none';
    })
    .catch(error => {
      console.error("Prediction failed:", error);
      alert("An error occurred while predicting. Please try again.");
    })
    .finally(() => {
      // Enable the Predict button again after the process
      btn.disabled = false;
      btn.innerText = 'Predict';
    });
});
