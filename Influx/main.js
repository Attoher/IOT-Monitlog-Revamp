const chart = document.querySelector("#chart").getContext('2d');

new Chart(chart, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [
            {
                label: 'AC 1',
                data: [29374, 33537, 49631, 59095, 57828, 36684, 33572, 39974, 48847, 48116, 61004],
                borderColor: 'red',
                borderWidth: 2
            },
            {
                label: 'AC 2',
                data: [31500, 41000, 88800, 26000, 46000, 32698, 5000, 3000, 18656, 24832, 36844],
                borderColor: 'blue',
                borderWidth: 2
            },
            {
                label: 'AC 3',
                data: [41000, 52000, 63000, 74000, 85000, 96000, 107000, 118000, 129000, 140000, 150000], // Unique data points
                borderColor: 'green',
                borderWidth: 2
            },
            {
                label: 'AC 4',
                data: [20000, 25000, 40000, 30000, 50000, 60000, 70000, 80000, 90000, 100000, 110000], // Unique data points
                borderColor: 'orange',
                borderWidth: 2
            },
            {
                label: 'AC 5',
                data: [15000, 32000, 54000, 76000, 98000, 120000, 145000, 170000, 195000, 220000, 250000], // Unique data points
                borderColor: 'purple',
                borderWidth: 2
            }
        ]
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



const menuBtn = document.querySelector('#menu-btn');
const closeBtn = document.querySelector('#close-btn');
const sideBar = document.querySelector('aside');

menuBtn.addEventListener('click', () => {
    sideBar.style.display = 'block';
})

closeBtn.addEventListener('click', () => {
    sideBar.style.display = 'none';
})

const themeBtn = document.querySelector('.theme-btn');

themeBtn.addEventListener ('click', () => {
    document.body.classList.toggle('dark-theme');
    themeBtn.querySelector('span:first-child').classList.toggle('active')
    ;
    themeBtn.querySelector('span:last-child').classList.toggle('active');
})