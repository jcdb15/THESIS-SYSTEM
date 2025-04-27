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
