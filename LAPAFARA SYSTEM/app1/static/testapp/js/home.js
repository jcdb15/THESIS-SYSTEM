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

//-------BAR CHARTS-data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]-----
	
var barChartoptions = {
	series: [{
	data: [1380, 1200, 540, 690, 600, 900, 750, 1100, 390, 700]
  }],
	chart: {
	type: 'bar',
	height: 380
  },
  plotOptions: {
	bar: {
	  barHeight: '100%',
	  distributed: true,
	  horizontal: true,
	  dataLabels: {
		position: 'bottom'
	  },
	}
  },
  colors: ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#2b908f', '#f9a3a4', '#90ee7e',
	'#f48024', '#69d2e7'
  ],
  dataLabels: {
	enabled: true,
	textAnchor: 'start',
	style: {
	  colors: ['#fff']
	},
	formatter: function (val, opt) {
	  return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
	},
	offsetX: 0,
	dropShadow: {
	  enabled: true
	}
  },
  stroke: {
	width: 1,
	colors: ['#fff']
  },
  xaxis: {
	categories: ['Rice', 'Corn', 'Water Melon', 'String Beans', 'Eggplant', 'Chilli', 'Squash', 'Chinese Cabage', 'Okra', 'Bitter Gourd'
	],
  },
  yaxis: {
	labels: {
	  show: false
	}
  },
  title: {
	  text: 'January - December',
	  align: 'center',
	  floating: true
  },
  subtitle: {
	  text: 'Category of Crops',
	  align: 'center',
  },
  tooltip: {
	theme: 'dark',
	x: {
	  show: false
	},
	y: {
	  title: {
		formatter: function () {
		  return ''
		}
	  }
	}
  }
  };

  var barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartoptions);
  barChart.render();



  //------barchart---End----

  //-----areaChart-----

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

