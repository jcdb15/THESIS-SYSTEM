const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})


// Plant database start
let plants = JSON.parse(localStorage.getItem('plants')) || []; // Load plants from localStorage
let currentPage = 0;
const itemsPerPage = 3;
let editingIndex = null; // Track if editing

function saveToLocalStorage() {
	localStorage.setItem('plants', JSON.stringify(plants)); // Save plants to localStorage
}

function addPlant(e) {
    e.preventDefault();

    const name = document.getElementById('plantName').value;
    const type = document.getElementById('plantType').value;
    const care = document.getElementById('plantCare').value;
    const description = document.getElementById('plantDescription').value;
    const location = document.getElementById('plantLocation').value;
    const quantity = parseInt(document.getElementById('plantQuantity').value);
    const photoInput = document.getElementById('plantPhoto');
    const button = document.querySelector("#plantForm button");

    let photoURL = "";

    if (photoInput.files.length > 0) {
        const photo = photoInput.files[0];
        const reader = new FileReader();
        
        reader.onloadend = function () {
            photoURL = reader.result;  // The base64 string of the image

            const newPlant = { name, type, care, description, location, quantity, photoURL };

            if (editingIndex !== null) {
                plants[editingIndex] = newPlant;
                editingIndex = null;
                button.textContent = "Add Plant";  // Change button back to "Add Plant"
            } else {
                plants.push(newPlant);
            }

            saveToLocalStorage();
            document.getElementById('plantForm').reset();
            displayPlants();
        };

        reader.readAsDataURL(photo);  // Convert the image to base64
    } else if (editingIndex !== null) {
        photoURL = plants[editingIndex].photoURL;  // Keep the previous image if not changed
        const newPlant = { name, type, care, description, location, quantity, photoURL };

        plants[editingIndex] = newPlant;
        editingIndex = null;
        button.textContent = "Add Plant";  // Change button back to "Add Plant"
        saveToLocalStorage();
        displayPlants();
    }
}

function editPlant(index) {
const plant = plants[index];

document.getElementById('plantName').value = plant.name;
document.getElementById('plantType').value = plant.type;
document.getElementById('plantCare').value = plant.care;
document.getElementById('plantDescription').value = plant.description;
document.getElementById('plantLocation').value = plant.location;
document.getElementById('plantQuantity').value = plant.quantity;

editingIndex = index; // Set the editing index

const button = document.querySelector("#plantForm button");
button.textContent = "Save Plant"; // Change button text to "Save Plant"
}


function deletePlant(index) {
plants.splice(index, 1); // Remove the plant from the array
saveToLocalStorage(); // Save updated plants to localStorage
displayPlants(); // Refresh the list
}

function displayPlants() {
	const plantList = document.getElementById('plants');
	const prevButton = document.getElementById('prevButton');
	const nextButton = document.getElementById('nextButton');
	const paginationContainer = document.querySelector('.pagination-container');

	plantList.innerHTML = '';

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
			${plant.photoURL ? `<img src="${plant.photoURL}" alt="${plant.name}">` : ''}
			<div class="button-container">
				<button onclick="editPlant(${plants.indexOf(plant)})" class="edit-btn">Edit</button>
				<button onclick="deletePlant(${plants.indexOf(plant)})" class="delete-btn">Delete</button>
			</div>
		`;
		plantList.appendChild(plantItem);
	});

	paginationContainer.style.display = plants.length >= 4 ? 'flex' : 'none';
	prevButton.disabled = currentPage === 0;
	nextButton.disabled = end >= plants.length;
}

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

document.getElementById('plantForm').addEventListener('submit', addPlant);

displayPlants(); // Load plants on page load
// plant database end


