// Sidebar Menu Active State
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', function () {
        allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
        li.classList.add('active');
    });
});

// Sidebar Toggle
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

// Search Bar Toggle on Small Screens
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        searchButtonIcon.classList.toggle('bx-x');
        searchButtonIcon.classList.toggle('bx-search');
    }
});

// Handle Sidebar Visibility on Resize
window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

// Initialize Plants Array and Pagination Variables
let plants = JSON.parse(localStorage.getItem('plants')) || [];
let currentPage = 0;
const itemsPerPage = 3;
let editingIndex = null;

// Save to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('plants', JSON.stringify(plants));
}

// Handle Form Submission Using Fetch API (AJAX)
document.getElementById('plantForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(this); // Collect form data

    fetch(this.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Expecting a JSON response containing the new plant
        } else {
            throw new Error('Error adding plant');
        }
    })
    .then(newPlant => {
        // Add the new plant to the local storage array
        plants.push(newPlant);
        saveToLocalStorage(); // Save updated plants array to local storage
        displayPlants(); // Update the displayed plant list
        document.getElementById('plantForm').reset(); // Reset the form
    })
    .catch(error => console.error('Error:', error));
});

// Display Plant List with Pagination
function displayPlants() {
    const plantList = document.getElementById('plants');
    plantList.innerHTML = ''; // Clear the existing plant list

    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPlants = plants.slice(start, end);

    paginatedPlants.forEach((plant, index) => {
        const plantItem = document.createElement('div');
        plantItem.classList.add('plant-item');
        plantItem.innerHTML = `
            <div class="plant-details">
                <strong>${plant.name}</strong> (${plant.type})
                <p>Care: ${plant.care}</p>
                <p>Description: ${plant.description}</p>
                <p>Location: ${plant.location}</p>
                <p>Quantity: ${plant.quantity}</p>
            </div>
            ${plant.photoURL ? `<img src="${plant.photoURL}" alt="${plant.name}" width="100">` : ''}
            <div class="button-container">
                <button onclick="editPlant(${start + index})" class="edit-btn">Edit</button>
                <button onclick="deletePlant(${start + index})" class="delete-btn">Delete</button>
            </div>
        `;
        plantList.appendChild(plantItem);
    });

    // Show or hide pagination controls
    document.querySelector('.pagination-container').style.display = plants.length > itemsPerPage ? 'flex' : 'none';
}

// Edit Plant Data
function editPlant(index) {
    const plant = plants[index];

    document.getElementById('plantName').value = plant.name;
    document.getElementById('plantType').value = plant.type;
    document.getElementById('plantCare').value = plant.care;
    document.getElementById('plantDescription').value = plant.description;
    document.getElementById('plantLocation').value = plant.location;
    document.getElementById('plantQuantity').value = plant.quantity;

    editingIndex = index;
    document.querySelector("#plantForm button").textContent = "Save Plant";
}

// Save Edited Plant
document.getElementById('plantForm').addEventListener('submit', function (e) {
    if (editingIndex !== null) {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(this); // Collect form data

        // Update the plant data
        const updatedPlant = {
            name: formData.get('name'),
            type: formData.get('type'),
            care: formData.get('care'),
            description: formData.get('description'),
            location: formData.get('location'),
            quantity: formData.get('quantity'),
            photoURL: plants[editingIndex].photoURL // Keep existing photo URL
        };

        plants[editingIndex] = updatedPlant; // Update the plant in the array
        saveToLocalStorage(); // Save updated plants array to local storage
        displayPlants(); // Update the displayed plant list
        document.getElementById('plantForm').reset(); // Reset the form
        document.querySelector("#plantForm button").textContent = "Add Plant"; // Reset button text
        editingIndex = null; // Reset editing index
    }
});

// Delete Plant Data
function deletePlant(index) {
    plants.splice(index, 1); // Remove the plant from the array
    saveToLocalStorage(); // Update local storage
    displayPlants(); // Refresh the displayed plant list
}

// Pagination Controls
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        displayPlants();
    }
}

function nextPage() {
    if ((currentPage + 1) * itemsPerPage < plants.length) {
        currentPage++;
        displayPlants();
    }
}

// Initialize Display
displayPlants();
