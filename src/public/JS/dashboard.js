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


// Fungsi untuk mem-fetch data dari InfluxDB
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
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function updateDashboard(suhuData, kelembapanData, konsumsiListrikData) {
  console.log("Suhu Data:", suhuData);
  console.log("Kelembapan Data:", kelembapanData);
  console.log("Konsumsi Listrik Data:", konsumsiListrikData);

  const suhuElement = document.querySelector("#temp-value");
  const kelembapanElement = document.querySelector("#humidity-value");
  const konsumsiListrikElement = document.querySelector("#power-value");
  
  const suhuStatus = document.querySelector(".card:nth-child(1) .status");
  const kelembapanStatus = document.querySelector(".card:nth-child(2) .status");

  // Extract values from the sensor data
  const suhu = suhuData?.[0]?.value ?? "N/A";
  const kelembapan = kelembapanData?.[0]?.value ?? "N/A";
  const konsumsiListrik = konsumsiListrikData?.[0]?.value ?? "N/A";

  // Update display values
  suhuElement.textContent = `${suhu} °C`;
  kelembapanElement.textContent = `${kelembapan} %`;
  konsumsiListrikElement.textContent = `${konsumsiListrik} V`;

  // Update status indicators based on values
  updateSuhuStatus(suhu, suhuStatus);
  updateKelembapanStatus(kelembapan, kelembapanStatus);
}

function updateSuhuStatus(suhu, statusElement) {
  if (suhu === "N/A") {
    statusElement.className = 'status';
    statusElement.innerHTML = 'No Data <span class="indicator"></span>';
    return;
  }

  const suhuValue = parseFloat(suhu);
  if (suhuValue > 30) {
    statusElement.className = 'status panas';
    statusElement.innerHTML = 'Panas <span class="indicator red"></span>';
  } else if (suhuValue < 20) {
    statusElement.className = 'status dingin';
    statusElement.innerHTML = 'Dingin <span class="indicator blue"></span>';
  } else {
    statusElement.className = 'status aman';
    statusElement.innerHTML = 'Normal <span class="indicator green"></span>';
  }
}

function updateKelembapanStatus(kelembapan, statusElement) {
  if (kelembapan === "N/A") {
    statusElement.className = 'status';
    statusElement.innerHTML = 'No Data <span class="indicator"></span>';
    return;
  }

  const kelembapanValue = parseFloat(kelembapan);
  if (kelembapanValue > 70) {
    statusElement.className = 'status bahaya';
    statusElement.innerHTML = 'Terlalu Lembab <span class="indicator red"></span>';
  } else if (kelembapanValue < 30) {
    statusElement.className = 'status bahaya';
    statusElement.innerHTML = 'Terlalu Kering <span class="indicator red"></span>';
  } else {
    statusElement.className = 'status aman';
    statusElement.innerHTML = 'Normal <span class="indicator green"></span>';
  }
}

// Auto-refresh data every 5 seconds
setInterval(fetchDataFromMongoDB, 5000);

// Panggil fetchDataFromMongoDB pertama kali saat halaman dimuat
fetchDataFromMongoDB();
