const chartCtx = document.querySelector("#chart").getContext('2d');

fetch('./DB/DB.json')
    .then(response => response.json())
    .then(data => {
        new Chart(chartCtx, data);
    })
    .catch(error => console.error('Error loading chart data:', error));