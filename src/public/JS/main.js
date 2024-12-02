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

// Sidebar Toggle
const menuBtn = document.querySelector('#menu-btn');
const closeBtn = document.querySelector('#close-btn');
const sideBar = document.querySelector('aside');

menuBtn.addEventListener('click', () => {
    sideBar.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideBar.style.display = 'none';
});

// Theme Toggle with Persistence (checkbox and theme-btn)
const themeBtn = document.querySelector('.theme-btn');
const themeSwitch = document.querySelector('#theme-switch');

// Check localStorage for theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeSwitch.checked = true;  // Checkbox reflects the saved state
    themeBtn.querySelector('span:first-child').classList.add('active');
    themeBtn.querySelector('span:last-child').classList.remove('active');
} else {
    document.body.classList.remove('dark-theme');
    themeSwitch.checked = false;  // Checkbox reflects the saved state
    themeBtn.querySelector('span:first-child').classList.remove('active');
    themeBtn.querySelector('span:last-child').classList.add('active');
}

// Listen for theme switch via the checkbox
themeSwitch.addEventListener('change', () => {
    const isDarkTheme = themeSwitch.checked;
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        themeBtn.querySelector('span:first-child').classList.add('active');
        themeBtn.querySelector('span:last-child').classList.remove('active');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        themeBtn.querySelector('span:first-child').classList.remove('active');
        themeBtn.querySelector('span:last-child').classList.add('active');
    }
});

// Listen for theme switch via the theme-btn (if you also want to keep the previous theme-btn toggle)
themeBtn.addEventListener('click', () => {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    themeSwitch.checked = isDarkTheme;  // Sync the checkbox with the theme
    if (isDarkTheme) {
        themeBtn.querySelector('span:first-child').classList.add('active');
        themeBtn.querySelector('span:last-child').classList.remove('active');
    } else {
        themeBtn.querySelector('span:first-child').classList.remove('active');
        themeBtn.querySelector('span:last-child').classList.add('active');
    }
});
