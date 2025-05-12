document.addEventListener("DOMContentLoaded", () => {
	const apiURL = "https://api.open-meteo.com/v1/forecast?latitude=12.6667&longitude=123.8667&current_weather=true";

	const temperatureData = [];
	const windSpeedData = [];
	const timeLabels = [];

	function getWeatherIcon(code) {
	  if ([0].includes(code)) return "☀️";
	  if ([1, 2].includes(code)) return "⛅";
	  if ([3].includes(code)) return "☁️";
	  if ([45, 48].includes(code)) return "🌫️";
	  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
	  if ([66, 67, 71, 73, 75, 85, 86].includes(code)) return "❄️";
	  if ([95, 96, 99].includes(code)) return "⛈️";
	  return "❓";
	}

	async function getWeatherData() {
	  try {
		const response = await fetch(apiURL);
		const data = await response.json();
		const weather = data.current_weather;
		return {
		  temp: weather.temperature,
		  wind: weather.windspeed,
		  code: weather.weathercode
		};
	  } catch (error) {
		console.error("Error fetching weather data:", error);
		return null;
	  }
	}

	const ctx = document.getElementById('weatherChart').getContext('2d');
	const gradient = ctx.createLinearGradient(0, 0, 0, 400);
	gradient.addColorStop(0, 'rgba(255, 99, 132, 0.4)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

	const weatherChart = new Chart(ctx, {
	  data: {
		labels: timeLabels,
		datasets: [
		  {
			label: 'Wind Speed (km/h)',
			data: windSpeedData,
			backgroundColor: 'rgba(54, 162, 235, 0.7)',
			borderRadius: 10,
			yAxisID: 'y1',
			type: 'bar'
		  },
		  {
			label: 'Temperature (°C)',
			data: temperatureData,
			borderColor: 'rgba(255, 99, 132, 1)',
			backgroundColor: gradient,
			fill: true,
			tension: 0.5,
			pointRadius: 4,
			pointBackgroundColor: 'rgba(255, 99, 132, 1)',
			type: 'line',
			yAxisID: 'y'
		  }
		]
	  },
	  options: {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
		  mode: 'index',
		  intersect: false
		},
		plugins: {
		  title: {
			display: true,
			text: 'Real-Time Weather Monitoring',
			font: { size: 10, weight: 'bold' },
			color: '#37474f',
			padding: { top: 10, bottom: 20 }
		  },
		  legend: { display: false },
		  tooltip: {
			backgroundColor: '#fff',
			titleColor: '#000',
			bodyColor: '#333',
			borderColor: '#ccc',
			borderWidth: 1,
			callbacks: {
			  label: function (tooltipItem) {
				return `${tooltipItem.dataset.label}: ${tooltipItem.raw} ${tooltipItem.dataset.label === 'Temperature (°C)' ? '°C' : 'km/h'}`;
			  }
			}
		  }
		},
		scales: {
		  y: {
			type: 'linear',
			position: 'left',
			title: {
			  display: true,
			  text: 'Temperature (°C)',
			  font: { size: 14 }
			},
			grid: { color: 'rgba(0, 0, 0, 0.05)' },
			ticks: { font: { size: 12 } }
		  },
		  y1: {
			type: 'linear',
			position: 'right',
			title: {
			  display: true,
			  text: 'Wind Speed (km/h)',
			  font: { size: 14 }
			},
			grid: { drawOnChartArea: false },
			ticks: { font: { size: 12 } }
		  },
		  x: {
			ticks: { font: { size: 12 } },
			grid: { color: 'rgba(0, 0, 0, 0.03)' }
		  }
		}
	  }
	});

	async function updateChart() {
	  const weather = await getWeatherData();
	  if (weather) {
		const now = new Date();
		const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		temperatureData.push(weather.temp);
		windSpeedData.push(weather.wind);
		timeLabels.push(label);

		if (temperatureData.length > 12) {
		  temperatureData.shift();
		  windSpeedData.shift();
		  timeLabels.shift();
		}

		document.getElementById('weather-icon').textContent = getWeatherIcon(weather.code);
		weatherChart.update();
	  }
	}

	updateChart();
	setInterval(updateChart, 5000);
  });


  //chart 
  document.addEventListener("DOMContentLoaded", function () {
    const barChartCanvas = document.getElementById("bar-chart");

    // Function to load plant data from localStorage and generate the chart
    function loadPlantDataForChart() {
        const savedItems = localStorage.getItem("plantItems");
        if (savedItems) {
            const plants = JSON.parse(savedItems);

            // Prepare data for the chart (rice variety names and quantities)
            const riceVarieties = [];
            const quantities = [];
            const barColors = [];  // Array to hold colors for each bar

            // Define a color sequence (starting with blue, red, and more)
            const colors = [
                '#2196F3', '#F44336', '#FF9800', '#4CAF50', '#9C27B0', '#E91E63', '#FF5722', '#3F51B5',
                '#00BCD4', '#8BC34A', '#CDDC39', '#607D8B', '#795548', '#FFC107', '#673AB7'
            ];

            // Loop through the plants and collect the data
            plants.forEach((plant, index) => {
                if (plant.variety) {
                    riceVarieties.push(plant.variety); // Add variety to array
                    quantities.push(plant.quantity);  // Add quantity to array

                    // Use modulus to cycle through the color pattern
                    barColors.push(colors[index % colors.length]); // Assign color based on index
                }
            });

            // Create a horizontal bar chart using Chart.js
            new Chart(barChartCanvas, {
                type: 'bar',
                data: {
                    labels: riceVarieties, // Labels on the Y-axis (rice varieties)
                    datasets: [{
                        label: 'Quantity (cavans)',
                        data: quantities, // Data on the X-axis (quantities)
                        backgroundColor: barColors, // Different colors for each bar
                        borderColor: 'transparent', // Remove the border by setting it to transparent
                        borderWidth: 0 // Or you can set this to 0 to remove the border entirely
                    }]
                },
                options: {
                    responsive: true,
                    indexAxis: 'y', // Change to horizontal bars
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Quantity (cavans)' // Label for X-axis
                            },
                            beginAtZero: true // Start X-axis from 0
                        },
                        y: {
                            title: {
                                display: true,
                            }
                        }
                    }
                }
            });
        }
    }

    // Load data for the chart on page load
    loadPlantDataForChart();
});
