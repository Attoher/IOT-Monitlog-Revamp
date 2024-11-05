const chartCtx = document.querySelector("#chart").getContext('2d');

async function fetchData() {
    try {
        const response = await fetch('/data'); 
        const data = await response.json(); 

        console.log('Fetched data:', data); 

        
        const groupedData = data.reduce((acc, item) => {
            const sensorId = item.sensor_id; 
            const measurement = item._measurement; 
            const label = `${measurement} ${sensorId}`; 
            
            if (!acc[label]) {
                acc[label] = { labels: [], values: [] }; 
            }
            acc[label].labels.push(new Date(item._time).toLocaleString()); 
            acc[label].values.push(item._value); 
            return acc;
        }, {});

        
        const staticColors = [
            'rgba(75, 192, 192, 1)',  
            'rgba(255, 99, 132, 1)', 
            'rgba(255, 206, 86, 1)', 
            'rgba(54, 162, 235, 1)', 
            'rgba(153, 102, 255, 1)'  
            
        ];

        
        const datasets = Object.keys(groupedData).map((label, index) => ({
            label: label, 
            data: groupedData[label].values,
            borderColor: staticColors[index % staticColors.length], 
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        }));

        
        new Chart(chartCtx, {
            type: 'line', 
            data: {
                labels: groupedData[Object.keys(groupedData)[0]].labels, 
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

    } catch (error) {
        console.error('Error loading chart data:', error); 
    }
}

fetchData();
