document.addEventListener("DOMContentLoaded", function () {
    fetchEventCountFromBackend();
});

function fetchEventCountFromBackend() {
    fetch('/api/get-events/')
        .then(res => res.json())
        .then(data => {
            const events = data.events || [];
            document.getElementById("eventCount").textContent = events.length;
        })
        .catch(error => {
            console.error("Failed to fetch events:", error);
        });
}
