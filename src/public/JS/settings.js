// Handle notification settings
function initializeNotificationSettings() {
    const notificationSwitch = document.getElementById('notification-switch');
    const compareSwitch = document.getElementById('compare-switch');

    // Load saved settings
    notificationSwitch.checked = localStorage.getItem('notifications') === 'true';
    compareSwitch.checked = localStorage.getItem('compareMode') === 'true';

    // Make switches mutually exclusive
    notificationSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            compareSwitch.checked = false;
            localStorage.setItem('compareMode', 'false');
        }
        localStorage.setItem('notifications', e.target.checked);
    });

    compareSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            notificationSwitch.checked = false;
            localStorage.setItem('notifications', 'false');
        }
        localStorage.setItem('compareMode', e.target.checked);
    });
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNotificationSettings);
