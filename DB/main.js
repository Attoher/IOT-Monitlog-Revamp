function showLoader() {
    document.querySelector('.loader').style.display = 'block';
}

function hideLoader() {
    document.querySelector('.loader').style.display = 'none';
}

showLoader();
setTimeout(() => {
    hideLoader();
}, 1000);


const chartCtx = document.querySelector("#chart").getContext('2d');

fetch('./DB/DB.json')
    .then(response => response.json())
    .then(data => {
        new Chart(chartCtx, data);
    })
    .catch(error => console.error('Error loading chart data:', error));

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