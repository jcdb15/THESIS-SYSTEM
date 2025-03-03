const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})


// Predict Plants
document.getElementById('plantForm').addEventListener('submit', function(event) {
	event.preventDefault();  // Prevent form submission

	// Collect form data
	const plantType = document.getElementById('plantSelect').value;
	const plantingDate = document.getElementById('plantingDate').value;
	const avgTemperature = document.getElementById('avgTemperature').value;
	const soilType = document.getElementById('soilType').value;

	// Display growth result - Placeholder example
	alert('Growth prediction will be shown here.');

	// Trigger the chart drawing function
	drawGrowthChart();
});


function drawGrowthChart() {
    const ctx = document.getElementById('growthGraph').getContext('2d');
    new Chart(ctx, {
        type: 'line', // Use 'bar' for bar chart, 'line' for line chart
        data: {
            labels: [
                'January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            datasets: [{
                label: 'Plant Growth (cm)',
                data: [5, 8, 12, 18, 25, 30, 35, 40, 38, 28, 15, 8], // Growth data for each month
                fill: true, // Set to true for an area chart effect
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
                borderColor: 'rgba(34, 139, 34, 1)',
                borderWidth: 2,
                tension: 0.3 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Plant Growth Over the Year'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Growth (cm)'
                    }
                }
            }
        }
    });
}

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
	
	





