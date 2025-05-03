

// Function to handle the visibility of the "No data generated" message
function togglePredictGrowth() {
    const message = document.getElementById('noDataMessage');
    const button = document.getElementById('predictGrowthBtn');
    
    // Toggle visibility of the message
    if (message.style.display === 'none') {
        message.style.display = 'block';
    } else {
        message.style.display = 'none';
    }
}

// Event listener for the "Predict Growth" button
document.getElementById('predictGrowthBtn').addEventListener('click', function() {
    togglePredictGrowth();
});

// Initial call to draw the chart
drawGrowthChart();
	
	





