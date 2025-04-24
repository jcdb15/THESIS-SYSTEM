// Activate Side Menu Items
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
        li.classList.add('active');
    });
});

// Toggle Sidebar
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', () => {
    sidebar.classList.toggle('hide');
});

// Toggle Search Form (on small screens)
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');

        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

// Responsive adjustments
if (window.innerWidth < 768) {
    sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
    searchButtonIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
}

window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

// ================== Calendar ==================
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = [];

// Live Clock
function updateClock() {
    const now = new Date();
    document.getElementById("liveTime").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Fetch Events from Backend
function fetchEvents() {
    fetch('/api/get-events/')
        .then(res => res.json())
        .then(data => {
            console.log("Fetched events:", data.events);
            events = data.events;
            generateCalendar(currentMonth, currentYear);
        });
}

// Generate Calendar View
function generateCalendar(month, year) {
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    document.getElementById('monthYear').innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarDays.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.style.color = "black";
            dayDiv.style.border = "2px solid darkgreen";
        }

        const eventForDay = events.find(e => e.day === day && e.month === month && e.year === year);
        if (eventForDay) {
            dayDiv.classList.add('event-day');
            dayDiv.title = eventForDay.title;
        }

        dayDiv.addEventListener('click', () => openEventModal(day, month, year, eventForDay));
        calendarDays.appendChild(dayDiv);
    }
}

// Highlight Selected Planting Date
function highlightSelectedDate() {
    const selectedPlantingDate = localStorage.getItem("selectedPlantingDate");

    if (selectedPlantingDate) {
        const [year, month, day] = selectedPlantingDate.split("-");
        const calendarDays = document.getElementById('calendarDays');
        const dayDiv = calendarDays.querySelector(`div[data-day="${day}"][data-month="${month - 1}"][data-year="${year}"]`);
        if (dayDiv) {
            dayDiv.classList.add('highlighted');
        }
    }
}

// Call this function after generating the calendar
function highlightPlantingDayOnCalendar() {
    const selectedPlantingDate = localStorage.getItem("selectedPlantingDate");

    if (selectedPlantingDate) {
        const [year, month, day] = selectedPlantingDate.split("-");
        const calendarDays = document.getElementById('calendarDays');
        const dayDiv = calendarDays.querySelector(`div[data-day="${day}"][data-month="${month - 1}"][data-year="${year}"]`);
        if (dayDiv) {
            dayDiv.classList.add('highlighted');
        }
    }
}

// Call after generating the calendar to highlight the date
generateCalendar(currentMonth, currentYear);
highlightPlantingDayOnCalendar();