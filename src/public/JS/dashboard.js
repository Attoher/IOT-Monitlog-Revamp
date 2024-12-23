document.addEventListener('DOMContentLoaded', () => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const usernameDisplay = document.getElementById('username-display');
    
    if (userData && userData.username) {
        usernameDisplay.textContent = userData.username;
    } else {
        // Redirect to login if no user data
        window.location.href = '0login.html';
    }
  });
  
  const API_URLS = {
    suhu: "/api/sensors/temperature/latest",
    kelembapan: "/api/sensors/humidity/latest", 
    konsumsiListrik: "/api/sensors/power/latest"
  };
  
  let currentSensorIndex = 0;
  let sensorIds = [];
  
  // Fungsi untuk mem-fetch data dari semua endpoint
  async function fetchDataFromMongoDB() {
    try {
      const [suhuResponse, kelembapanResponse, konsumsiListrikResponse] = await Promise.all([
        fetch(API_URLS.suhu).catch(() => null),
        fetch(API_URLS.kelembapan).catch(() => null),
        fetch(API_URLS.konsumsiListrik).catch(() => null),
      ]);
  
      const suhuData = suhuResponse ? await suhuResponse.json() : [];
      const kelembapanData = kelembapanResponse ? await kelembapanResponse.json() : [];
      const konsumsiListrikData = konsumsiListrikResponse ? await konsumsiListrikResponse.json() : [];
  
      updateDashboard(suhuData, kelembapanData, konsumsiListrikData);
      updateNavigationButtons();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  
  function updateDashboard(suhuData, kelembapanData, konsumsiListrikData) {
    console.log("Suhu Data:", suhuData);
    console.log("Kelembapan Data:", kelembapanData);
    console.log("Konsumsi Listrik Data:", konsumsiListrikData);
  
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.innerHTML = ''; // Clear existing content
  
    const measurements = ['AC', 'Fridge', 'Room'];
    sensorIds = [...new Set([
        ...suhuData.map(d => d.sensor_id),
        ...kelembapanData.map(d => d.sensor_id),
        ...konsumsiListrikData.map(d => d.sensor_id)
    ])].sort((a, b) => parseInt(a) - parseInt(b)); // Numeric sorting
  
    // Update page status
    const pageStatus = document.getElementById('pageStatus');
    pageStatus.textContent = `Sensor ${currentSensorIndex + 1} of ${sensorIds.length}`;
  
    // Show only current sensor
    const currentSensorId = sensorIds[currentSensorIndex];
    
    const sensorSection = document.createElement('div');
    sensorSection.className = 'sensor-group';
    sensorSection.innerHTML = `<h2>Sensor ID: ${currentSensorId}</h2><br>`;
  
    measurements.forEach(measurement => {
        // Create content div wrapper
        const contentWrapper = document.createElement('div');
        
        // Create content section
        const section = document.createElement('div');
        section.className = 'content';
        
        // Special handling for Room measurements
        let suhuValue, kelembapanValue, konsumsiValue;
        
        if (measurement === 'Room') {
            // Find values from specific Room measurements
            suhuValue = suhuData.find(d => 
                d.measurement === 'RoomTemperature' && 
                d.sensor_id === currentSensorId
            )?.value ?? 'N/A';
            
            kelembapanValue = kelembapanData.find(d => 
                d.measurement === 'RoomHumidity' && 
                d.sensor_id === currentSensorId
            )?.value ?? 'N/A';
            
            konsumsiValue = konsumsiListrikData.find(d => 
                d.measurement === 'RoomCensor' && 
                d.sensor_id === currentSensorId
            )?.value ?? 'N/A';
        } else {
            // Normal handling for AC and Fridge
            suhuValue = suhuData.find(d => 
                d.measurement === measurement && 
                d.sensor_id === currentSensorId
            )?.value ?? 'N/A';
            
            kelembapanValue = kelembapanData.find(d => 
                d.measurement === measurement && 
                d.sensor_id === currentSensorId
            )?.value ?? 'N/A';
            
            konsumsiValue = konsumsiListrikData.find(d => 
                d.measurement === measurement && 
                d.sensor_id === currentSensorId
            )?.value ?? 'N/A';
        }
  
        section.innerHTML = `
            <div class="card">
                <div class="info">
                    <h2>${suhuValue} °C</h2>
                    <h2>${measurement}</h2>
                    <h3>Temperature</h3>
                    <img src="images/Temp.png" alt="Temperature" class="icon">
                </div>
                <p class="status" id="status-temp-${measurement.toLowerCase()}-${currentSensorId}">
                    Mengecek... <span class="indicator"></span>
                </p>
            </div>
            <div class="card">
                <div class="info">
                    <h2>${kelembapanValue} %</h2>
                    <h2>${measurement}</h2>
                    <h3>Humidity</h3>
                    <img src="images/humidity.jpg" alt="Humidity" class="icon">
                </div>
                <p class="status" id="status-humidity-${measurement.toLowerCase()}-${currentSensorId}">
                    Mengecek... <span class="indicator"></span>
                </p>
            </div>
            <div class="card">
                <div class="info">
                    <h2>${konsumsiValue} V</h2>
                    <h2>${measurement}</h2>
                    <h3>Power</h3>
                    <img src="images/power.jpg" alt="Power" class="icon">
                </div>
            </div>
        `;
  
        sensorSection.appendChild(section);
        // Add line break after content
        const br = document.createElement('br');
        sensorSection.appendChild(br);
  
        // Update status indicators
        if (suhuValue !== 'N/A') {
            updateTemperatureStatus(suhuValue, measurement, currentSensorId);
        }
        if (kelembapanValue !== 'N/A') {
            updateHumidityStatus(kelembapanValue, measurement, currentSensorId);
        }
    });
  
    dashboardContent.appendChild(sensorSection);
    dashboardContent.appendChild(document.createElement('br'));
  }
  
  function getIcon(measurement) {
    const icons = {
        'AC': 'AC.png',
        'FRIDGE': 'Fridge.jpg',
        'ROOM': 'Temp.jpg'
    };
    return icons[measurement.toUpperCase()] || 'Temp.png';
  }
  
  function updateTemperatureStatus(value, measurement, sensorId) {
    const statusElement = document.getElementById(`status-temp-${measurement.toLowerCase()}-${sensorId}`);
    if (!statusElement) return;
  
    if (value === 'N/A') {
        setStatus(statusElement, 'No Data');
        return;
    }
  
    const tempValue = parseFloat(value);
    const thresholds = {
        'AC': { high: 25, low: 18 },
        'FRIDGE': { high: 5, low: 0 },
        'ROOM': { high: 28, low: 20 }
    };
  
    const threshold = thresholds[measurement];
    if (tempValue > threshold.high) {
        setStatus(statusElement, 'Terlalu Panas', 'red');
    } else if (tempValue < threshold.low) {
        setStatus(statusElement, 'Terlalu Dingin', 'blue');
    } else {
        setStatus(statusElement, 'Normal', 'green');
    }
  }
  
  function updateHumidityStatus(value, measurement, sensorId) {
    const statusElement = document.getElementById(`status-humidity-${measurement.toLowerCase()}-${sensorId}`);
    if (!statusElement) return;
  
    if (value === 'N/A') {
        setStatus(statusElement, 'No Data');
        return;
    }
  
    const humidityValue = parseFloat(value);
    if (humidityValue > 70) {
        setStatus(statusElement, 'Terlalu Lembab', 'red');
    } else if (humidityValue < 30) {
        setStatus(statusElement, 'Terlalu Kering', 'red');
    } else {
        setStatus(statusElement, 'Normal', 'green');
    }
  }
  
  function setStatus(element, status, color) {
    element.innerHTML = `${status} <span class="indicator ${color || ''}"></span>`;
  }
  
  // Add navigation button handlers
  document.getElementById('prev-chart-btn').addEventListener('click', () => {
    if (currentSensorIndex > 0) {
        currentSensorIndex--;
        fetchDataFromMongoDB();
    }
  });
  
  document.getElementById('next-chart-btn').addEventListener('click', () => {
    if (currentSensorIndex < sensorIds.length - 1) {
        currentSensorIndex++;
        fetchDataFromMongoDB();
    }
  });
  
  // Update button visibility
  function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-chart-btn');
    const nextBtn = document.getElementById('next-chart-btn');
    
    if (currentSensorIndex === 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    if (currentSensorIndex === sensorIds.length - 1) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
  }
  
  // Auto-refresh data every 5 seconds
  setInterval(fetchDataFromMongoDB, 5000);
  
  // Panggil fetchDataFromMongoDB pertama kali saat halaman dimuat
  fetchDataFromMongoDB();
