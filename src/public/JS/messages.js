let currentPage = 1;
let isHistoryMode = false;

// Add toggle functionality
document.getElementById('current-mode').addEventListener('click', function() {
    if (isHistoryMode) {
        isHistoryMode = false;
        this.classList.add('active');
        document.getElementById('history-mode').classList.remove('active');
        
        // Instead of hiding, make buttons inactive
        const prevBtn = document.getElementById('prev-chart-btn');
        const nextBtn = document.getElementById('next-chart-btn');
        const pageStatus = document.getElementById('pageStatus');
        
        // Keep buttons visible but inactive
        prevBtn.style.opacity = '0.5';
        nextBtn.style.opacity = '0.5';
        pageStatus.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
        nextBtn.style.cursor = 'not-allowed';
        
        // Remove any display: none
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        pageStatus.style.display = 'block';
        
        fetchMessages(1);
    }
});

document.getElementById('history-mode').addEventListener('click', function() {
    if (!isHistoryMode) {
        isHistoryMode = true;
        this.classList.add('active');
        document.getElementById('current-mode').classList.remove('active');
        document.getElementById('prev-chart-btn').style.display = 'inline-block';
        document.getElementById('next-chart-btn').style.display = 'inline-block';
        document.getElementById('pageStatus').style.display = 'block';
        fetchMessages(1);
    }
});

// Modify fetchMessages function
async function fetchMessages(page = 1) {
    try {
        const messageContainer = document.querySelector('.middle');
        messageContainer.innerHTML = `
            <div class="message-mode-toggle">
                <button id="current-mode" class="mode-btn ${!isHistoryMode ? 'active' : ''}">Current</button>
                <button id="history-mode" class="mode-btn ${isHistoryMode ? 'active' : ''}">History</button>
            </div>
            <div class="loading-messages">
                <span class="material-symbols-outlined">sync</span>
                <p>Memuat pesan...</p>
            </div>
        `;

        const response = await fetch(`/api/messages?page=${page}&mode=${isHistoryMode ? 'history' : 'current'}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch messages');
        }
        
        const data = await response.json();
        
        updateMessageDisplay(data.messages);
        if (isHistoryMode) {
            updatePaginationControls(data.pagination);
        }
        currentPage = page;

        // Only schedule next update in current mode
        if (!isHistoryMode) {
            scheduleNextFetch(data.pagination.nextUpdate * 1000);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        showErrorMessage(error.message);
    }
}

function updateMessageDisplay(messages) {
    const messageContainer = document.querySelector('.middle');
    messageContainer.innerHTML = ''; // Clear existing messages

    // Add toggle buttons
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'message-mode-toggle';
    toggleDiv.innerHTML = `
        <button id="current-mode" class="mode-btn ${!isHistoryMode ? 'active' : ''}">Current</button>
        <button id="history-mode" class="mode-btn ${isHistoryMode ? 'active' : ''}">History</button>
    `;
    messageContainer.appendChild(toggleDiv);

    if (messages.length === 0) {
        showNoMessagesMessage(messageContainer);
        return;
    }

    // Filter current messages if in current mode
    const currentMessages = !isHistoryMode ? filterCurrentMessages(messages) : messages;

    if (currentMessages.length === 0) {
        showNoMessagesMessage(messageContainer);
        return;
    }

    currentMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message-section ${message.type}`;
        
        const timestamp = new Date(message.timestamp).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'medium' // Show more detailed time
        });
        
        messageElement.innerHTML = `
            <h2>${message.content}</h2>
            <small class="timestamp">Terakhir diperbarui: ${timestamp}</small>
        `;
        
        messageContainer.appendChild(messageElement);
    });

    // Only show countdown in current mode
    if (!isHistoryMode) {
        const nextUpdateElement = document.createElement('div');
        nextUpdateElement.className = 'next-update-info';
        const secondsUntilNextUpdate = 60 - new Date().getSeconds();
        nextUpdateElement.innerHTML = `
            <small>Pembaruan berikutnya dalam <span id="countdown">${secondsUntilNextUpdate}</span> detik</small>
        `;
        messageContainer.appendChild(nextUpdateElement);
        startCountdown(secondsUntilNextUpdate);
    }
}

// Add this new function to filter current messages
function filterCurrentMessages(messages) {
    const now = new Date();
    return messages.filter(message => {
        const msgDate = new Date(message.timestamp);
        return msgDate.getDate() === now.getDate() &&
               msgDate.getMonth() === now.getMonth() &&
               msgDate.getFullYear() === now.getFullYear() &&
               msgDate.getHours() === now.getHours() &&
               msgDate.getMinutes() === now.getMinutes();
    });
}

// Modify countdown timer to accept initial value
function startCountdown(initialValue) {
    let timeLeft = initialValue;
    const countdownElement = document.getElementById('countdown');
    
    const countdown = setInterval(() => {
        timeLeft -= 1;
        if (countdownElement) {
            countdownElement.textContent = timeLeft;
        }
        if (timeLeft <= 0) {
            clearInterval(countdown);
        }
    }, 1000);
}

function showErrorMessage() {
    const messageContainer = document.querySelector('.middle');
    messageContainer.innerHTML = `
        <div class="message-section error">
            <h2>Gagal memuat pesan. Silakan coba lagi nanti.</h2>
        </div>
    `;
}

function showNoMessagesMessage(container) {
    container.innerHTML = `
        <div class="message-section info">
            <h2>Tidak ada pesan untuk ditampilkan.</h2>
        </div>
    `;
}

// Update updatePaginationControls function
function updatePaginationControls(pagination) {
    const prevBtn = document.getElementById('prev-chart-btn');
    const nextBtn = document.getElementById('next-chart-btn');
    const pageStatus = document.getElementById('pageStatus');

    if (isHistoryMode) {
        // Make navigation visible and active in history mode
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        pageStatus.style.display = 'block';

        if (pagination.currentPage > 1) {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        } else {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        }

        if (pagination.currentPage < pagination.totalPages) {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        } else {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        }
        pageStatus.style.opacity = '1';
        pageStatus.textContent = `Halaman ${pagination.currentPage} dari ${pagination.totalPages}`;
    } else {
        // Hide navigation in current mode
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        pageStatus.style.display = 'none';
    }
}

// Add event listeners for pagination buttons
document.getElementById('prev-chart-btn').addEventListener('click', () => {
    if (isHistoryMode && currentPage > 1) {
        fetchMessages(currentPage - 1);
    }
});

document.getElementById('next-chart-btn').addEventListener('click', () => {
    if (isHistoryMode) {
        const totalPages = parseInt(document.getElementById('pageStatus').textContent.split(' ').pop());
        if (currentPage < totalPages) {
            fetchMessages(currentPage + 1);
        }
    }
});

// Add clear button functionality
document.getElementById('clear-chart-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/messages', {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to clear messages');
        }

        // Refresh messages after clearing
        fetchMessages(1);
    } catch (error) {
        console.error('Error clearing messages:', error);
        showErrorMessage('Failed to clear messages');
    }
});

// Modify scheduleNextFetch to use the current page
function scheduleNextFetch() {
    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();
    const millisecondsUntilNextMinute = (secondsUntilNextMinute * 1000) - now.getMilliseconds();

    setTimeout(() => {
        fetchMessages(currentPage);
        // After the first synchronized update, schedule regular updates every minute
        setInterval(() => fetchMessages(currentPage), 60000);
    }, millisecondsUntilNextMinute);
}

// Change refresh interval to 1 minute (60000ms)
const REFRESH_INTERVAL = 60000; // 1 minute in milliseconds

// Update initial state in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('prev-chart-btn');
    const nextBtn = document.getElementById('next-chart-btn');
    const pageStatus = document.getElementById('pageStatus');
    
    // Ensure buttons are visible but inactive initially
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    pageStatus.style.display = 'block';
    
    prevBtn.style.opacity = '0.5';
    nextBtn.style.opacity = '0.5';
    pageStatus.style.opacity = '0.5';
    
    prevBtn.style.cursor = 'not-allowed';
    nextBtn.style.cursor = 'not-allowed';
    
    fetchMessages();
});
