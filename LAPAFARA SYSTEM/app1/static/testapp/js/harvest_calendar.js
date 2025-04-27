const events = window.harvestEvents;

document.addEventListener("DOMContentLoaded", function () {
    renderCalendar(new Date());
    loadStartDateFromStorage();
});

function renderCalendar(currentDate) {
    // render your calendar
    // loop through events and add .harvest-day class
}

function loadStartDateFromStorage() {
    const startDateSpan = document.getElementById("start-date");
    const storedDate = localStorage.getItem("plantingDate");

    if (storedDate) {
        const formatted = new Date(storedDate).toDateString();
        startDateSpan.textContent = formatted;
    } else {
        startDateSpan.textContent = "None";
    }
}



//Calendar move
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
let currentDate = new Date();

function renderCalendar() {
const month = currentDate.getMonth();
const year = currentDate.getFullYear();
document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;

const firstDayOfMonth = new Date(year, month, 1);
const lastDayOfMonth = new Date(year, month + 1, 0);
const totalDaysInMonth = lastDayOfMonth.getDate();
const startingDay = firstDayOfMonth.getDay();
const daysContainer = document.getElementById('days');
daysContainer.innerHTML = "";

const plantingDateStr = localStorage.getItem('plantingDate'); // Get from localStorage
const plantingDate = plantingDateStr ? new Date(plantingDateStr) : null;

for (let i = 0; i < startingDay; i++) {
daysContainer.innerHTML += "<div></div>";
}

for (let day = 1; day <= totalDaysInMonth; day++) {
const dayElement = document.createElement("div");
dayElement.textContent = day;
dayElement.classList.add("day");

const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const thisDate = new Date(dateStr);
if (plantingDate && thisDate.toDateString() === plantingDate.toDateString()) {
dayElement.classList.add("current-day");
document.getElementById("start-date").textContent = plantingDate.toDateString();

const harvestDate = new Date(plantingDate);
harvestDate.setDate(harvestDate.getDate() + 30);
document.getElementById("harvest-date").textContent = harvestDate.toDateString();
}

daysContainer.appendChild(dayElement);
}
}

document.getElementById('prev-month').addEventListener('click', () => {
currentDate.setMonth(currentDate.getMonth() - 1);
renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
currentDate.setMonth(currentDate.getMonth() + 1);
renderCalendar();
});

renderCalendar();