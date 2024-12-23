// Cache to store recent messages
const messageCache = new Set();
const MESSAGE_CACHE_TIMEOUT = 60000; // 1 minute in milliseconds

function generateSystemMessages(sensorData) {
    const messages = [];
    const { suhu, kelembapan, konsumsiListrik } = sensorData;

    // Helper function to add message if not duplicate
    const addMessage = (type, content) => {
        // Create unique key from content
        const messageKey = `${content}-${Math.floor(Date.now() / MESSAGE_CACHE_TIMEOUT)}`;
        
        if (!messageCache.has(messageKey)) {
            messageCache.add(messageKey);
            messages.push({
                type,
                content,
                timestamp: new Date()
            });

            // Remove message from cache after timeout
            setTimeout(() => {
                messageCache.delete(messageKey);
            }, MESSAGE_CACHE_TIMEOUT);
        }
    };

    // Temperature checks
    if (suhu > 30) {
        addMessage('warning', `Perhatian: Suhu ruangan tinggi (${suhu}°C). Mohon periksa sistem pendingin.`);
    } else if (suhu < 18) {
        addMessage('warning', `Perhatian: Suhu ruangan rendah (${suhu}°C). Mohon sesuaikan pengaturan suhu.`);
    }

    // Humidity checks
    if (kelembapan > 70) {
        addMessage('error', `Peringatan: Kelembapan tinggi (${kelembapan}%). Mohon periksa ventilasi ruangan.`);
    } else if (kelembapan < 30) {
        addMessage('error', `Peringatan: Kelembapan rendah (${kelembapan}%). Mohon gunakan humidifier.`);
    }

    // Power consumption checks
    if (konsumsiListrik > 240) {
        addMessage('critical', `PERHATIAN PENTING: Konsumsi listrik melebihi batas (${konsumsiListrik}V)!`);
    }

    // Only add normal status if there are absolutely no warnings or errors
    if (messages.length === 0) {
        const allNormal = suhu >= 18 && suhu <= 30 && 
                         kelembapan >= 30 && kelembapan <= 70 && 
                         konsumsiListrik <= 240;
                         
        if (allNormal) {
            addMessage('success', 'Semua sistem berjalan normal. Tidak ada masalah yang terdeteksi.');
        }
    }

    return messages;
}

module.exports = { generateSystemMessages };
