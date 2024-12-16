

document.addEventListener("DOMContentLoaded", function () {
  const chartContainer = document.querySelector("#chartContainer");
  const pageStatus = document.querySelector("#pageStatus");
  const prevBtn = document.querySelector("#prev-chart-btn");
  const nextBtn = document.querySelector("#next-chart-btn");
  let currentChartType = 'bar'; // Default chart type
  let currentDataType = ''; // Default data type is 'All' (no filter applied)
  let currentChartIndex = 0; // Index for the active chart
  let charts = []; // Array to store rendered charts

  // Hide the Prev and Next buttons by default
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";

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
          return { kelembapanData: [], suhuData: [], konsumsiListrikData: [] };  // Return empty arrays on error
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
      fetchAllData().then(({ kelembapanData, suhuData, konsumsiListrikData }) => {
          let dataToRender = [];
          if (currentDataType === 'kelembapan') {
              dataToRender = kelembapanData;
          } else if (currentDataType === 'suhu') {
              dataToRender = suhuData;
          } else if (currentDataType === 'konsumsiListrik') {
              dataToRender = konsumsiListrikData;
          } else if (currentDataType === 'All') {
              // If 'All' is selected, show all data
              dataToRender = [...kelembapanData, ...suhuData, ...konsumsiListrikData];
          }

          if (dataToRender.length === 0) {
              chartContainer.innerHTML = "<h2>No data available for the selected type.</h2>";
              pageStatus.innerHTML = `(No data to display)`;
              return;
          }

          renderChart(dataToRender);
      });
  }

  // Render the chart
    function renderChart(data) {
        const groupedData = data.reduce((acc, item) => {
            const measurementJ = item.measurement;  // Menggunakan measurement dari data
            const fieldJ = item.field;  // Menggunakan field dari data
            const sensorIdJ = item.sensorId;  // Menggunakan sensorId dari data
            const labelJ = `${measurementJ} ${fieldJ} ${sensorIdJ}`;

            if (!acc[measurementJ]) acc[measurementJ] = {};
            if (!acc[measurementJ][fieldJ]) acc[measurementJ][fieldJ] = {};
            if (!acc[measurementJ][fieldJ][labelJ]) {
                acc[measurementJ][fieldJ][labelJ] = { labels: [], values: [] };
            }

            acc[measurementJ][fieldJ][labelJ].labels.push(new Date(item.timestamp).toLocaleString());
            acc[measurementJ][fieldJ][labelJ].values.push(item.value);  // Menggunakan value dari data
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

                const chartCtx = canvas.getContext('2d');

                const datasets = Object.keys(groupedData[measurement][field]).map((label) => ({
                    label: label,
                    data: groupedData[measurement][field][label].values,
                    borderColor: getRandomColor(),
                    backgroundColor: currentChartType === 'pie' 
                        ? getRandomColor()
                        : getRandomColor(),
                    borderWidth: 1
                }));

                const labels = currentChartType === 'pie'
                    ? groupedData[measurement][field][Object.keys(groupedData[measurement][field])[0]].labels
                    : groupedData[measurement][field][Object.keys(groupedData[measurement][field])[0]].labels;

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
});
