document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("plantForm");
    const plantsContainer = document.getElementById("plants");
    const filterDropdown = document.getElementById("filterType");

    // Function to update quantity
    function updateQuantity(variety, type, operation) {
        const itemId = `plant-${variety.toLowerCase()}-${type}`;
        const quantityElement = document.getElementById(`quantity-${itemId}`);
        let currentQuantity = parseInt(quantityElement.textContent);
        if (operation === "increase") {
            currentQuantity += 1;
        } else if (operation === "decrease" && currentQuantity > 0) {
            currentQuantity -= 1;
        }
        quantityElement.textContent = currentQuantity;
        updateLocalStorage();
    }

    // Function to update localStorage
    function updateLocalStorage() {
        const plantItems = [];
        document.querySelectorAll(".plant-item").forEach(item => {
            const variety = item.querySelector("strong").textContent;
            const type = item.getAttribute("data-type");
            const quantity = parseInt(item.querySelector(`#quantity-${item.id}`).textContent);
            const photo = item.querySelector("img").src;
            plantItems.push({ variety, type, quantity, photo });
        });
        localStorage.setItem("plantItems", JSON.stringify(plantItems));
    }

    // Function to add or update plant item
    function addOrUpdatePlantItem(variety, type, typeLabel, quantity, photoURL) {
        const itemId = `plant-${variety.toLowerCase()}-${type}`;
        const existingItem = document.getElementById(itemId);
        if (existingItem) {
            const quantityElement = existingItem.querySelector(`#quantity-${itemId}`);
            quantityElement.textContent = parseInt(quantityElement.textContent) + quantity;
        } else {
            const item = document.createElement("div");
            item.className = "plant-item";
            item.id = itemId;
            item.setAttribute("data-type", type);

            item.innerHTML = `
                <p><strong>${variety}</strong> (${typeLabel}) - Quantity: <span id="quantity-${itemId}">${quantity}</span> cavans</p>
                <img src="${photoURL}" alt="${variety}" width="100">
                <button class="increase" data-variety="${variety.toLowerCase()}" data-type="${type}">+</button>
                <button class="decrease" data-variety="${variety.toLowerCase()}" data-type="${type}">-</button>
            `;

            plantsContainer.appendChild(item);

            item.querySelector(".increase").addEventListener("click", () => updateQuantity(variety.toLowerCase(), type, "increase"));
            item.querySelector(".decrease").addEventListener("click", () => updateQuantity(variety.toLowerCase(), type, "decrease"));

            // Right-click delete
            item.addEventListener("contextmenu", function (e) {
                e.preventDefault();
                const deleteOption = confirm(`Do you want to delete ${variety} (${typeLabel})?`);
                if (deleteOption) {
                    item.remove();
                    updateLocalStorage();
                }
            });
        }
        updateLocalStorage();
    }

    // Form submission handler
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const variety = document.getElementById("rice_variety").value;
        const type = document.getElementById("rice_type").value;
        const typeLabel = type === "milled" ? "Milled Rice" : "Unmilled Rice";
        const quantity = parseInt(document.getElementById("quantity").value);
        const photoInput = document.getElementById("photo");

        if (photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const photoURL = e.target.result; // Base64 string
                addOrUpdatePlantItem(variety, type, typeLabel, quantity, photoURL);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            addOrUpdatePlantItem(variety, type, typeLabel, quantity, "");
        }

        form.reset();
    });

    // Load data from localStorage on page load
    function loadPlantsFromLocalStorage() {
        const savedItems = localStorage.getItem("plantItems");
        if (savedItems) {
            const plants = JSON.parse(savedItems);
            plants.forEach(plant => {
                const typeLabel = plant.type === "milled" ? "Milled Rice" : "Unmilled Rice";
                addOrUpdatePlantItem(plant.variety, plant.type, typeLabel, plant.quantity, plant.photo);
            });
        }
    }

    // Initial load
    loadPlantsFromLocalStorage();

    // Filter handler
    filterDropdown.addEventListener("change", function () {
        const selected = this.value;
        document.querySelectorAll(".plant-item").forEach(item => {
            const type = item.getAttribute("data-type");
            item.style.display = (selected === "all" || type === selected) ? "flex" : "none";
        });
    });
});



