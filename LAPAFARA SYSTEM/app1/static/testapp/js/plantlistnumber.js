document.addEventListener("DOMContentLoaded", function () {
    // Function to update the rice variety count
    function updateRiceVarietyCount() {
        const savedItems = localStorage.getItem("plantItems");
        if (savedItems) {
            const plants = JSON.parse(savedItems);
            const riceVarieties = new Set(); // Set to store unique rice varieties

            plants.forEach(plant => {
                if (plant.variety) {
                    riceVarieties.add(plant.variety); // Add variety to the set
                }
            });

            const count = riceVarieties.size; // Get the count of unique rice varieties
            document.getElementById("plantCount").textContent = count; // Update the count in home.html
        }
    }

    // Initial load: Update the rice variety count when the page loads
    updateRiceVarietyCount();

    // Listen for changes in localStorage (e.g., when a plant is added or removed)
    window.addEventListener("storage", function (e) {
        if (e.key === "plantItems") {
            updateRiceVarietyCount(); // Update the count when plantItems change
        }
    });
});
