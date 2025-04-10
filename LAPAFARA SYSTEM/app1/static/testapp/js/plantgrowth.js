console.log("🚀 Script loaded!");

let isFetchingData = false; // State variable to manage fetching status

// Ensure plant dropdown is populated from historical data
document.addEventListener("DOMContentLoaded", async function () {
    await populatePlantDropdown();
    updateGrowthResults();
});

// Function to populate the plant dropdown
async function populatePlantDropdown() {
    try {
        const plants = await fetchPlantData('/media/historical_plant_data.csv');
        const plantSelect = document.getElementById("plantSelect");
        plants.forEach(plant => {
            let option = document.createElement("option");
            option.value = plant['Plant Name'];
            option.textContent = plant['Plant Name']; // Only the plant name
            plantSelect.appendChild(option);
        });

        // Restore previously selected plant if available
        let savedPlant = localStorage.getItem("selectedPlant");
        if (savedPlant) {
            plantSelect.value = savedPlant;
        }

        // Update the graph if previous values exist
        const savedGrowthDuration = parseInt(localStorage.getItem("growthDuration"));
        const savedPlantingDate = localStorage.getItem("plantingDate");
        if (!isNaN(savedGrowthDuration) && savedPlantingDate) {
            const plantingDate = new Date(savedPlantingDate);
            const plantingMonth = plantingDate.getMonth() + 1; // Adjust for 1-based month
            const growthData = getGrowthData(savedGrowthDuration, plantingMonth);
            updateGrowthGraph(growthData);
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

// Function to fetch and parse plant or historical data
async function fetchData(url) {
    if (isFetchingData) return null; // Prevent multiple fetches
    isFetchingData = true; // Set fetching status

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return await response.text();
    } catch (error) {
        console.error("❌ Fetch error:", error);
        showNotification("❌ An error occurred while fetching data.");
        return null;
    } finally {
        isFetchingData = false; // Reset fetching state
    }
}

// Function to fetch plant options and historical data
async function fetchPlantData(url) {
    const csvText = await fetchData(url);
    if (!csvText) return []; // Return empty array if fetch failed

    const data = parseCSV(csvText);
    return data; // Returns an array of plant objects
}

// Handle form submission
document.getElementById("plantForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("🚀 Form submitted!");

    showNotification("Processing prediction...");
    document.querySelector(".growth-result").style.display = "block";

    const selectedPlant = document.getElementById("plantSelect").value;
    const plantingDate = new Date(document.getElementById("plantingDate").value);
    const plantingMonth = plantingDate.getMonth() + 1; // Adjust for 1-based month

    console.log("Selected Plant:", selectedPlant);
    console.log("Planting Month Index:", plantingMonth);

    const plantData = await fetchPlantData('/media/historical_plant_data.csv');

    const plantInfo = plantData.find(plant => plant['Plant Name'].toLowerCase() === selectedPlant.toLowerCase());

    if (plantInfo) {
        const growthDuration = parseInt(plantInfo['Growth Duration (Months)']);
        const harvestMonth = parseInt(plantInfo['Harvest Month']); // Use Harvest Month from CSV

        localStorage.setItem("selectedPlant", selectedPlant);
        localStorage.setItem("growthDuration", growthDuration);
        localStorage.setItem("harvestMonth", harvestMonth); // Store as 1-based month
        localStorage.setItem("plantingDate", document.getElementById("plantingDate").value);

        updateGrowthResults();

        const growthData = getGrowthData(growthDuration, plantingMonth);
        updateGrowthGraph(growthData);

        showNotification(`✅ Prediction complete! Expected harvest month: ${harvestMonth}`); // Display as 1-based month

        // Show growth graph after submitting the form
        showGrowthGraph();
    } else {
        showNotification("❌ Plant data not found.");
    }
});

// Function to parse CSV data
function parseCSV(csvText) {
    const rows = csvText.split('\n').map(row => row.split(','));
    const headers = rows[0].map(header => header.trim());
    return rows.slice(1).map(row => {
        return headers.reduce((obj, header, index) => {
            obj[header] = row[index] ? row[index].trim() : "";
            return obj;
        }, {});
    });
}

// Function to generate growth data
function getGrowthData(duration, plantingMonth) {
    const growthData = Array(12).fill(0);
    for (let i = 0; i < duration; i++) {
        const monthIndex = (plantingMonth - 1 + i) % 12; // Adjust for 0-index
        growthData[monthIndex] = (i + 1) * (100 / duration);
    }
    return growthData;
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
            data: Array(12).fill(0), // Replace with your actual data
            borderColor: 'rgba(255, 0, 0, 1)', // Red color for the line
            backgroundColor: 'rgba(255, 0, 0, 0.2)', // Light red for the background
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + "%";
                    }
                }
            }
        }
    }
});

// Update growth chart dynamically
function updateGrowthGraph(predictions) {
    console.log("📈 Updating graph with data:", predictions);

    if (!Array.isArray(predictions) || predictions.length !== 12) {
        console.error("❌ Invalid growth data:", predictions);
        return;
    }

    myChart.data.datasets[0].data = predictions;
    myChart.update();
}

// Update results from localStorage
function updateGrowthResults() {
    let growthDuration = localStorage.getItem("growthDuration");
    let harvestMonth = localStorage.getItem("harvestMonth");

    // Always show the growth result section
    document.querySelector(".growth-result").style.display = "block";

    if (growthDuration && harvestMonth) {
        document.getElementById("growthDuration").innerText = `Predicted Growth Duration: ${growthDuration} months`;
        document.getElementById("harvestMonth").innerText = `Predicted Harvest Month: ${harvestMonth}`; // Adjust 0-index
    } else {
        document.getElementById("growthDuration").innerText = "No data added";
        document.getElementById("harvestMonth").innerText = "No data added";
    }
}

// Clear Data button
document.getElementById("clearDataBtn").addEventListener("click", function () {
    console.log("🧹 Clearing data...");

    localStorage.removeItem("selectedPlant");
    localStorage.removeItem("growthDuration");
    localStorage.removeItem("harvestMonth");
    localStorage.removeItem("plantingDate");

    document.getElementById("plantForm").reset();

    // Reset the chart data
    myChart.data.datasets[0].data = Array(12).fill(0);
    myChart.update();

    document.getElementById("harvestNotification").style.display = "none";

    // Update results after clearing data
    updateGrowthResults();
    showNotification("🧹 Data cleared successfully! No data added.");
});

// Function to show expected harvest month bar chart
async function showHarvestChart() {
    const selectedPlant = document.getElementById("plantSelect").value;
    const plantingDate = new Date(document.getElementById("plantingDate").value);
    const plantingMonth = plantingDate.getMonth() + 1; // Adjust for 1-based month

    console.log("Fetching historical data for plant:", selectedPlant);

    const csvText = await fetchData('/media/historical_plant_data.csv'); // Fetch data here

    if (!csvText) {
        showNotification("❌ Failed to fetch data for harvest prediction.");
        return;
    }

    const data = parseCSV(csvText);
    const plantData = data.find(plant => plant['Plant Name'].toLowerCase() === selectedPlant.toLowerCase());

    if (plantData) {
        const growthDuration = parseInt(plantData['Growth Duration (Months)']);
        const harvestMonth = parseInt(plantData['Harvest Month']); // Use Harvest Month from CSV

        // Prepare month labels for the bar chart
        const monthLabels = [];
        const growthPercentages = [];
        
        // Calculate growth percentages from planting month to harvest month
        for (let i = 0; i < growthDuration; i++) {
            const currentMonth = (plantingMonth - 1 + i) % 12; // Calculate month index (0-11)
            monthLabels.push(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonth]);
            growthPercentages.push(((i + 1) / growthDuration) * 100); // Calculate percentage for each month
        }

        const harvestChartCtx = document.getElementById("harvestChart").getContext("2d");
        const harvestChart = new Chart(harvestChartCtx, {
            type: "bar",
            data: {
                labels: monthLabels, // Use dynamically generated month labels
                datasets: [{
                    label: 'Growth Percentage',
                    data: growthPercentages, // Use calculated percentages for each month
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + "%"; // Show percentage on y-axis
                            }
                        }
                    }
                }
            }
        });

        // Add click event listener for the chart
        harvestChartCtx.canvas.addEventListener('click', (event) => {
            const activePoints = harvestChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (activePoints.length > 0) {
                const chartIndex = activePoints[0].index; // Get the index of the clicked bar
                const month = monthLabels[chartIndex];
                const percentage = growthPercentages[chartIndex];
                showNotification(`Clicked on ${month}: ${percentage.toFixed(2)}% growth`);
            }
        });

        document.getElementById("harvestChart").style.display = "block";
        document.getElementById("harvestNotification").innerText = `Expected Harvest Month: ${harvestMonth}`;
        document.getElementById("harvestNotification").style.display = "block";

        // Hide the growth graph when showing harvest chart
        document.getElementById("growthGraph").style.display = "none";

        // Change button text to "Plant Growth Over Months"
        const predictHarvestGraphButton = document.getElementById("predictHarvestGraph");
        predictHarvestGraphButton.innerText = "Plant Growth Over Months";
        predictHarvestGraphButton.setAttribute("onclick", "showGrowthGraph()"); // Change click action to show growth graph
    } else {
        showNotification("❌ Plant data not found for harvest prediction.");
    }
}

// Function to show plant growth graph
function showGrowthGraph() {
    document.getElementById("harvestChart").style.display = "none"; // Hide harvest chart
    document.getElementById("growthGraph").style.display = "block"; // Show growth chart

    // Update the growth graph with stored data if available
    const savedGrowthDuration = parseInt(localStorage.getItem("growthDuration"));
    const savedPlantingDate = localStorage.getItem("plantingDate");

    if (!isNaN(savedGrowthDuration) && savedPlantingDate) {
        const plantingDate = new Date(savedPlantingDate);
        const plantingMonth = plantingDate.getMonth() + 1; // Adjust for 1-based month
        const growthData = getGrowthData(savedGrowthDuration, plantingMonth);
        updateGrowthGraph(growthData); // Update growth graph with saved data
    } else {
        console.error("❌ Growth duration or planting date not found in localStorage.");
    }

    // Change button text back to "Harvest Time Graph"
    const predictHarvestGraphButton = document.getElementById("predictHarvestGraph");
    predictHarvestGraphButton.innerText = "Harvest Time Graph";
    predictHarvestGraphButton.setAttribute("onclick", "showHarvestChart()"); // Reset click action to show harvest chart
}
