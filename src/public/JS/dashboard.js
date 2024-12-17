const API_URLS = {
  suhu: "http://localhost:3000/data/suhu",
  kelembapan: "http://localhost:3000/data/kelembapan",
  konsumsiListrik: "http://localhost:3000/data/konsumsiListrik"
};


// Fungsi untuk mem-fetch data dari InfluxDB
// Fungsi untuk mem-fetch data dari semua endpoint
async function fetchDataFromInfluxDB() {
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

  const suhuElement = document.querySelector(".card:nth-child(1) .info h2");
  const kelembapanElement = document.querySelector(".card:nth-child(2) .info h2");
  const konsumsiListrikElement = document.querySelector(".card:nth-child(3) .info h2");

  const suhu = suhuData?.[0]?._value ?? "N/A";
  const kelembapan = kelembapanData?.[0]?._value ?? "N/A";
  const konsumsiListrik = konsumsiListrikData?.[0]?._value ?? "N/A";

  suhuElement.textContent = `${suhu} °C`;
  kelembapanElement.textContent = `${kelembapan} %`;
  konsumsiListrikElement.textContent = `${konsumsiListrik} V`;
}





// Panggil fetchDataFromInfluxDB pertama kali saat halaman dimuat
fetchDataFromInfluxDB();
