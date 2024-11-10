document.addEventListener("DOMContentLoaded", function () {
    const chartContainer = document.querySelector("#chartContainer");
    let currentChartType = 'bar'; // Default chart type
    let currentDataType = ''; // Default data type (no data displayed initially)

    // Fetch data for all measurements
    async function fetchAllData() {
        try {
            const kelembapanResponse = await fetch('/data/kelembapan');
            const suhuResponse = await fetch('/data/suhu');
            const konsumsiListrikResponse = await fetch('/data/konsumsiListrik');

            const kelembapanData = await kelembapanResponse.json();
            const suhuData = await suhuResponse.json();
            const konsumsiListrikData = await konsumsiListrikResponse.json();

            return { kelembapanData, suhuData, konsumsiListrikData };
        } catch (error) {
            console.error('Error fetching all data:', error);
        }
    }

    // Event listeners for chart buttons
    document.querySelector("#line-chart-btn").addEventListener("click", function () {
        currentChartType = 'line';
        fetchDataAndRender();
    });

    document.querySelector("#bar-chart-btn").addEventListener("click", function () {
        currentChartType = 'bar';
        fetchDataAndRender();
    });

    document.querySelector("#pie-chart-btn").addEventListener("click", function () {
        currentChartType = 'pie';
        fetchDataAndRender();
    });

    // Event listeners for toggle data buttons
    document.querySelector("#all-btn").addEventListener("click", function () {
        currentDataType = ''; // All data selected
        fetchDataAndRender();
    });

    document.querySelector("#kelembapan-btn").addEventListener("click", function () {
        currentDataType = 'kelembapan'; // Set to kelembapan data
        fetchDataAndRender();
    });

    document.querySelector("#suhu-btn").addEventListener("click", function () {
        currentDataType = 'suhu'; // Set to suhu data
        fetchDataAndRender();
    });

    document.querySelector("#konsumsi-listrik-btn").addEventListener("click", function () {
        currentDataType = 'konsumsiListrik'; // Set to konsumsiListrik data
        fetchDataAndRender();
    });

    // Fetch data and render the chart based on current selection
    function fetchDataAndRender() {
        fetchAllData().then(({ kelembapanData, suhuData, konsumsiListrikData }) => {
            let dataToRender = [];
            if (currentDataType === 'kelembapan') {
                dataToRender = kelembapanData;
            } else if (currentDataType === 'suhu') {
                dataToRender = suhuData;
            } else if (currentDataType === 'konsumsiListrik') {
                dataToRender = konsumsiListrikData;
            } else {
                // Default to all data
                dataToRender = [...kelembapanData, ...suhuData, ...konsumsiListrikData];
            }
            renderChart(dataToRender);
        });
    }

    // Function to render the chart
    function renderChart(data) {
        // Clear previous charts
        chartContainer.innerHTML = '';

        if (data.length === 0) {
            // If no data is selected, show a message
            chartContainer.innerHTML = "<p>Please select a chart type and data to view.</p>";
            return;
        }

        const groupedData = data.reduce((acc, item) => {
            const measurement = item._measurement;
            const field = item._field;
            const sensorId = item.sensor_id;
            const label = `${measurement} ${field} ${sensorId}`;
    
            if (!acc[measurement]) acc[measurement] = {};
            if (!acc[measurement][field]) acc[measurement][field] = {};
            if (!acc[measurement][field][label]) acc[measurement][field][label] = { labels: [], values: [] };
    
            acc[measurement][field][label].labels.push(new Date(item._time).toLocaleString());
            acc[measurement][field][label].values.push(item._value);
            return acc;
        }, {});
    
        // Random color generator for charts
        function getRandomColor() {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgba(${r}, ${g}, ${b}, 1)`;
        }
    
        // Render the charts
        Object.keys(groupedData).forEach((measurement) => {
            Object.keys(groupedData[measurement]).forEach((field) => {
                const canvas = document.createElement("canvas");
                canvas.id = "chart";
                chartContainer.appendChild(canvas);
    
                // Resize canvas to 50% smaller
                canvas.width = window.innerWidth * 0.5; // 50% width of the screen width
                canvas.height = 300; // or adjust the height as needed
    
                // Center the pie chart
                if (currentChartType === 'pie') {
                    canvas.style.margin = '0 auto';
                    canvas.style.display = 'block';
                }
    
                const chartCtx = canvas.getContext('2d');
    
                const datasets = Object.keys(groupedData[measurement][field]).map((label) => ({
                    label: label,
                    data: groupedData[measurement][field][label].values,
                    borderColor: getRandomColor(),
                    backgroundColor: currentChartType === 'pie' 
                        ? getRandomColor() // Pie chart color setting
                        : getRandomColor(),
                    borderWidth: 1
                }));

                // If pie chart, use 'time' field for labels
                const labels = currentChartType === 'pie' 
                    ? groupedData[measurement][field][Object.keys(groupedData[measurement][field])[0]].labels
                    : groupedData[measurement][field][Object.keys(groupedData[measurement][field])[0]].labels;

                new Chart(chartCtx, {
                    type: currentChartType,
                    data: {
                        labels: labels, // Time for pie chart
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Measurement: ${measurement}, Field: ${field}`,
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
                const br = document.createElement("br");
                chartContainer.appendChild(br);
            });
        });
    }

});
