document.getElementById('plantForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const plantingDate = document.getElementById('plantingDate').value;
    const seasonType = document.getElementById('seasonType').value;
    const soilType = document.getElementById('soilType').value;
    const fertilizer = document.getElementById('fertilizer').value;
    const itemType = document.getElementById('itemType').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    // Create the label for the chart (Combination of fields)
    const label = `${seasonType} / ${soilType} / ${fertilizer} (${itemType})`;

    // Create the chart if it doesn't exist yet
    if (!window.plantChart) {
        const ctx = document.getElementById('plantGraph').getContext('2d');
        window.plantChart = new Chart(ctx, {
            type: 'bar', // Change this to 'line' for line chart
            data: {
                labels: [label],
                datasets: [{
                    label: `Quantity Planted on ${plantingDate}`,
                    data: [quantity],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantity'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Season / Soil / Fertilizer (Item Type)'
                        }
                    }
                }
            }
        });
    } else {
        // Add data to existing chart
        window.plantChart.data.labels.push(label);
        window.plantChart.data.datasets[0].data.push(quantity);
        window.plantChart.data.datasets[0].label = `Quantity Planted on ${plantingDate}`;
        window.plantChart.update();
    }

    // Optional: Clear form after submit
    this.reset();
});