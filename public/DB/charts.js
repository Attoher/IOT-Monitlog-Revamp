const chartCtx = document.querySelector("#chart").getContext('2d');

async function fetchData() {
    try {
        const response = await fetch('/data'); // Ambil data dari server
        const data = await response.json(); // Ubah response ke format JSON

        console.log('Fetched data:', data); // Debugging

        // Memisahkan data berdasarkan sensor_id
        const groupedData = data.reduce((acc, item) => {
            const sensorId = item.sensor_id; // Ambil sensor_id
            const measurement = item._measurement; // Ambil measurement
            const label = `${measurement} ${sensorId}`; // Gabungkan measurement dan sensor_id untuk label
            
            if (!acc[label]) {
                acc[label] = { labels: [], values: [] }; // Buat array jika belum ada
            }
            acc[label].labels.push(new Date(item._time).toLocaleString()); // Ambil waktu
            acc[label].values.push(item._value); // Ambil nilai
            return acc;
        }, {});

        // Definisikan warna statis untuk setiap dataset
        const staticColors = [
            'rgba(75, 192, 192, 1)', // Warna untuk sensor pertama
            'rgba(255, 99, 132, 1)', // Warna untuk sensor kedua
            'rgba(255, 206, 86, 1)', // Warna untuk sensor ketiga
            'rgba(54, 162, 235, 1)', // Warna untuk sensor keempat
            'rgba(153, 102, 255, 1)'  // Warna untuk sensor kelima
            // Tambahkan warna sesuai kebutuhan
        ];

        // Buat dataset untuk Chart.js
        const datasets = Object.keys(groupedData).map((label, index) => ({
            label: label, // Gunakan label yang telah dibuat
            data: groupedData[label].values,
            borderColor: staticColors[index % staticColors.length], // Gunakan warna statis
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        }));

        // Buat chart menggunakan Chart.js
        new Chart(chartCtx, {
            type: 'line', // Jenis chart (misalnya line)
            data: {
                labels: groupedData[Object.keys(groupedData)[0]].labels, // Ambil label dari sensor pertama
                datasets: datasets // Gunakan dataset yang telah dibuat
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
        console.error('Error loading chart data:', error); // Tangani error
    }
}

// Panggil fetchData untuk mengambil data dan membuat chart saat halaman dimuat
fetchData();
