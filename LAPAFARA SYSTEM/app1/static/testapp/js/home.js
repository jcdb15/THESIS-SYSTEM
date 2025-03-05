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

//-------Top seeling plants-----	

  //-----areaChart forecast-----

  var areaChartoptions = {
	series: [{
	name: 'Sales',
	data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5]
  }],
	chart: {
	height: 350,
	type: 'line',
  },
  forecastDataPoints: {
	count: 7
  },
  stroke: {
	width: 5,
	curve: 'smooth'
  },
  xaxis: {
	type: 'datetime',
	categories: ['1/11/2000', '2/11/2000', '3/11/2000', '4/11/2000', '5/11/2000', '6/11/2000', '7/11/2000', '8/11/2000', '9/11/2000', '10/11/2000', '11/11/2000', '12/11/2000', '1/11/2001', '2/11/2001', '3/11/2001','4/11/2001' ,'5/11/2001' ,'6/11/2001'],
	tickAmount: 10,
	labels: {
	  formatter: function(value, timestamp, opts) {
		return opts.dateFormatter(new Date(timestamp), 'dd MMM')
	  }
	}
  },
  title: {
	text: 'Forecast',
	align: 'left',
	style: {
	  fontSize: "16px",
	  color: '#666'
	}
  },
  fill: {
	type: 'gradient',
	gradient: {
	  shade: 'dark',
	  gradientToColors: [ '#FDD835'],
	  shadeIntensity: 1,
	  type: 'horizontal',
	  opacityFrom: 1,
	  opacityTo: 1,
	  stops: [0, 100, 100, 100]
	},
  }
  };

  var areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartoptions);
  areaChart.render();


//load new user start
var socket = new WebSocket("ws://" + window.location.host + "/ws/accounts/");
socket.onmessage = function(event) {
	location.reload();  // Refresh page on new user creation
};  

var initialUserCount = 0;

function checkForNewUser() {
	fetch("/check_new_user/")
		.then(response => response.json())
		.then(data => {
			if (initialUserCount !== 0 && data.user_count > initialUserCount) {
				location.reload();
			}
			initialUserCount = data.user_count;
		});
}

setInterval(checkForNewUser, 5000);  // Check every 5 seconds


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


