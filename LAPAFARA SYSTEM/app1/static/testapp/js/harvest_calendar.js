let currentDate = new Date();

document.addEventListener("DOMContentLoaded", function () {
    loadStartDateFromStorage();
    setupPlantingDateListener();
    renderCalendar();
});

function loadStartDateFromStorage() {
    const startDateSpan = document.getElementById("start-date");
    const harvestDateSpan = document.getElementById("harvest-date");
    const storedDate = localStorage.getItem("plantingDate");

    if (storedDate) {
        const plantingDate = new Date(storedDate + "T00:00:00");
        const harvestDate = new Date(plantingDate);
        harvestDate.setDate(harvestDate.getDate() + 30);

        startDateSpan.textContent = formatDate(plantingDate);
        harvestDateSpan.textContent = formatDate(harvestDate);
    } else {
        startDateSpan.textContent = "None";
        harvestDateSpan.textContent = "None";
    }
}

function setupPlantingDateListener() {
    const plantingDateInput = document.getElementById('plantingDate');
    const startDateSpan = document.getElementById('start-date');
    const harvestDateSpan = document.getElementById('harvest-date');

    if (plantingDateInput) {
        plantingDateInput.addEventListener('input', () => {
            const selectedDate = plantingDateInput.value;
            if (selectedDate) {
                const plantingDate = new Date(selectedDate + "T00:00:00");
                const harvestDate = new Date(plantingDate);
                harvestDate.setDate(harvestDate.getDate() + 30);

                startDateSpan.textContent = formatDate(plantingDate);
                harvestDateSpan.textContent = formatDate(harvestDate);

                localStorage.setItem('plantingDate', selectedDate);
                renderCalendar();
            } else {
                startDateSpan.textContent = 'None';
                harvestDateSpan.textContent = 'None';
                localStorage.removeItem('plantingDate');
                renderCalendar();
            }
        });
    }
}

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function renderCalendar() {
    const monthYear = document.getElementById('month-year');
    const daysContainer = document.getElementById('days');
    daysContainer.innerHTML = "";

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    monthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const plantingDateStr = localStorage.getItem('plantingDate');
    const plantingDate = plantingDateStr ? new Date(plantingDateStr + "T00:00:00") : null;
    let harvestDate = null;
    if (plantingDate) {
        harvestDate = new Date(plantingDate);
        harvestDate.setDate(harvestDate.getDate() + 30);
    }

    // Add blanks before the 1st day
    for (let i = 0; i < firstDay; i++) {
        const blankDiv = document.createElement('div');
        blankDiv.classList.add('day');
        blankDiv.style.visibility = 'hidden';
        daysContainer.appendChild(blankDiv);
    }

    // Add actual days
    for (let day = 1; day <= lastDate; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('day');

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const thisDate = new Date(dateStr + "T00:00:00");

        if (plantingDate && thisDate.toDateString() === plantingDate.toDateString()) {
            dayElement.classList.add('current-day');
        }

        if (harvestDate && thisDate.toDateString() === harvestDate.toDateString()) {
            dayElement.classList.add('harvest-day');
        }

        daysContainer.appendChild(dayElement);
    }
}

function formatDate(dateObj) {
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});
