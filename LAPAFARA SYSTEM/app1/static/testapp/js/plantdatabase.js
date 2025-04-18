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
    e.preventDefault();

    const formData = new FormData(this);

    // If editing
    if (editingIndex !== null) {
        const updatedPlant = {
            name: formData.get('name'),
            type: formData.get('type'),
            care: formData.get('care'),
            description: formData.get('description'),
            location: formData.get('location'),
            quantity: formData.get('quantity'),
            photoURL: plants[editingIndex].photoURL
        };

        plants[editingIndex] = updatedPlant;
        saveToLocalStorage();
        displayPlants();
        this.reset();
        document.querySelector("#plantForm button").textContent = "Add Plant";
        editingIndex = null;
        return;
    }

    // Add New
    fetch(this.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error adding plant');
        }
    })
    .then(newPlant => {
        plants.push(newPlant);
        saveToLocalStorage();
        displayPlants();
        this.reset();
    })
    .catch(error => console.error('Error:', error));
});

// Display Plant List with Pagination
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
                    <button onclick="editPlant(${start + index})" class="edit-btn">Edit</button>
                    <button onclick="deletePlant(${start + index})" class="delete-btn">Delete</button>
                </div>
            `;
            plantList.appendChild(plantItem);
        });
    }

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

// Delete Plant Data
function deletePlant(index) {
    plants.splice(index, 1);
    saveToLocalStorage();

    // Adjust current page if needed
    if (currentPage > 0 && currentPage * itemsPerPage >= plants.length) {
        currentPage--;
    }

    displayPlants();
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

// Initial Call
displayPlants();
