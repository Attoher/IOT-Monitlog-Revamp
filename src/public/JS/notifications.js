let lastMessageTimestamp = 0;
let lastMessageContent = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Notyf with custom styling
    const notyf = new Notyf({
        duration: 5000,
        position: { x: 'right', y: 'bottom' },
        dismissible: true, // Make notifications dismissible
        ripple: true, // Add ripple effect
        types: [
            {
                type: 'warning',
                background: '#f1c40f',
                icon: {
                    className: 'material-icons-sharp',
                    tagName: 'span',
                    text: 'warning'
                },
                dismissible: true
            },
            {
                type: 'error',
                background: '#e74c3c',
                icon: {
                    className: 'material-icons-sharp',
                    tagName: 'span',
                    text: 'error'
                },
                dismissible: true
            },
            {
                type: 'success',
                background: '#2ecc71',
                icon: {
                    className: 'material-icons-sharp',
                    tagName: 'span',
                    text: 'check_circle'
                },
                dismissible: true
            },
            {
                type: 'info',
                background: '#3498db',
                icon: {
                    className: 'material-icons-sharp',
                    tagName: 'span',
                    text: 'info'
                },
                dismissible: true
            }
        ]
    });

    function scheduleNextCheck() {
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
        
        setTimeout(() => {
            checkNewMessages();
            setInterval(checkNewMessages, 60000);
        }, delay);
    }

    async function checkNewMessages() {
        if (window.location.pathname.includes('3message.html')) return;

        try {
            const notificationsEnabled = localStorage.getItem('notifications') === 'true';
            const compareMode = localStorage.getItem('compareMode') === 'true';

            if (!notificationsEnabled && !compareMode) return;

            const response = await fetch('/api/messages?page=1');
            if (!response.ok) throw new Error('Failed to fetch messages');
            
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                // Get current minute's timestamp
                const now = new Date();
                const currentMinuteTime = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    now.getHours(),
                    now.getMinutes()
                ).getTime();

                // Filter messages from current minute
                const currentMinuteMessages = data.messages.filter(msg => {
                    const msgTime = new Date(msg.timestamp);
                    const msgMinuteTime = new Date(
                        msgTime.getFullYear(),
                        msgTime.getMonth(),
                        msgTime.getDate(),
                        msgTime.getHours(),
                        msgTime.getMinutes()
                    ).getTime();
                    return msgMinuteTime === currentMinuteTime;
                });

                if (currentMinuteMessages.length > 0) {
                    if (compareMode) {
                        const lastContent = localStorage.getItem('lastMessageContent');
                        const newContents = currentMinuteMessages.map(msg => msg.content);
                        
                        if (!lastContent || !newContents.includes(lastContent)) {
                            currentMinuteMessages.forEach(msg => {
                                displayNotification(msg);
                            });
                            localStorage.setItem('lastMessageContent', currentMinuteMessages[0].content);
                        }
                    } else if (notificationsEnabled) {
                        currentMinuteMessages.forEach(msg => {
                            displayNotification(msg);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error checking messages:', error);
        }
    }

    function displayNotification(message) {
        const notification = notyf.open({
            type: message.type || 'info',
            message: message.content,
            dismissible: true,
            onClick: function() {
                // Redirect to messages page when clicked
                window.location.href = '3message.html';
            }
        });
    }

    // Initial check
    checkNewMessages();
    
    // Schedule next check at exactly XX:XX:00
    scheduleNextCheck();
});
