// Show Loader
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


const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
} else {
    document.body.classList.remove('dark-theme');
}