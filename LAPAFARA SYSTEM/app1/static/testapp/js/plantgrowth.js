// Global variable to store growth data
let latestGrowthData = Array(12).fill(0);

document.getElementById("plantForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload

    showNotification("Growth prediction is being processed...");

    // Show the result section
    document.querySelector(".growth-result").style.display = "block";

    // Show empty graph first (for smooth transition)
    updateGrowthGraph(Array(12).fill(0));

    const formData = new FormData(this);

    // Get CSRF token from cookies
    const csrftoken = getCookie('csrftoken');

    fetch("/predict_growth_api/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken  // Include CSRF token
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(`Error: ${data.error}`);
            console.error("Server Error:", data.error);
            return;
        }

        if (data.growth_data && data.harvest_month !== undefined) {
            latestGrowthData = data.growth_data;
            updateGrowthGraph(latestGrowthData);
            showNotification(`Prediction complete! Expected harvest month: ${data.harvest_month}`);
        } else {
            showNotification("Error: Unable to fetch predictions.");
            console.error("Unexpected Response Data:", data);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showNotification("An error occurred.");
    });
});

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to show notifications
function showNotification(message) {
    const notificationBox = document.getElementById("showpop");
    notificationBox.innerHTML = `<p>${message}</p>`;
    notificationBox.style.display = "block";
    setTimeout(() => {
        notificationBox.style.display = "none";
    }, 3000);
}

// Initial graph setup
const growthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Plant Growth Over Months',
        data: Array(12).fill(0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
    }]
};

const ctx = document.getElementById("growthGraph").getContext("2d");
let myChart = new Chart(ctx, {
    type: "line",
    data: growthData,
    options: { scales: { y: { beginAtZero: true } } }
});

// Function to update the growth graph dynamically
function updateGrowthGraph(predictions) {
    myChart.data.datasets[0].data = predictions;
    myChart.update();
}

// Toggle between growth chart and harvest chart
document.getElementById("predictHarvestGraph").addEventListener("click", function () {
    if (this.innerText === "Predict Harvest Time Graph") {
        showHarvestChart();
        this.innerText = "Show Plant Growth Over Months";
    } else {
        showGrowthChart();
        this.innerText = "Predict Harvest Time Graph";
    }
});

// Function to show the harvest prediction graph
function showHarvestChart() {
    if (myChart) {
        myChart.destroy();
    }

    const lastThreeMonths = latestGrowthData.slice(-3).map(value => (value / 10) * 100);
    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ['Month 10', 'Month 11', 'Month 12'],
            datasets: [{
                label: "Growth Over Time",
                data: lastThreeMonths,
                backgroundColor: "rgba(255, 165, 0, 0.5)",
                borderColor: "rgba(255, 165, 0, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: "Growth Percentage (%)" } }
            },
            plugins: { legend: { display: true, position: "top" } }
        }
    });
}

// Function to show the default plant growth graph
function showGrowthChart() {
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: "line",
        data: growthData,
        options: { scales: { y: { beginAtZero: true } } }
    });
}
