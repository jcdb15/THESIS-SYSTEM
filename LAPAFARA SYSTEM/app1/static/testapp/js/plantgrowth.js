console.log("🚀 Script loaded!");

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let isHarvestChart = false;
let hasRangeDuration = false;
let isOptimalMode = false; // New flag to detect Optimal Growth mode

// Initialize chart context
const ctx = document.getElementById("growthGraph").getContext("2d");
let myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: monthLabels,
        datasets: []
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Plant Growth Prediction'
            }
        },
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

// === Load and Init ===
document.addEventListener("DOMContentLoaded", async function () {
    loadSavedData();
    await populatePlantDropdown();
    updateGrowthResults();
    await populateAllPlantGrowthChart();
    loadSavedData();

    document.getElementById('optimalGrowthBtn').addEventListener('click', function () {
        const button = this; // Reference to the clicked button
        if (button.textContent === "Optimal Growth Season") {
            button.textContent = "Plant Growth Prediction"; // Change text to 'Plant Growth Prediction'
        } else {
            button.textContent = "Optimal Growth Season"; // Change text back to 'Optimal Growth Season'
        }
    });
    
});

// === Chart Helpers ===
function getGrowthData(durationString, plantingMonth) {
    const duration = parseInt(durationString);
    const growthData = Array(12).fill(null);

    if (!isNaN(duration) && plantingMonth >= 1 && plantingMonth <= 12) {
        const startIndex = (plantingMonth - 1) % 12;
        growthData[startIndex] = 0;
        for (let i = 1; i < duration; i++) {
            const monthIndex = (startIndex + i) % 12;
            growthData[monthIndex] = (i) * (100 / duration);
        }
        const lastMonthIndex = (startIndex + duration - 1) % 12;
        growthData[lastMonthIndex] = 100;
    }

    return growthData;
}

function updateGrowthGraph(data, type = "line", label = "Plant Growth Over Months") {
    myChart.config.type = type;
    myChart.data.labels = monthLabels;
    myChart.data.datasets = [{
        label: label,
        data: data,
        backgroundColor: type === "bar" ? 'rgba(54, 162, 235, 0.6)' : 'rgba(0, 128, 0, 0.2)',
        borderColor: type === "bar" ? 'rgba(54, 162, 235, 1)' : 'green',
        fill: type === "line",
        tension: type === "line" ? 0.4 : 0
    }];
    myChart.update();
}

function drawGrowthGraphs(durationString, plantingMonth) {
    if (!durationString || durationString === "0") {
        updateGrowthGraph(Array(12).fill(0), "line");
        return;
    }

    if (durationString.includes("-")) {
        hasRangeDuration = true;
        const [minDuration, maxDuration] = durationString.split('-').map(d => parseInt(d.trim()));
        const dataMin = getGrowthData(minDuration, plantingMonth);
        const dataMax = getGrowthData(maxDuration, plantingMonth);

        myChart.config.type = "line";
        myChart.data.labels = monthLabels;
        myChart.data.datasets = [
            {
                label: `Growth ${minDuration} months`,
                data: dataMin,
                borderColor: 'green',
                backgroundColor: 'rgba(0, 128, 0, 0.2)',
                fill: true,
                tension: 0.4
            },
            {
                label: `Growth ${maxDuration} months`,
                data: dataMax,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                fill: true,
                tension: 0.4
            }
        ];
        myChart.update();
    } else {
        const data = getGrowthData(durationString, plantingMonth);
        updateGrowthGraph(data, "line");
    }
}

// === Optimal Growth Season Chart ===
function showOptimalGrowthSeason() {
    console.log("📊 Showing Optimal Growth Season");
    isOptimalMode = true; // Enable flag

    const historicalData = JSON.parse(localStorage.getItem('cropData')) || [];
    if (historicalData.length === 0) {
        alert("No historical data found. Please add some first.");
        return;
    }

    const plantMonthMap = {};
    historicalData.forEach(entry => {
        const plant = entry.plantName;
        const month = entry.plantingMonth;
        if (!plant || !month) return;
        if (!plantMonthMap[plant]) {
            plantMonthMap[plant] = new Array(12).fill(0);
        }
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        plantMonthMap[plant][monthIndex]++;
    });

    Object.keys(plantMonthMap).forEach(plant => {
        const max = Math.max(...plantMonthMap[plant]);
        if (max > 0) {
            plantMonthMap[plant] = plantMonthMap[plant].map(v => (v / max) * 100);
        }
    });

    const colors = [
        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'
    ];

    // Prepare datasets for each plant
    const datasets = Object.keys(plantMonthMap).map((plant, i) => ({
        label: plant,
        data: plantMonthMap[plant],
        backgroundColor: colors[i % colors.length],
        borderColor: colors[i % colors.length],
        borderWidth: 1
    }));

    // Chart.js configuration
    myChart.config.type = "bar";
    myChart.data.labels = monthLabels; // Labels for months
    myChart.data.datasets = datasets; // Datasets for each plant
    myChart.options.plugins.title.text = "Optimal Growth Season Based on Historical Planting Frequency";

    // Configure axes
    myChart.options.scales = {
        x: {
            stacked: false, // Ensure bars are grouped, not stacked
        },
        y: {
            stacked: false, // Same for the Y axis if you don't want stacking
        }
    };

    myChart.update();

    // Hide growth duration text
    document.getElementById("growthDuration").innerText = ""; 
}
// END OPTIMIMAL GROWTH SEASON

// === Populate and Fetch ===
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

        const savedGrowthDuration = localStorage.getItem("growthDuration");
        const savedPlantingDate = localStorage.getItem("plantingDate");
        if (savedGrowthDuration && savedPlantingDate) {
            const plantingMonth = new Date(savedPlantingDate).getMonth() + 1;
            drawGrowthGraphs(savedGrowthDuration, plantingMonth);
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

async function fetchPlantData(url) {
    const csvText = await fetchData(url);
    if (!csvText) return [];
    return parseCSV(csvText);
}

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok.");
    return await response.text();
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

// === Form and Submission ===
document.getElementById("plantForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("🚀 Form submitted!");
    document.querySelector(".growth-result").style.display = "block";
    isOptimalMode = false; // Reset flag

    const selectedPlant = document.getElementById("plantSelect").value;
    const soilType = document.getElementById("soilType")?.value ?? '';
    const fertilizer = document.getElementById("fertilizer")?.value ?? '';
    const plantingDate = new Date(document.getElementById("plantingDate").value);
    const plantingMonth = plantingDate.getMonth() + 1;

    const timestamp = new Date().getTime();
    const plantData = await fetchPlantData(`/media/historical_plant_data.csv?t=${timestamp}`);

    const matchingData = plantData.filter(p =>
        p['Plant Name'].toLowerCase() === selectedPlant.toLowerCase() &&
        (!soilType || p['Soil Type']?.toLowerCase() === soilType.toLowerCase()) &&
        (!fertilizer || p['Fertilizer']?.toLowerCase() === fertilizer.toLowerCase())
    );

    if (matchingData.length > 0) {
        const mostFrequentDuration = getMostFrequentGrowthDuration(matchingData);
        localStorage.setItem("selectedPlant", selectedPlant);
        localStorage.setItem("growthDuration", mostFrequentDuration);
        localStorage.setItem("plantingDate", document.getElementById("plantingDate").value);

        updateGrowthResults();
        drawGrowthGraphs(mostFrequentDuration, plantingMonth);
    } else {
        alert("No matching plant data found.");
        localStorage.setItem("selectedPlant", selectedPlant);
        localStorage.setItem("growthDuration", "0");
        localStorage.setItem("plantingDate", document.getElementById("plantingDate").value);

        updateGrowthResults();
        updateGrowthGraph(Array(12).fill(0), "line");
    }
});

// === Utility ===
function getMostFrequentGrowthDuration(data) {
    const durationCount = {};
    data.forEach(row => {
        const duration = row['Growth Duration (Months)'];
        durationCount[duration] = (durationCount[duration] || 0) + 1;
    });

    let mostFrequent = null;
    let maxCount = 0;
    for (const [duration, count] of Object.entries(durationCount)) {
        if (count > maxCount) {
            mostFrequent = duration;
            maxCount = count;
        }
    }
    return mostFrequent;
}

function loadSavedData() {
    const selectedPlant = localStorage.getItem("selectedPlant");
    const growthDuration = localStorage.getItem("growthDuration");
    const plantingDate = localStorage.getItem("plantingDate");

    if (selectedPlant && growthDuration && plantingDate) {
        document.getElementById("plantSelect").value = selectedPlant;
        const plantingMonth = new Date(plantingDate).getMonth() + 1;
        drawGrowthGraphs(growthDuration, plantingMonth);
        updateGrowthResults();
    } else {
        updateGrowthGraph(Array(12).fill(0), "line");
    }
}

function updateGrowthResults() {
    const duration = localStorage.getItem("growthDuration");
    const selectedPlant = localStorage.getItem("selectedPlant"); // Get the selected plant
    document.querySelector(".growth-result").style.display = "block";

    // Only update if NOT in optimal mode
    if (!isOptimalMode) {
        document.getElementById("growthDuration").innerText = duration && duration !== "0"
            ? `Predicted Growth Duration of ${selectedPlant}: ${duration} month${duration !== "1" ? 's' : ''}`
            : "";
    }

    document.getElementById("harvestMonth").innerText = "";
}



//Calendar























// === Event Listener for Optimal Growth Button ===
document.getElementById('optimalGrowthBtn').addEventListener('click', () => {
    console.log("✅ Optimal Growth button clicked.");
    showOptimalGrowthSeason();
});








//CLEAR DATA BUTTON START
document.getElementById("clearDataBtn").addEventListener("click", function () {
    // Clear data from localStorage
    localStorage.removeItem("selectedPlant");
    localStorage.removeItem("growthDuration");
    localStorage.removeItem("harvestMonth");
    localStorage.removeItem("plantingDate");

    // Reset the dropdown selection to default (first option)
    document.getElementById("plantSelect").value = document.getElementById("plantSelect").options[0].value;

    // Reset planting date
    document.getElementById("plantingDate").value = "";

    // Reset soil type (if dropdown exists)
    const soilTypeSelect = document.getElementById("soilType");
    if (soilTypeSelect) {
        soilTypeSelect.value = soilTypeSelect.options[0].value;
    }

    // Reset fertilizer (if dropdown exists)
    const fertilizerSelect = document.getElementById("fertilizer");
    if (fertilizerSelect) {
        fertilizerSelect.value = fertilizerSelect.options[0].value;
    }

    // Keep growth-result visible, just update the text
    document.querySelector(".growth-result").style.display = "block";
    document.getElementById("growthDuration").innerText = "Predicted Growth Duration: 0 months";
    document.getElementById("harvestMonth").innerText = "";

    // Reset the graph to 0% data
    updateGrowthGraph(Array(12).fill(0), "line");

    console.log("🚀 Data and form fields cleared!");
});
//CLEAR DATA END





  






//DOWNLOAD PNG START
function downloadHarvestChart() {
    const width = 1600;
    const height = 800;
    const margin = 40;
    const chartGap = 20;
    const titleHeight = 50;

    // Canvas setup
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');

    const chartWidth = (width - margin * 2 - chartGap) / 2;
    const chartHeight = height - margin * 2 - titleHeight;

    // Temporary canvases
    const growthCanvas = document.createElement('canvas');
    growthCanvas.width = chartWidth;
    growthCanvas.height = chartHeight;

    const harvestCanvas = document.createElement('canvas');
    harvestCanvas.width = chartWidth;
    harvestCanvas.height = chartHeight;

    const growthCtx = growthCanvas.getContext('2d');
    const harvestCtx = harvestCanvas.getContext('2d');

    // Get selected plant name from the dropdown
    const selectedPlant = document.getElementById("plantSelect").value || "Unknown Plant"; 

    // Load planting date from localStorage
    const plantingDateStr = localStorage.getItem("plantingDate");
    const plantingDate = plantingDateStr ? new Date(plantingDateStr) : null;

    const formattedDate = plantingDate
        ? plantingDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        : "Unknown Date";

    const titleText = `${selectedPlant} - Planted: ${formattedDate}`;

    const growthChart = new Chart(growthCtx, {
        type: 'line',
        data: myChart.data,
        options: {
            ...myChart.options,
            plugins: {
                title: {
                    display: true,
                    text: '🌱 Plant Growth Over Months',
                    font: { size: 18 }
                }
            },
            responsive: false,
            animation: false
        }
    });

    const growthDuration = parseInt(localStorage.getItem("growthDuration"));
    const plantingMonth = plantingDate ? plantingDate.getMonth() + 1 : 1;
    const harvestData = getGrowthData(growthDuration, plantingMonth);

    const harvestChart = new Chart(harvestCtx, {
        type: 'bar',
        data: {
            labels: myChart.data.labels,
            datasets: [{
                label: "🌾 Harvest Time Graph",
                data: harvestData,
                backgroundColor: 'rgba(0, 0, 255, 0.5)',
                borderColor: 'blue',
                borderWidth: 1
            }]
        },
        options: {
            ...myChart.options,
            plugins: {
                title: {
                    display: true,
                    text: '🌾 Harvest Time Graph',
                    font: { size: 18 }
                },
                legend: {
                    display: false
                }
            },
            responsive: false,
            animation: false
        }
    });

    // Wait for both charts to render
    setTimeout(() => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // ✨ Draw the title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(titleText, width / 2, margin + 10);

        // Draw charts below title
        const chartY = margin + titleHeight;
        ctx.drawImage(growthCanvas, margin, chartY, chartWidth, chartHeight);
        ctx.drawImage(harvestCanvas, margin + chartWidth + chartGap, chartY, chartWidth, chartHeight);

        // Save image
        const finalURL = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = finalURL;
        link.download = "plant_growth_and_harvest_chart.png";
        link.click();

        growthChart.destroy();
        harvestChart.destroy();
    }, 800);
}

//DOWNLOAD PNG END


//Calendar Start
document.addEventListener("DOMContentLoaded", function () {
    let currentDate = new Date();

    renderCalendar(currentDate);

    document.getElementById('prev-month').addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    document.getElementById('next-month').addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    function renderCalendar(date) {
        const monthYear = document.getElementById('month-year');
        const daysContainer = document.getElementById('days');
        daysContainer.innerHTML = "";

        const month = date.getMonth();
        const year = date.getFullYear();
        
        monthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDayOfWeek = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();

        // Fill in empty slots before the 1st day
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            daysContainer.appendChild(emptyDiv);
        }

        // Fill in days
        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = day;

            const eventDateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // If event date matches, mark it
            if (events.some(event => event.date === eventDateStr)) {
                dayDiv.classList.add('harvest-day');
            }

            daysContainer.appendChild(dayDiv);
        }
    }

    
})

