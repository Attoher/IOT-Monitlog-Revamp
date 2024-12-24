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

    // Temperature checks for different devices
    if (suhu.Fridge > -5) {
        addMessage('warning', `Suhu kulkas terlalu tinggi (${suhu.Fridge}°C). Periksa sistem pendingin kulkas.`);
    } else if (suhu.Fridge < -20) {
        addMessage('warning', `Suhu kulkas terlalu rendah (${suhu.Fridge}°C). Sesuaikan pengaturan suhu kulkas.`);
    }

    if (suhu.AC > 28) {
        addMessage('warning', `AC tidak mendingin dengan baik (${suhu.AC}°C). Periksa unit AC.`);
    } else if (suhu.AC < 16) {
        addMessage('warning', `Suhu AC terlalu dingin (${suhu.AC}°C). Sesuaikan pengaturan AC.`);
    }

    if (suhu.RoomTemperature > 30) {
        addMessage('warning', `Suhu ruangan tinggi (${suhu.RoomTemperature}°C). Aktifkan pendingin ruangan.`);
    } else if (suhu.RoomTemperature < 18) {
        addMessage('warning', `Suhu ruangan rendah (${suhu.RoomTemperature}°C). Periksa sirkulasi udara.`);
    }

    // Humidity checks for different locations
    if (kelembapan.Fridge > 60) {
        addMessage('error', `Kelembapan kulkas tinggi (${kelembapan.Fridge}%). Periksa seal pintu kulkas.`);
    }

    if (kelembapan.AC > 70) {
        addMessage('error', `Kelembapan area AC tinggi (${kelembapan.AC}%). Periksa drainase AC.`);
    }

    if (kelembapan.RoomHumidity > 70) {
        addMessage('error', `Kelembapan ruangan tinggi (${kelembapan.RoomHumidity}%). Aktifkan dehumidifier.`);
    } else if (kelembapan.RoomHumidity < 30) {
        addMessage('error', `Kelembapan ruangan rendah (${kelembapan.RoomHumidity}%). Aktifkan humidifier.`);
    }

    // Power consumption checks for each device
    if (konsumsiListrik.AC > 1000) {
        addMessage('critical', `Konsumsi listrik AC tinggi (${konsumsiListrik.AC}W)! Periksa efisiensi unit.`);
    }

    if (konsumsiListrik.Fridge > 500) {
        addMessage('critical', `Konsumsi listrik kulkas berlebih (${konsumsiListrik.Fridge}W)! Periksa kompressor.`);
    }

    if (konsumsiListrik.RoomCensor > 50) {
        addMessage('warning', `Konsumsi sensor ruangan tidak normal (${konsumsiListrik.RoomCensor}W). Periksa sambungan.`);
    }

    if (konsumsiListrik.TV > 300) {
        addMessage('warning', `Konsumsi listrik TV tinggi (${konsumsiListrik.TV}W). Pertimbangkan mode hemat energi.`);
    }

    // Calculate total power consumption
    const totalPower = Object.values(konsumsiListrik).reduce((sum, current) => sum + current, 0);
    if (totalPower > 2000) {
        addMessage('critical', `Total konsumsi listrik sangat tinggi (${totalPower}W)! Periksa penggunaan peralatan.`);
    }

    // Add normal status message if everything is within limits
    if (messages.length === 0) {
        addMessage('success', 'Semua perangkat berfungsi normal dan konsumsi listrik dalam batas aman.');
    }

    return messages;
}

module.exports = { generateSystemMessages };
