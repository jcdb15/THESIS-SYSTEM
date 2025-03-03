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

// Calendar start
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = JSON.parse(localStorage.getItem("events")) || [];

function updateClock() {
    const now = new Date();
    document.getElementById("liveTime").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

function saveEventsToStorage() {
    localStorage.setItem("events", JSON.stringify(events));
}

function generateCalendar(month, year) {
    document.getElementById('calendarDays').innerHTML = '';
    document.getElementById('monthYear').innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        document.getElementById('calendarDays').appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
const dayDiv = document.createElement('div');
dayDiv.classList.add('day');
dayDiv.textContent = day;

// Get today's date
const today = new Date();
if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
    dayDiv.style.color = "black";  // White text for contrast
    dayDiv.style.border = "2px solid darkgreen"; // Optional: Add a border
}

// Highlight days with events
if (events.some(e => e.day === day && e.month === month && e.year === year)) {
    dayDiv.classList.add('event-day');
}

dayDiv.addEventListener('click', () => openEventModal(day, month, year));
document.getElementById('calendarDays').appendChild(dayDiv);
}
}

function openEventModal(day, month, year) {
    document.getElementById('eventModal').classList.add('show');

    document.getElementById('saveEventBtn').onclick = function() {
        const desc = document.getElementById('eventDescription').value.trim();
        const time = document.getElementById('eventTime').value;

        if (desc && time) {
            events.push({ day, month, year, description: desc, time });
            saveEventsToStorage();
            generateCalendar(currentMonth, currentYear);
            closeModal();
        }
    };
}

function closeModal() {
    document.getElementById('eventModal').classList.remove('show');
}

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

function deleteEvent(index) {
    events.splice(index, 1);
    saveEventsToStorage();
    showEventList();
    generateCalendar(currentMonth, currentYear);
}

function clearAllEvents() {
    events = [];
    saveEventsToStorage();
    showEventList();
    generateCalendar(currentMonth, currentYear);
}

function closeListEventsModal() {
    document.getElementById('listEventsModal').classList.remove('show');
}

document.getElementById('prevMonthBtn').onclick = () => {
    if (currentMonth === 0) { // If January, go to December of the previous year
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    generateCalendar(currentMonth, currentYear);
};

document.getElementById('nextMonthBtn').onclick = () => {
    if (currentMonth === 11) { // If December, go to January of the next year
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    generateCalendar(currentMonth, currentYear);
};

document.getElementById('listEventsBtn').addEventListener('click', showEventList);
document.getElementById('clearEventsBtn').addEventListener('click', clearAllEvents);
document.getElementById('listEventsModal').querySelector("button[onclick='closeListEventsModal()']").addEventListener('click', closeListEventsModal);

generateCalendar(currentMonth, currentYear);
// Calendar end 