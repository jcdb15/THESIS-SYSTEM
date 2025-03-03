document.addEventListener("DOMContentLoaded", function () {
    updateEventCount();
});

function updateEventCount() {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    document.getElementById("eventCount").textContent = events.length;
}

// Function to add an event and update count
function addEvent(event) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));
    updateEventCount(); // Update event count on home.html
}

// Clear all events and update count
document.getElementById("clearEventsBtn").addEventListener("click", function () {
    localStorage.removeItem("events");
    document.getElementById("eventList").innerHTML = "";
    updateEventCount();
});
