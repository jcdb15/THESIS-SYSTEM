    // Wait for the document to fully load
    document.addEventListener("DOMContentLoaded", function() {
        const plantForm = document.getElementById('plantForm');
        const growthResultDiv = document.querySelector('.growth-result');
        const growthGraph = document.getElementById('growthGraph');
        
        const growthData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Plant Growth Over Months',
                data: Array(12).fill(0),  // Initialize with empty data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        };

        const growthChart = new Chart(growthGraph, {
            type: 'line',
            data: growthData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        plantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const plantType = document.getElementById('plantSelect').value;
            const plantingDate = new Date(document.getElementById('plantingDate').value);
            const avgTemperature = parseFloat(document.getElementById('avgTemperature').value);
            const soilType = document.getElementById('soilType').value;

            // Simulate growth data based on inputs
            const predictedGrowth = generateGrowthData(plantType, plantingDate, avgTemperature, soilType);

            // Update the growth chart data
            growthData.datasets[0].data = predictedGrowth;

            // Update the chart with new data
            growthChart.update();

            // Show the growth result section
            growthResultDiv.style.display = 'block';
        });

        // Function to generate plant growth data (this is just a simulation)
        function generateGrowthData(plantType, plantingDate, temperature, soil) {
            let growthPattern = Array(12).fill(0);
            
            // Example of simulated growth patterns based on temperature and plant type
            if (plantType === 'rice') {
                growthPattern = [5, 15, 30, 50, 65, 75, 80, 90, 95, 95, 85, 70];
            } else if (plantType === 'eggplant') {
                growthPattern = [5, 20, 35, 55, 70, 80, 85, 90, 90, 85, 70, 60];
            } else if (plantType === 'chilli') {
                growthPattern = [0, 10, 25, 40, 55, 70, 75, 85, 90, 85, 70, 50];
            } else if (plantType === 'beans') {
                growthPattern = [5, 15, 35, 60, 75, 85, 90, 90, 80, 70, 60, 50];
            }

            // Adjust growth based on temperature (e.g., hotter temps can speed growth)
            growthPattern = growthPattern.map(value => value + (temperature - 25) * 0.2);

            return growthPattern.map(value => Math.max(0, Math.min(100, value)));  // Keep growth within 0-100%
        }
    });