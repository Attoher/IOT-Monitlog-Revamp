const chartContainer = document.querySelector("#chartContainer");

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

async function fetchData() {
    try {
        const response = await fetch('/data'); // Mengambil data dari server
        const data = await response.json(); // Parse data JSON dari server

        console.log('Fetched data:', data);

        const groupedData = data.reduce((acc, item) => {
            const measurement = item._measurement;
            const field = item._field;
            const sensorId = item.sensor_id;
            const label = `${measurement} ${field} ${sensorId}`;

            if (!acc[measurement]) {
                acc[measurement] = {};
            }
            if (!acc[measurement][field]) {
                acc[measurement][field] = {};
            }
            if (!acc[measurement][field][label]) {
                acc[measurement][field][label] = { labels: [], values: [] };
            }

            acc[measurement][field][label].labels.push(new Date(item._time).toLocaleString());
            acc[measurement][field][label].values.push(item._value);
            return acc;
        }, {});

        const staticColors = [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)'
        ];

        chartContainer.innerHTML = ''; // Clear previous charts

        Object.keys(groupedData).forEach((measurement) => {
            Object.keys(groupedData[measurement]).forEach((field) => {
                const canvas = document.createElement("canvas");
                canvas.id = "chart";
                chartContainer.appendChild(canvas);
                const chartCtx = canvas.getContext('2d');

                const datasets = Object.keys(groupedData[measurement][field]).map((label, index) => ({
                    label: label,
                    data: groupedData[measurement][field][label].values,
                    borderColor: staticColors[index % staticColors.length],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }));

                new Chart(chartCtx, {
                    type: 'line',
                    data: {
                        labels: groupedData[measurement][field][Object.keys(groupedData[measurement][field])[0]].labels,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Measurement: ${measurement}, Field: ${field}`, // Teks keterangan sesuai measurement dan field
                                font: {
                                    size: 18,  // Ukuran font
                                    weight: 'bold'
                                }
                            },
                            legend: {
                                position: 'top', // Posisi legend
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// Initial fetch to load all data
document.addEventListener("DOMContentLoaded", function() {
    fetchAllData().then(({ kelembapanData, suhuData, konsumsiListrikData }) => {
        console.log('Fetched all data on load:', { kelembapanData, suhuData, konsumsiListrikData });
        // Combine all data as needed and re-run chart creation
        renderChart([...kelembapanData, ...suhuData, ...konsumsiListrikData]);
    }).catch(error => {
        console.error('Error fetching all data on load:', error);
    });
});

// Function to handle data fetch for all data on button click
document.querySelector("#all-btn").addEventListener("click", function() {
    fetchAllData().then(({ kelembapanData, suhuData, konsumsiListrikData }) => {
        console.log('Fetched all data on button click:', { kelembapanData, suhuData, konsumsiListrikData });
        // Combine all data as needed and re-run chart creation
        renderChart([...kelembapanData, ...suhuData, ...konsumsiListrikData]);
    }).catch(error => {
        console.error('Error fetching all data on button click:', error);
    });
});

// Function to handle data fetch for kelembapan
document.querySelector("#kelembapan-btn").addEventListener("click", function() {
    fetch('/data/kelembapan')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched kelembapan data:', data);
            // Re-run chart creation with new data
            renderChart(data);
        });
});

// Function to handle data fetch for suhu
document.querySelector("#suhu-btn").addEventListener("click", function() {
    fetch('/data/suhu')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched suhu data:', data);
            // Re-run chart creation with new data
            renderChart(data);
        });
});

// Function to handle data fetch for konsumsi listrik
document.querySelector("#konsumsi-listrik-btn").addEventListener("click", function() {
    fetch('/data/konsumsiListrik') // This is the correct endpoint
        .then(response => response.json())
        .then(data => {
            console.log('Fetched konsumsi listrik data:', data);
            // Re-run chart creation with new data
            renderChart(data);
        });
});

// Function to render chart based on fetched data
function renderChart(data) {
    const groupedData = data.reduce((acc, item) => {
        const measurement = item._measurement;
        const field = item._field;
        const sensorId = item.sensor_id;
        const label = `${measurement} ${field} ${sensorId}`;

        if (!acc[measurement]) {
            acc[measurement] = {};
        }
        if (!acc[measurement][field]) {
            acc[measurement][field] = {};
        }
        if (!acc[measurement][field][label]) {
            acc[measurement][field][label] = { labels: [], values: [] };
        }

        acc[measurement][field][label].labels.push(new Date(item._time).toLocaleString());
        acc[measurement][field][label].values.push(item._value);
        return acc;
    }, {});

    const staticColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(153, 102, 255, 1)'
    ];

    chartContainer.innerHTML = ''; // Clear previous charts

    Object.keys(groupedData).forEach((measurement) => {
        Object.keys(groupedData[measurement]).forEach((field) => {
            const canvas = document.createElement("canvas");
            canvas.id = "chart";
            chartContainer.appendChild(canvas);
            const chartCtx = canvas.getContext('2d');

            const datasets = Object.keys(groupedData[measurement][field]).map((label, index) => ({
                label: label,
                data: groupedData[measurement][field][label].values,
                borderColor: staticColors[index % staticColors.length],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }));

            new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: groupedData[measurement][field][Object.keys(groupedData[measurement][field])[0]].labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Measurement: ${measurement}, Field: ${field}`, // Teks keterangan sesuai measurement dan field
                            font: {
                                size: 18,  // Ukuran font
                                weight: 'bold'
                            }
                        },
                        legend: {
                            position: 'top', // Posisi legend
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });
    });
}
