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

// Save Event to Backend
function saveEventsToBackend(day, month, year, description, time) {
    fetch('/api/add-event/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({
            title: description,
            date: `${year}-${month + 1}-${day}`,
            time: time
        })
    })
    .then(res => res.json())
    .then(() => fetchEvents());
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

// Modal for Adding/Editing Events
function openEventModal(day, month, year, eventForDay) {
    const modal = document.getElementById('eventModal');
    modal.classList.add('show');

    if (eventForDay) {
        document.getElementById('eventDescription').value = eventForDay.title;
        document.getElementById('eventTime').value = eventForDay.time;
    }

    document.getElementById('saveEventBtn').onclick = function () {
        const desc = document.getElementById('eventDescription').value.trim();
        const time = document.getElementById('eventTime').value;

        if (desc && time) {
            saveEventsToBackend(day, month, year, desc, time);
            closeModal();
        }
    };
}

// Close Modals
function closeModal() {
    document.getElementById('eventModal').classList.remove('show');
}

function closeListEventsModal() {
    document.getElementById('listEventsModal').classList.remove('show');
}

// Show Events in List View
function showEventList() {
    const eventListDiv = document.getElementById('eventList');
    eventListDiv.innerHTML = "";

    if (events.length === 0) {
        eventListDiv.innerHTML = "<p>No events found.</p>";
    } else {
        events.forEach((event, index) => {
            const eventBox = document.createElement('div');
            eventBox.classList.add('event-box-container');
            eventBox.innerHTML = `
                <div class="event-box">
                    <span class="event-date">${monthNames[event.month]} ${event.day}, ${event.year} - ${event.time}</span>
                    <span>${event.description}</span>
                </div>
                <button class="delete-btn" onclick="deleteEvent(${index})">Delete</button>
            `;
            eventListDiv.appendChild(eventBox);
        });
    }

    document.getElementById('listEventsModal').classList.add('show');
}

// Delete Event
function deleteEvent(index) {
    fetch('/api/delete-event/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ eventId: events[index].id })
    })
    .then(() => {
        events.splice(index, 1);
        showEventList();
        generateCalendar(currentMonth, currentYear);
    });
}

// Clear All Events
function clearAllEvents() {
    fetch('/api/clear-all-events/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        }
    })
    .then(() => {
        events = [];
        generateCalendar(currentMonth, currentYear);
        showEventList();
    });
}

// Navigation Buttons
document.getElementById('prevMonthBtn').onclick = () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    generateCalendar(currentMonth, currentYear);
};

document.getElementById('nextMonthBtn').onclick = () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    generateCalendar(currentMonth, currentYear);
};

// Event Listeners
document.getElementById('listEventsBtn').addEventListener('click', showEventList);
document.getElementById('clearEventsBtn').addEventListener('click', clearAllEvents);
document.getElementById('listEventsModal')
    .querySelector("button[onclick='closeListEventsModal()']")
    .addEventListener('click', closeListEventsModal);

// Init
generateCalendar(currentMonth, currentYear);
fetchEvents();

// CSRF Token Helper
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') return decodeURIComponent(value);
    }
    return '';
}
