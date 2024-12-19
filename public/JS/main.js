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

// Theme Toggle with Persistence
const themeSwitch = document.querySelector('#theme-switch');
const themeBtn = document.querySelector('.theme-btn');

// Check if the page has theme-switch (for Settings page)
const isSettingsPage = themeSwitch !== null;

// Check localStorage for theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (isSettingsPage) {
        themeSwitch.checked = true; // Set checkbox to checked for dark theme
        themeBtn.querySelector('span:first-child').classList.add('active');
        themeBtn.querySelector('span:last-child').classList.remove('active');
    } else {
        themeBtn.querySelector('span:first-child').classList.add('active');
        themeBtn.querySelector('span:last-child').classList.remove('active');
    }
} else {
    document.body.classList.remove('dark-theme');
    if (isSettingsPage) {
        themeSwitch.checked = false; // Set checkbox to unchecked for light theme
        themeBtn.querySelector('span:first-child').classList.remove('active');
        themeBtn.querySelector('span:last-child').classList.add('active');
    } else {
        themeBtn.querySelector('span:first-child').classList.remove('active');
        themeBtn.querySelector('span:last-child').classList.add('active');
    }
}

// Handle the theme toggle for the checkbox (Settings page only)
if (isSettingsPage) {
    themeSwitch.addEventListener('change', () => {
        const isDarkTheme = themeSwitch.checked;

        // Toggle the theme class
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark'); // Save theme preference in localStorage
            themeBtn.querySelector('span:first-child').classList.add('active');
            themeBtn.querySelector('span:last-child').classList.remove('active');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light'); // Save theme preference in localStorage
            themeBtn.querySelector('span:first-child').classList.remove('active');
            themeBtn.querySelector('span:last-child').classList.add('active');
        }
    });
}

// Handle the theme toggle for the button (Both Dashboard and Settings)
themeBtn.addEventListener('click', () => {
    // Toggle the theme using the checkbox state
    if (isSettingsPage) {
        themeSwitch.checked = !themeSwitch.checked;
        // Trigger the change event of the checkbox to apply the theme
        themeSwitch.dispatchEvent(new Event('change'));
    } else {
        // For Dashboard only, toggle the button
        const isDarkTheme = document.body.classList.toggle('dark-theme');
        if (isDarkTheme) {
            localStorage.setItem('theme', 'dark');
            themeBtn.querySelector('span:first-child').classList.add('active');
            themeBtn.querySelector('span:last-child').classList.remove('active');
        } else {
            localStorage.setItem('theme', 'light');
            themeBtn.querySelector('span:first-child').classList.remove('active');
            themeBtn.querySelector('span:last-child').classList.add('active');
        }
    }
});
