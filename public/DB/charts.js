const chartContainer = document.querySelector("#chartContainer");

async function fetchData() {
    try {
        const response = await fetch('/data'); 
        const data = await response.json(); 

        console.log('Fetched data:', data); 

        const groupedData = data.reduce((acc, item) => {
            const measurement = item._measurement;
            const sensorId = item.sensor_id;
            const label = `${measurement} ${sensorId}`;

            if (!acc[measurement]) {
                acc[measurement] = {};
            }
            if (!acc[measurement][label]) {
                acc[measurement][label] = { labels: [], values: [] };
            }

            acc[measurement][label].labels.push(new Date(item._time).toLocaleString());
            acc[measurement][label].values.push(item._value);
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
            // Create a new canvas element with ID 'chart' for each measurement
            const canvas = document.createElement("canvas");
            canvas.id = "chart";
            chartContainer.appendChild(canvas);
            const chartCtx = canvas.getContext('2d');

            const datasets = Object.keys(groupedData[measurement]).map((label, index) => ({
                label: label,
                data: groupedData[measurement][label].values,
                borderColor: staticColors[index % staticColors.length],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }));

            new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: groupedData[measurement][Object.keys(groupedData[measurement])[0]].labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

fetchData();
