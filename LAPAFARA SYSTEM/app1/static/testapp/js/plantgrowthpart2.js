    // Initialize Plants and Pagination
    let plants = JSON.parse(localStorage.getItem('plants')) || [];
    let currentPage = 0;
    const itemsPerPage = 3;

    function saveToLocalStorage() {
        localStorage.setItem('plants', JSON.stringify(plants));
    }

    // Handle Add Form
    document.getElementById('plantForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        // New plant entry
        fetch(this.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to add plant'))
        .then(newPlant => {
            plants.push(newPlant);
            saveToLocalStorage();
            displayPlants();
            this.reset();
            document.querySelector('#photoInput').value = '';  // Reset photo input
        })
        .catch(error => console.error('Error:', error));
    });

    // Render paginated plants
    function displayPlants() {
        const plantList = document.getElementById('plants');
        plantList.innerHTML = '';

        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedPlants = plants.slice(start, end);

        if (plants.length === 0) {
            plantList.innerHTML = `<p class="no-data-message">No data exists</p>`;
        } else {
            paginatedPlants.forEach((plant, index) => {
                const plantItem = document.createElement('div');
                plantItem.classList.add('plant-item');
                plantItem.innerHTML = `
                    <div class="plant-details">
                        <strong>${plant.name}</strong> (${plant.type})
                        <p>Care: ${plant.care}</p>
                        <p>Location: ${plant.location}</p>
                        <p>Quantity: ${plant.quantity}</p>
                    </div>
                    ${plant.photoURL ? `<img src="${plant.photoURL}" alt="${plant.name}" width="100">` : ''}
                    <div class="button-container">
                        <button onclick="deletePlant(${start + index})" class="delete-btn">Delete</button>
                        <button onclick="editPlant(${start + index})" class="edit-btn">Edit</button>
                    </div>
                `;
                plantList.appendChild(plantItem);
            });     
        }

        // Handle pagination button state
        const paginationContainer = document.querySelector('.pagination-container');
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');

        if (plants.length > itemsPerPage) {
            paginationContainer.style.display = 'flex';
            prevButton.disabled = currentPage === 0;
            nextButton.disabled = (currentPage + 1) * itemsPerPage >= plants.length;
        } else {
            paginationContainer.style.display = 'none';
        }
    }

    // Pagination
    window.prevPage = function () {
        if (currentPage > 0) {
            currentPage--;
            displayPlants();
        }
    };

    window.nextPage = function () {
        if ((currentPage + 1) * itemsPerPage < plants.length) {
            currentPage++;
            displayPlants();
        }
    };

    // Delete function
    window.deletePlant = function (index) {
        plants.splice(index, 1);
        saveToLocalStorage();

        if (currentPage > 0 && currentPage * itemsPerPage >= plants.length) {
            currentPage--;
        }

        displayPlants();
    };

    // Edit function
    window.editPlant = function (index) {
        const plant = plants[index];
        const form = document.getElementById('plantForm');
        form.querySelector('input[name="name"]').value = plant.name;
        form.querySelector('input[name="type"]').value = plant.type;
        form.querySelector('input[name="care"]').value = plant.care;
        form.querySelector('input[name="location"]').value = plant.location;
        form.querySelector('input[name="quantity"]').value = plant.quantity;

        // Handle save edited plant
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            const editedPlant = {
                name: formData.get('name'),
                type: formData.get('type'),
                care: formData.get('care'),
                location: formData.get('location'),
                quantity: formData.get('quantity'),
            };

            // Update the plant in the list
            plants[index] = editedPlant;
            saveToLocalStorage();
            displayPlants();
            form.reset(); // Reset the form
        });
    };

    // Initial render
    displayPlants();



//django admin delete start
function deletePlant(plantId) {
    if (confirm("Are you sure you want to delete this plant?")) {
        // Send a delete request to Django API
        fetch(`/delete-plant/${plantId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is sent
            },
        })
        .then(response => {
            if (response.ok) {
                alert("Plant deleted successfully.");
                // Optionally, you can also remove the element from the page without refreshing
                document.getElementById(`plant-${plantId}`).remove(); // Assuming you have an ID like plant-<id> for each plant
            } else {
                alert("Failed to delete the plant.");
            }
        })
        .catch(error => {
            console.error('Error deleting plant:', error);
            alert("An error occurred while deleting the plant.");
        });
    }
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
