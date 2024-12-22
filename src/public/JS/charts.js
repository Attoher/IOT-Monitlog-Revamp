document.addEventListener("DOMContentLoaded", function () {
    const chartContainer = document.querySelector("#chartContainer");
    const pageStatus = document.querySelector("#pageStatus");
    const prevBtn = document.querySelector("#prev-chart-btn");
    const nextBtn = document.querySelector("#next-chart-btn");
    let currentChartType = 'bar';
    let currentDataType = '';
    let currentChartIndex = 0;
    let charts = []; // Array to store rendered charts
  
    // Hide the Prev and Next buttons by default
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";

    async function fetchData(type) {
        try {
            // Map the type to the correct endpoint
            const endpoint = type === 'temperature' ? 'temperature' :
                            type === 'humidity' ? 'humidity' :
                            'power';
                            
            const response = await fetch(`/api/sensors/${endpoint}/history`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${type} data`);
            }
            const data = await response.json();
            // Add type information to each data point
            return data.map(item => ({
                ...item,
                sensorType: type
            }));
        } catch (error) {
            console.error(`Error in fetchData(${type}):`, error);
            throw error;
        }
    }
    
    async function fetchAllData() {
        try {
            const kelembapanData = await fetchData('humidity');
            const suhuData = await fetchData('temperature');
            const konsumsiListrikData = await fetchData('power');
            return { 
                kelembapanData, 
                suhuData, 
                konsumsiListrikData 
            };
        } catch (error) {
            console.error('Error in fetchAllData:', error);
            throw error;
        }
    }
    
  
    // Event listener for chart type buttons
    document.querySelector("#line-chart-btn").addEventListener("click", function () {
        currentChartType = 'line';
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender(); // Fetch and render chart with updated type and data
    });
  
    document.querySelector("#bar-chart-btn").addEventListener("click", function () {
        currentChartType = 'bar';
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender(); // Fetch and render chart with updated type and data
    });
  
    document.querySelector("#pie-chart-btn").addEventListener("click", function () {
        currentChartType = 'pie';
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender(); // Fetch and render chart with updated type and data
    });
  
    // Event listeners for data filters (All, Kelembapan, Suhu, Konsumsi Listrik)
    document.querySelector("#all-btn").addEventListener("click", function () {
        currentDataType = 'All'; // Set data type to 'All'
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender();
    });
  
    document.querySelector("#kelembapan-btn").addEventListener("click", function () {
        currentDataType = 'kelembapan'; // Filter by kelembapan
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender();
    });
  
    document.querySelector("#suhu-btn").addEventListener("click", function () {
        currentDataType = 'suhu'; // Filter by suhu
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender();
    });
  
    document.querySelector("#konsumsi-listrik-btn").addEventListener("click", function () {
        currentDataType = 'konsumsiListrik'; // Filter by konsumsi listrik
        resetChartNavigation();  // Reset navigation (clear charts and reset pagination)
        fetchDataAndRender();
    });
  
    // Reset chart navigation when changing filter
    function resetChartNavigation() {
        currentChartIndex = 0; // Start from the first page
        charts = []; // Clear previous charts
        chartContainer.innerHTML = ''; // Clear the chart container
        prevBtn.style.display = "none"; // Hide prev button
        nextBtn.style.display = "none"; // Hide next button
    }
  
    // Fetch data and render the chart
    function fetchDataAndRender() {
        fetchAllData()
            .then(({ kelembapanData, suhuData, konsumsiListrikData }) => {
                let dataToRender = [];
                if (currentDataType === 'kelembapan') {
                    dataToRender = kelembapanData;
                } else if (currentDataType === 'suhu') {
                    dataToRender = suhuData;
                } else if (currentDataType === 'konsumsiListrik') {
                    dataToRender = konsumsiListrikData;
                } else if (currentDataType === 'All') {
                    dataToRender = [...kelembapanData, ...suhuData, ...konsumsiListrikData];
                }
    
                if (dataToRender.length === 0) {
                    chartContainer.innerHTML = "<h2>No data available for the selected type.</h2>";
                    pageStatus.innerHTML = `(No data to display)`;
                    return;
                }
    
                renderChart(dataToRender);
            })
            .catch((error) => {
                console.error('Error fetching data:', error); // Tambahkan logging error
                chartContainer.innerHTML = "<h2>Error loading data.</h2>";
                pageStatus.innerHTML = `(Error occurred while fetching data)`;
            });
    }
    
  
    // Render the chart
    function renderChart(data) {
        const groupedData = (Array.isArray(data) ? data : [data]).reduce((acc, item) => {
            const type = item._measurement || 'unknown';
            const field = item._field || 'value';
            const sensorId = item.sensor_id || 'value';
            const label = `${type} ${field} ${sensorId}`;
    
            if (!acc[type]) acc[type] = {};
            if (!acc[type][field]) acc[type][field] = {};
            if (!acc[type][field][label]) {
                acc[type][field][label] = { labels: [], values: [] };
            }
    
            const timestamp = new Date(item._time).toLocaleString();
            const value = parseFloat(item._value || item._value || 0);
    
            if (!isNaN(value)) {
                acc[type][field][label].labels.push(timestamp);
                acc[type][field][label].values.push(value);
            }
    
            return acc;
        }, {});
    
        // Random color generator for charts
        function getRandomColor() {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgba(${r}, ${g}, ${b}, 1)`;
        }
    
        // Clear chart container before rendering
        const chartContainer = document.querySelector("#chartContainer");
        chartContainer.innerHTML = '';
    
        // Render the charts
        Object.keys(groupedData).forEach((type) => {
            Object.keys(groupedData[type]).forEach((field) => {
                const canvas = document.createElement("canvas");
                canvas.id = `chart`;
                chartContainer.appendChild(canvas);
    
                const chartCtx = canvas.getContext('2d');
    
                const datasets = Object.keys(groupedData[type][field]).map((label) => ({
                    label: label,
                    data: groupedData[type][field][label].values,
                    borderColor: getRandomColor(),
                    backgroundColor: currentChartType === 'pie' 
                        ? getRandomColor()
                        : getRandomColor(),
                    borderWidth: 1
                }));
    
                const labels = groupedData[type][field][Object.keys(groupedData[type][field])[0]].labels;
    
                const chart = new Chart(chartCtx, {
                    type: currentChartType,
                    data: {
                        labels: labels,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Measurement: ${type}, Field: ${field}`,
                                font: {
                                    size: 18,
                                    weight: 'bold'
                                }
                            },
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: currentChartType !== 'pie' ? {
                            y: {
                                beginAtZero: true
                            }
                        } : {}
                    }
                });
    
                // Save chart for navigation
                charts.push(chart);
            });
        });
    
        // Show the first chart and navigation buttons if needed
        if (charts.length > 0) {
            displayChartAtIndex(0);
            pageStatus.innerHTML = `Page: 1 of ${charts.length}`;
            if (charts.length > 1) {
                nextBtn.style.display = "inline-block"; // Show Next button if there is more than one chart
            }
        } else {
            pageStatus.innerHTML = "No data available";
        }
    }
  
    // Display the chart based on index
    function displayChartAtIndex(index) {
        charts.forEach((chart, i) => {
            chart.canvas.style.display = (i === index) ? 'block' : 'none';
        });
    }
  
    // Navigation buttons
    nextBtn.addEventListener("click", function () {
        if (currentChartIndex < charts.length - 1) {
            currentChartIndex++;
            displayChartAtIndex(currentChartIndex);
            pageStatus.innerHTML = `Page: ${currentChartIndex + 1} of ${charts.length}`;
            prevBtn.style.display = "inline-block"; // Show prev button when possible
            if (currentChartIndex === charts.length - 1) {
                nextBtn.style.display = "none"; // Hide next button on the last chart
            }
        }
    });
  
    prevBtn.addEventListener("click", function () {
        if (currentChartIndex > 0) {
            currentChartIndex--;
            displayChartAtIndex(currentChartIndex);
            pageStatus.innerHTML = `Page: ${currentChartIndex + 1} of ${charts.length}`;
            nextBtn.style.display = "inline-block"; // Show next button when possible
            if (currentChartIndex === 0) {
                prevBtn.style.display = "none"; // Hide prev button on the first chart
            }
        }
    });
  
    // Arrow key navigation
    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
            prevBtn.click(); // Simulate the "Previous" button click
        } else if (e.key === "ArrowRight") {
            nextBtn.click(); // Simulate the "Next" button click
        }
    });
  
    // Initial data fetch and chart render
    fetchDataAndRender();
  
    // Add this helper function if not already present
    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }
});