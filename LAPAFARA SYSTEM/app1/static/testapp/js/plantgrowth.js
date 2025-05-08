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
      let labels = ['2020', '2021', '2022', '2023', '2024', '2025'];

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
        tension: 0.4,  // Dahan-dahang curve
        fill: false,   // Walang fill sa ilalim
        spanGaps: true,  // Kung may gaps, ituloy pa rin ang line
        pointRadius: 4,  // Laki ng bilog sa mga points
        borderWidth: 2  // Kapal ng linya
      };

      const ctx = document.getElementById('yieldChart').getContext('2d');

      // Kung wala pang chart, gumawa ng bago
      if (!chartInstance) {
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [newDataset]
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
      } else {
        // I-update ang labels kung may bagong taon
        chartInstance.data.labels = labels;

        // I-dagdag ang bagong prediction
        chartInstance.data.datasets.push(newDataset);
        chartInstance.update();
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
