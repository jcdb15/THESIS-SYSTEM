console.log("🚀 Script loaded!");

// Ensure plant dropdown is populated from historical data
document.addEventListener("DOMContentLoaded", function () {
    fetch("/get_plants/") // API to get plant names from CSV
        .then(response => response.json())
        .then(data => {
            const plantSelect = document.getElementById("plantSelect");
            data.plants.forEach(plant => {
                let option = document.createElement("option");
                option.value = plant;
                option.textContent = plant;
                plantSelect.appendChild(option);
            });

            // Restore previously selected plant if available
            let savedPlant = localStorage.getItem("selectedPlant");
            if (savedPlant) {
                plantSelect.value = savedPlant;
            }
        })
        .catch(error => console.error("❌ Fetch error:", error));
});

// Handle form submission
document.getElementById("plantForm").addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("🚀 Form submitted!");

    showNotification("Processing prediction...");
    document.querySelector(".growth-result").style.display = "block";

    const formData = new FormData(this);
    console.log("📤 Sending data:", Object.fromEntries(formData.entries()));

    fetch("/predict_growth_api/", {
        method: "POST",
        headers: { "X-CSRFToken": getCookie('csrftoken') },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("📊 Response data:", data);

        if (data.error) {
            showNotification(`❌ Error: ${data.error}`);
            return;
        }

        // Save prediction results
        localStorage.setItem("growthDuration", data.growth_duration);
        localStorage.setItem("harvestMonth", data.harvest_month);
        localStorage.setItem("growthChartData", JSON.stringify(data.growth_data));

        // Update UI
        updateGrowthResults();
        updateGrowthGraph(data.growth_data);

        showNotification(`✅ Prediction complete! Expected harvest month: ${data.harvest_month}`);
    })
    .catch(error => {
        console.error("❌ Fetch error:", error);
        showNotification("❌ An error occurred. Please try again.");
    });

    // Save selected plant name
    localStorage.setItem("selectedPlant", document.getElementById("plantSelect").value);
});

// Function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie) {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            let trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
            }
        });
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

// Chart.js configuration for plant growth
const ctx = document.getElementById("growthGraph").getContext("2d");
let myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Plant Growth Over Months',
            data: Array(12).fill(0), // Default empty data
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4
        }]
    },
    options: { 
        responsive: true,
        scales: { y: { beginAtZero: true } } 
    }
});

// Function to update growth graph dynamically
function updateGrowthGraph(predictions) {
    console.log("📈 Updating graph with data:", predictions);

    if (!Array.isArray(predictions) || predictions.length !== 12) {
        console.error("❌ Invalid growth data:", predictions);
        return;
    }

    myChart.data.datasets[0].data = predictions;
    myChart.update();
}

// Function to update growth results from localStorage
function updateGrowthResults() {
    let growthDuration = localStorage.getItem("growthDuration");
    let harvestMonth = localStorage.getItem("harvestMonth");
    let savedData = localStorage.getItem("growthChartData");

    if (growthDuration && harvestMonth) {
        document.getElementById("growthDuration").innerText = `Predicted Growth Duration: ${growthDuration} months`;
        document.getElementById("harvestMonth").innerText = `Predicted Harvest Month: ${harvestMonth}`;
        document.querySelector(".growth-result").style.display = "block";
    }

    if (savedData) {
        updateGrowthGraph(JSON.parse(savedData));
    }
}

// Restore prediction results on page load
document.addEventListener("DOMContentLoaded", updateGrowthResults);

// Toggle between growth chart and harvest chart
document.getElementById("predictHarvestGraph").addEventListener("click", function () {
    console.log("🔄 Button clicked!");

    if (this.innerText === "Predict Harvest Time Graph") {
        // Save the current growth chart data
        localStorage.setItem("growthChartData", JSON.stringify(myChart.data.datasets[0].data));

        // Switch to Harvest Chart
        showHarvestChart();
        this.innerText = "Show Plant Growth Over Months";
    } else {
        // Restore Growth Chart
        showGrowthChart();
        this.innerText = "Predict Harvest Time Graph";
    }
});

// Function to show the Harvest Chart
function showHarvestChart() {
    console.log("🌱 Switching to Harvest Chart...");

    let growthDuration = parseInt(localStorage.getItem("growthDuration")) || 3;

    let labels = [];
    let growthData = [];
    for (let i = 1; i <= growthDuration; i++) {
        labels.push(`Month ${i}`);
        growthData.push((i / growthDuration) * 100); // Simulated growth percentage
    }

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Growth Over Time (%)",
                data: growthData,
                backgroundColor: "rgba(255, 165, 0, 0.5)",
                borderColor: "rgba(255, 165, 0, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: "Growth Percentage (%)" } }
            }
        }
    });
}

// Function to restore Growth Chart
function showGrowthChart() {
    let savedData = localStorage.getItem("growthChartData");
    let restoredData = savedData ? JSON.parse(savedData) : Array(12).fill(0);

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Plant Growth Over Months',
                data: restoredData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}
