let chartInstance;

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
  formData.append("predicted_year", predictedYear); // even if not used in backend

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
      const minYield = data.min_yield_per_hectare || 99;
      const maxYield = data.max_yield_per_hectare || 100;
      const yieldRange = `${minYield}-${maxYield}`;

      const labels = ['2020', '2021', '2022', '2023', '2024', '2025'];

      if (!labels.includes(predictedYear.toString())) {
        labels.push(predictedYear.toString());
        labels.sort();
      }

      const dataValues = labels.map(labelYear =>
        parseInt(labelYear) === predictedYear ? predictedYield : 0
      );

      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = document.getElementById('yieldChart').getContext('2d');

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `Yield Prediction for ${variety}`,
            data: dataValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Predicted Yield for ${predictedYear}`
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
        },
        plugins: [{
          id: 'annotationText',
          beforeDraw: (chart) => {
            const { ctx, chartArea: { top, left, right } } = chart;
            ctx.save();
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.restore();
          }
        }]
      });

      document.getElementById('myModal').style.display = 'none';
    })
    .catch(error => {
      console.error("Prediction failed:", error);
      alert("An error occurred while predicting. Please try again.");
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerText = 'Save';
    });
});
