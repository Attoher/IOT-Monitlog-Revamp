document.addEventListener("DOMContentLoaded", function () {
    const chartContainer = document.querySelector("#chartContainer");
    const pageStatus = document.querySelector("#pageStatus");
    const prevBtn = document.querySelector("#prev-chart-btn");
    const nextBtn = document.querySelector("#next-chart-btn");
    let currentChartType = 'bar';
    let currentDataType = '';
    let currentChartIndex = 0;
    let charts = []; // Array to store rendered charts
  
    // Update initial button state to use opacity
    prevBtn.style.opacity = "0.5";
    prevBtn.style.cursor = "not-allowed";
    nextBtn.style.opacity = "0.5";
    nextBtn.style.cursor = "not-allowed";

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
        prevBtn.style.opacity = "0.5";
        prevBtn.style.cursor = "not-allowed";
        nextBtn.style.opacity = "0.5";
        nextBtn.style.cursor = "not-allowed";
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
        // Sort data by timestamp first
        data.sort((a, b) => new Date(a._time) - new Date(b._time));

        const groupedData = (Array.isArray(data) ? data : [data]).reduce((acc, item) => {
            const type = item._measurement || 'unknown';
            const field = item._field || 'value';
            const sensorId = item.sensor_id || 'value';
            // Create label with padded sensor ID for proper numerical sorting
            const label = `${type} ${String(sensorId).padStart(3, '0')}`;
    
            if (!acc[type]) acc[type] = {};
            if (!acc[type][field]) acc[type][field] = {};
            if (!acc[type][field][label]) {
                acc[type][field][label] = { labels: [], values: [] };
            }
    
            const timestamp = new Date(item._time).toLocaleString();
            const value = parseFloat(item._value || 0);
    
            if (!isNaN(value)) {
                // Insert timestamp and value in sorted order
                const insertIndex = acc[type][field][label].labels.findIndex(
                    existingTime => new Date(existingTime) > new Date(timestamp)
                );
                
                if (insertIndex === -1) {
                    acc[type][field][label].labels.push(timestamp);
                    acc[type][field][label].values.push(value);
                } else {
                    acc[type][field][label].labels.splice(insertIndex, 0, timestamp);
                    acc[type][field][label].values.splice(insertIndex, 0, value);
                }
            }
    
            return acc;
        }, {});
    
        // Sort by sensor ID within each measurement type
        Object.keys(groupedData).forEach((type) => {
            Object.keys(groupedData[type]).forEach((field) => {
                // Convert object to array and sort by sensor ID
                const sortedLabels = Object.keys(groupedData[type][field]).sort((a, b) => {
                    const sensorA = parseInt(a.split(' ')[1]);
                    const sensorB = parseInt(b.split(' ')[1]);
                    return sensorA - sensorB;
                });

                // Create new object with sorted labels
                const sortedData = {};
                sortedLabels.forEach(label => {
                    sortedData[label] = groupedData[type][field][label];
                });
                groupedData[type][field] = sortedData;
            });
        });
    
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
    
                // Create datasets with sorted labels
                const datasets = Object.keys(groupedData[type][field]).map((label) => ({
                    label: label.replace(/\b(\d+)\b/g, match => parseInt(match)), // Remove padding from display
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
                nextBtn.style.opacity = "1";
                nextBtn.style.cursor = "pointer";
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
            prevBtn.style.opacity = "1";
            prevBtn.style.cursor = "pointer";
            
            if (currentChartIndex === charts.length - 1) {
                nextBtn.style.opacity = "0.5";
                nextBtn.style.cursor = "not-allowed";
            }
        }
    });
  
    prevBtn.addEventListener("click", function () {
        if (currentChartIndex > 0) {
            currentChartIndex--;
            displayChartAtIndex(currentChartIndex);
            pageStatus.innerHTML = `Page: ${currentChartIndex + 1} of ${charts.length}`;
            nextBtn.style.opacity = "1";
            nextBtn.style.cursor = "pointer";
            
            if (currentChartIndex === 0) {
                prevBtn.style.opacity = "0.5";
                prevBtn.style.cursor = "not-allowed";
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