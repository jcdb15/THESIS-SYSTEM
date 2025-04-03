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


// ----- charts -------

//-------Top selling plants-----	



//Notification start
document.addEventListener("DOMContentLoaded", function () {
	const notificationBtn = document.getElementById("notification-btn");
	const popup = document.getElementById("notification-popup");
	const closePopup = document.getElementById("close-popup");
	const readAllBtn = document.getElementById("read-all");
	const notificationCount = document.getElementById("notification-count");
	const notificationList = document.getElementById("notification-list");

	notificationBtn.addEventListener("click", function (event) {
		event.preventDefault();
		popup.style.display = popup.style.display === "block" ? "none" : "block";
	});

	closePopup.addEventListener("click", function () {
		popup.style.display = "none";
	});

	document.addEventListener("click", function (event) {
		if (!popup.contains(event.target) && event.target !== notificationBtn && event.target !== notificationBtn.querySelector('i')) {
			popup.style.display = "none";
		}
	});

	// Read All - Clear notifications
	readAllBtn.addEventListener("click", function () {
		notificationList.innerHTML = "<li>No new notifications</li>";
		notificationCount.textContent = "0";
		notificationCount.style.display = "none"; // Hide badge when empty
	});

	// Simulate new notifications (dynamic data)
	const newNotifications = [
		"🌿 New plant recommendation available",
		"🚀 Your plant database has been updated",
		"🔔 Weather alert: Check planting conditions"
	];

	setTimeout(() => {
		newNotifications.forEach(notification => {
			const li = document.createElement("li");
			li.textContent = notification;
			notificationList.appendChild(li);
		});

		// Update notification count
		notificationCount.textContent = parseInt(notificationCount.textContent) + newNotifications.length;
		notificationCount.style.display = "block"; // Show badge
	}, 3000); // Simulating new notifications after 3 seconds
});
//Notification end


