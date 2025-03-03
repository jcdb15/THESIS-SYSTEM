// Initialize an empty array to hold the plants data
let plants = JSON.parse(localStorage.getItem('plants')) || [];

// Function to update the plant count in home.html
function updatePlantCount() {
    const plantCount = plants.length; // Get the number of plants
    document.getElementById('plantCount').textContent = plantCount; // Update the display in home.html
}

// Function to add a new plant
function addPlant(event) {
    event.preventDefault(); // Prevent the default form submission

    const plantName = document.getElementById('plantName').value;
    const plantType = document.getElementById('plantType').value;
    const plantCare = document.getElementById('plantCare').value;
    const plantDescription = document.getElementById('plantDescription').value;
    const plantLocation = document.getElementById('plantLocation').value;
    const plantQuantity = parseInt(document.getElementById('plantQuantity').value);
    const plantPhoto = document.getElementById('plantPhoto').files[0];

    const newPlant = {
        name: plantName,
        type: plantType,
        care: plantCare,
        description: plantDescription,
        location: plantLocation,
        quantity: plantQuantity,
        photo: plantPhoto ? URL.createObjectURL(plantPhoto) : null,
    };

    plants.push(newPlant); // Add the new plant to the array

    localStorage.setItem('plants', JSON.stringify(plants)); // Save to localStorage
    updatePlantCount(); // Update the plant count display
    displayPlants(); // Refresh the plant list

    // Reset the form
    document.getElementById('plantForm').reset();
}

// Function to display the plants in plantdatabase.html
function displayPlants() {
    const plantList = document.getElementById('plantList');
    plantList.innerHTML = ''; // Clear the list before displaying new data

    plants.forEach((plant, index) => {
        const plantElement = document.createElement('div');
        plantElement.innerHTML = `
            <div>
                <h4>${plant.name}</h4>
                <p>${plant.type}</p>
                <p>${plant.care}</p>
                <p>${plant.description}</p>
                <p>${plant.location}</p>
                <p>Quantity: ${plant.quantity}</p>
                <img src="${plant.photo}" alt="${plant.name}" width="100" />
                <button onclick="deletePlant(${index})">Delete</button>
            </div>
        `;
        plantList.appendChild(plantElement);
    });
}

// Function to delete a plant
function deletePlant(index) {
    plants.splice(index, 1); // Remove the plant from the array
    localStorage.setItem('plants', JSON.stringify(plants)); // Save to localStorage
    updatePlantCount(); // Update the plant count
    displayPlants(); // Refresh the plant list
}

// Load data when the page is loaded
window.addEventListener('load', function() {
    if (document.getElementById('plantCount')) {
        updatePlantCount(); // Update the plant count in home.html
    }

    if (document.getElementById('plantList')) {
        displayPlants(); // Display the plants in plantdatabase.html
    }

    // Attach event listener to the plant form if in plantdatabase.html
    if (document.getElementById('plantForm')) {
        document.getElementById('plantForm').addEventListener('submit', addPlant);
    }
});
