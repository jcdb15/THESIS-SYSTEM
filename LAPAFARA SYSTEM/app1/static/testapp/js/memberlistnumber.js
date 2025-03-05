document.addEventListener("DOMContentLoaded", function () {
    function updateMemberCount() {
        let tableBody = document.getElementById("memberTableBody");

        if (tableBody) {
            let memberCount = tableBody.getElementsByTagName("tr").length;
            localStorage.setItem("memberCount", memberCount);
        }
    }

    function displayMemberCount() {
        let storedCount = localStorage.getItem("memberCount");
        let memberCountElement = document.getElementById("memberCount");

        if (storedCount && memberCountElement) {
            memberCountElement.textContent = storedCount;
        }
    }

    // Run updateMemberCount when the table updates dynamically
    function observeTableChanges() {
        let tableBody = document.getElementById("memberTableBody");

        if (tableBody) {
            let observer = new MutationObserver(() => {
                updateMemberCount();
            });

            observer.observe(tableBody, { childList: true, subtree: true });
        }
    }

    // Execute on the right pages
    if (document.getElementById("memberTableBody")) {
        updateMemberCount();
        observeTableChanges(); // Start observing for new members
    }

    if (document.getElementById("memberCount")) {
        displayMemberCount();
    }
});

//TOP SELLING PLANTS START
var currentDate = new Date().toLocaleDateString(); // Get the current date

var barChartOptions = {
    series: [{ name: "", data: [] }], // Removed default series name
    chart: {
        type: "bar",
        height: 380
    },
    plotOptions: {
        bar: {
            barHeight: "100%",
            distributed: true,
            horizontal: true,
            dataLabels: {
                position: "bottom"
            },
        }
    },
    colors: ["#33b2df", "#546E7A", "#d4526e", "#13d8aa", "#A5978B", "#2b908f", "#f9a3a4", "#90ee7e", "#f48024", "#69d2e7"],
    dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: { colors: ["#fff"] },
        formatter: function (val, opt) {
            return opt.w.globals.labels[opt.dataPointIndex] + ": " + val;
        },
        offsetX: 0,
        dropShadow: { enabled: true }
    },
    stroke: {
        width: 1,
        colors: ["#fff"]
    },
    xaxis: {
        categories: []
    },
    yaxis: {
        labels: { show: false }
    },
    title: {
        text: "January - December",
        align: "center",
        floating: true
    },
    subtitle: {
        text: "Category of Crops",
        align: "center"
    },
    tooltip: {
        theme: "light",
        marker: {
            show: true
        },
        y: {
            formatter: function (val, { dataPointIndex, w }) {
                var currentDate = new Date().toLocaleDateString(); // Get the current date
                return `<span style="color: #000; font-weight: bold;">${val} Quantity</span><br><span style="color: gray;">Date: ${currentDate}</span>`;
            
            }
        }
    }
};

var barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
barChart.render();

function updateChart() {
    let plants = JSON.parse(localStorage.getItem("plants")) || [];

    plants.sort((a, b) => b.quantity - a.quantity);

    let plantNames = plants.map(plant => plant.name);
    let plantQuantities = plants.map(plant => plant.quantity);

    barChart.updateOptions({
        xaxis: { categories: plantNames },
        series: [{ name: "", data: plantQuantities }] // Removed series name
    });
}

updateChart();
window.addEventListener("storage", updateChart);


//TOP SELLING PLANTS END 
