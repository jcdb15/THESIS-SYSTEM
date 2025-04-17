console.log("🚀 Script loaded!");

let isFetchingData = false;
let isHarvestChart = false; // Flag to track the current chart type

document.addEventListener("DOMContentLoaded", async function () {
    await populatePlantDropdown();
    updateGrowthResults();
    await populateAllPlantGrowthChart(); // 🔥 Show all growth data on load
    loadSavedData(); // Load saved data from localStorage
});

async function populatePlantDropdown() {
    try {
        const plants = await fetchPlantNames('/api/get_plants');
        const plantSelect = document.getElementById("plantSelect");

        plants.forEach(plant => {
            let option = document.createElement("option");
            option.value = plant.name;
            option.textContent = plant.name;
            plantSelect.appendChild(option);
        });

        let savedPlant = localStorage.getItem("selectedPlant");
        if (savedPlant) plantSelect.value = savedPlant;

        const savedGrowthDuration = parseInt(localStorage.getItem("growthDuration"));
        const savedPlantingDate = localStorage.getItem("plantingDate");
        if (!isNaN(savedGrowthDuration) && savedPlantingDate) {
            const plantingMonth = new Date(savedPlantingDate).getMonth() + 1;
            const growthData = getGrowthData(savedGrowthDuration, plantingMonth);
            updateGrowthGraph(growthData, "line");
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

async function fetchPlantNames(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch plant names.");
    const data = await response.json();
    return data.plants;
}

document.getElementById("plantForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("🚀 Form submitted!");

    document.querySelector(".growth-result").style.display = "block";

    const selectedPlant = document.getElementById("plantSelect").value;
    const soilType = document.getElementById("soilType")?.value ?? '';
    const fertilizer = document.getElementById("fertilizer")?.value ?? '';
    const plantingDate = new Date(document.getElementById("plantingDate").value);
    const plantingMonth = plantingDate.getMonth() + 1;

    const timestamp = new Date().getTime();
    const plantData = await fetchPlantData(`/media/historical_plant_data.csv?t=${timestamp}`);

    const match = plantData.find(p =>
        p['Plant Name'].toLowerCase() === selectedPlant.toLowerCase() &&
        (!soilType || p['Soil Type']?.toLowerCase() === soilType.toLowerCase()) &&
        (!fertilizer || p['Fertilizer']?.toLowerCase() === fertilizer.toLowerCase())
    );

    if (match) {
        const growthDuration = parseInt(match['Growth Duration (Months)']);
        const harvestMonth = parseInt(match['Harvest Month']);

        localStorage.setItem("selectedPlant", selectedPlant);
        localStorage.setItem("growthDuration", growthDuration);
        localStorage.setItem("harvestMonth", harvestMonth);
        localStorage.setItem("plantingDate", document.getElementById("plantingDate").value);

        updateGrowthResults();
        const growthData = getGrowthData(growthDuration, plantingMonth);
        updateGrowthGraph(growthData, "line");
    } else {
        console.error("❌ No matching plant data found.");
    }
});

function loadSavedData() {
    const selectedPlant = localStorage.getItem("selectedPlant");
    const growthDuration = localStorage.getItem("growthDuration");
    const harvestMonth = localStorage.getItem("harvestMonth");
    const plantingDate = localStorage.getItem("plantingDate");

    if (selectedPlant && growthDuration && harvestMonth && plantingDate) {
        document.getElementById("plantSelect").value = selectedPlant;
        document.getElementById("growthDuration").innerText = `Predicted Growth Duration: ${growthDuration} month${growthDuration > 1 ? 's' : ''}`;
        document.getElementById("harvestMonth").innerText = `Predicted Harvest Month: ${harvestMonth}`;
        updateGrowthGraph(getGrowthData(parseInt(growthDuration), new Date(plantingDate).getMonth() + 1), "line");
    }
}

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok.");
    return await response.text();
}

async function fetchPlantData(url) {
    const csvText = await fetchData(url);
    if (!csvText) return [];
    return parseCSV(csvText);
}

function parseCSV(csvText) {
    const rows = csvText.trim().split('\n').map(row => row.split(','));
    const headers = rows[0].map(header => header.trim());
    return rows.slice(1).map(row => {
        return headers.reduce((obj, header, index) => {
            obj[header] = row[index]?.trim() ?? "";
            return obj;
        }, {});
    });
}

function getGrowthData(duration, plantingMonth) {
    const growthData = Array(12).fill(0);
    for (let i = 0; i < duration; i++) {
        const monthIndex = (plantingMonth - 1 + i) % 12;
        growthData[monthIndex] = (i + 1) * (100 / duration);
    }
    return growthData;
}

function updateGrowthGraph(predictions, chartType = "line") {
    if (!Array.isArray(predictions) || predictions.length !== 12) {
        console.error("❌ Invalid growth data:", predictions);
        return;
    }

    myChart.config.type = chartType;

    const chartLabel = chartType === "bar" ? "Harvest Time Graph" : "Plant Growth Over Months";

    myChart.data.datasets = [{
        label: chartLabel,
        data: predictions,
        borderColor: chartType === "line" ? 'green' : 'blue',
        backgroundColor: chartType === "line" ? 'rgba(0, 128, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)',
        fill: chartType === "line",
        tension: 0.4
    }];
    myChart.update();
}

function updateGrowthResults() {
    const duration = localStorage.getItem("growthDuration");
    const harvest = localStorage.getItem("harvestMonth");

    document.querySelector(".growth-result").style.display = "block";

    document.getElementById("growthDuration").innerText = duration
        ? `Predicted Growth Duration: ${duration} month${duration > 1 ? 's' : ''}`
        : "No data added";
    document.getElementById("harvestMonth").innerText = harvest
        ? `Predicted Harvest Month: ${harvest}`
        : "No data added";
}

document.getElementById("clearDataBtn").addEventListener("click", function () {
    console.log("🧹 Clearing prediction data...");

    localStorage.setItem("growthDuration", 0);
    localStorage.setItem("harvestMonth", 0);

    document.getElementById("growthDuration").innerText = "Predicted Growth Duration: 0 months";
    document.getElementById("harvestMonth").innerText = "Predicted Harvest Month: 0";

    const emptyGrowthData = Array(12).fill(0);
    updateGrowthGraph(emptyGrowthData, "line");
});

// 🌾 New function to switch to Harvest Time Graph (bar chart)
function toggleChart() {
    const growthDuration = parseInt(localStorage.getItem("growthDuration"));
    const plantingDate = localStorage.getItem("plantingDate");

    if (!isNaN(growthDuration) && plantingDate) {
        const plantingMonth = new Date(plantingDate).getMonth() + 1;
        const growthData = getGrowthData(growthDuration, plantingMonth);

        if (isHarvestChart) {
            updateGrowthGraph(growthData, "line");
            document.getElementById("predictHarvestGraph").textContent = "Harvest Time Graph";
        } else {
            updateGrowthGraph(growthData, "bar");
            document.getElementById("predictHarvestGraph").textContent = "Plant Growth Over Months";
        }

        isHarvestChart = !isHarvestChart; // Toggle the chart type
    } else {
        alert("Please submit a plant prediction first.");
    }
}

// HTML Button (no change needed in HTML itself, just use the existing button)
document.getElementById("predictHarvestGraph").addEventListener("click", toggleChart);

const ctx = document.getElementById("growthGraph").getContext("2d");
let myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: []
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: value => `${value}%`
                }
            }
        }
    }
});

async function populateAllPlantGrowthChart() {
    const timestamp = new Date().getTime();
    const plantData = await fetchPlantData(`/media/historical_plant_data.csv?t=${timestamp}`);

    const groupedData = {};

    plantData.forEach(row => {
        const name = row['Plant Name'];
        const plantingMonth = parseInt(row['Planting Month']);
        const duration = parseInt(row['Growth Duration (Months)']);

        if (!isNaN(plantingMonth) && !isNaN(duration)) {
            if (!groupedData[name]) groupedData[name] = [];
            groupedData[name].push({ plantingMonth, duration });
        }
    });

    const datasets = Object.keys(groupedData).map((plant, index) => {
        const avgGrowth = Array(12).fill(0);
        const entries = groupedData[plant];

        entries.forEach(entry => {
            const growth = getGrowthData(entry.duration, entry.plantingMonth);
            for (let i = 0; i < 12; i++) {
                avgGrowth[i] += growth[i];
            }
        });

        for (let i = 0; i < 12; i++) {
            avgGrowth[i] = avgGrowth[i] / entries.length;
        }

        return {
            label: `${plant} Avg Growth`,
            data: avgGrowth,
            borderColor: `hsl(${(index * 50) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 50) % 360}, 70%, 50%, 0.2)`,
            fill: false,
            tension: 0.4
        };
    });

    myChart.data.datasets = datasets;
    myChart.update();
}
