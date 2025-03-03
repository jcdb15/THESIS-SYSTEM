// Function to handle adding a new plant
function addPlant(event) {
    event.preventDefault();

    const plantName = document.getElementById('plantName').value;
    const plantType = document.getElementById('plantType').value;
    const plantCare = document.getElementById('plantCare').value;
    const plantDescription = document.getElementById('plantDescription').value;
    const plantLocation = document.getElementById('plantLocation').value;
    const plantPhoto = document.getElementById('plantPhoto').files[0];
    const plantQuantity = document.getElementById('plantQuantity').value;

    // Handle image as base64 (optional improvement)
    let plantPhotoBase64 = null;
    if (plantPhoto) {
        const reader = new FileReader();
        reader.onloadend = function() {
            plantPhotoBase64 = reader.result;
            storePlant(plantName, plantType, plantCare, plantDescription, plantLocation, plantPhotoBase64, plantQuantity);
        };
        reader.readAsDataURL(plantPhoto);  // Converts to base64
    } else {
        storePlant(plantName, plantType, plantCare, plantDescription, plantLocation, null, plantQuantity);
    }

    // Create the plant object
    const newPlant = {
        name: plantName,
        type: plantType,
        care: plantCare,
        description: plantDescription,
        location: plantLocation,
        photo: plantPhoto ? plantPhoto.name : null,
        quantity: plantQuantity
    };

    // Retrieve the existing plants from local storage, or initialize an empty array
    let plants = JSON.parse(localStorage.getItem('plants')) || [];

    // Add the new plant to the array
    plants.push(newPlant);

    // Save the updated plants array back to localStorage
    localStorage.setItem('plants', JSON.stringify(plants));

    // Reset the form
    document.getElementById('plantForm').reset();
    alert('Plant added successfully!');
}

// Function to populate the plant select dropdown
function populatePlantSelect() {
    const plants = JSON.parse(localStorage.getItem('plants')) || [];
    const plantSelect = document.getElementById('plantSelect');

    // Clear the current options
    plantSelect.innerHTML = '<option value="" disabled selected>Select a plant type</option>';

    // Add each plant to the dropdown
    plants.forEach(plant => {
        const option = document.createElement('option');
        option.value = plant.name;
        option.textContent = plant.name;
        plantSelect.appendChild(option);
    });
}

// Check if we're on the correct page and set up the event listener
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('plantForm')) {
        if (document.getElementById('plantName')) {
            // On the plant database page (plantdatabase.html)
            document.getElementById('plantForm').addEventListener('submit', addPlant);
        } else if (document.getElementById('plantSelect')) {
            // On the plant growth page (plantdgrowth.html)
            populatePlantSelect();
        }
    }
});
