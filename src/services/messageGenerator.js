const messageCache = new Set();
const MESSAGE_CACHE_TIMEOUT = 60000;

const THRESHOLDS = {
    temperature: {
        AC: { min: 16, max: 28, unit: '°C' },
        Fridge: { min: -20, max: -5, unit: '°C' },
        RoomTemperature: { min: 20, max: 30, unit: '°C' }
    },
    humidity: {
        AC: { min: 40, max: 60, unit: '%' },
        Fridge: { min: 30, max: 60, unit: '%' },
        RoomHumidity: { min: 30, max: 70, unit: '%' }
    },
    power: {
        AC: { min: 0, max: 800, unit: 'V' },
        Fridge: { min: 0, max: 500, unit: 'V' },
        RoomCensor: { min: 0, max: 300, unit: 'V' }
    }
};

const MESSAGE_TEMPLATES = {
    temperature: {
        high: (device, value, sensors) => [
            `Peringatan - ${device}: Suhu terlalu tinggi pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Suhu di atas normal pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Perlu penyesuaian suhu pada sensor ${sensors.join(', ')}`
        ],
        low: (device, value, sensors) => [
            `Peringatan - ${device}: Suhu terlalu rendah pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Suhu di bawah normal pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Perlu penyesuaian suhu pada sensor ${sensors.join(', ')}`
        ]
    },
    humidity: {
        high: (device, value, sensors) => [
            `Peringatan - ${device}: Kelembapan tinggi pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Kelembapan berlebih pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Perlu dehumidifier pada sensor ${sensors.join(', ')}`
        ],
        low: (device, value, sensors) => [
            `Peringatan - ${device}: Kelembapan rendah pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Kelembapan kurang pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Perlu humidifier pada sensor ${sensors.join(', ')}`
        ]
    },
    power: {
        high: (device, value, sensors) => [
            `Peringatan - ${device}: Konsumsi listrik tinggi pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Penggunaan daya berlebih pada sensor ${sensors.join(', ')}`,
            `Peringatan - ${device}: Perlu pengecekan daya pada sensor ${sensors.join(', ')}`
        ]
    },
    normal: (device, sensors) => [
        `${device}: Semua sistem berfungsi normal pada sensor ${sensors.join(', ')}`,
        `${device}: Parameter dalam batas aman pada sensor ${sensors.join(', ')}`,
        `${device}: Kondisi optimal pada sensor ${sensors.join(', ')}`
    ]
};

function processDataBySensor(data) {
    if (!Array.isArray(data)) {
        console.error('Expected array of readings, got:', typeof data);
        return {};
    }

    const sensorData = {};
    
    data.forEach(item => {
        if (!item || !item.sensor_id) {
            console.warn('Invalid item in data:', item);
            return;
        }

        if (!sensorData[item.sensor_id]) {
            sensorData[item.sensor_id] = {
                suhu: {},
                kelembapan: {},
                konsumsiListrik: {}
            };
        }
        
        try {
            // Normalize field name to handle case variations
            const fieldType = item.field.toLowerCase();
            
            // Map fields to our data structure with error handling
            if (fieldType === 'temperature') {
                sensorData[item.sensor_id].suhu[item.measurement] = item.value;
            } else if (fieldType === 'kelembapan' || fieldType === 'kelembaban') {
                sensorData[item.sensor_id].kelembapan[item.measurement] = item.value;
            } else if (fieldType === 'konsumsilistrik') {
                sensorData[item.sensor_id].konsumsiListrik[item.measurement] = item.value;
            } else {
                console.warn(`Unknown field type: ${item.field} (normalized: ${fieldType})`);
            }
        } catch (error) {
            console.error('Error processing item:', item, error);
        }
    });
    
    return sensorData;
}

function generateSystemMessages(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return [];
    }

    const messages = [];
    const sensorDataMap = processDataBySensor(rawData);

    // Initialize device issues with proper structure
    const deviceIssues = {
        AC: { 
            sensors: new Set(), 
            issues: { temp: [], humidity: [], power: [] },
            hasData: false 
        },
        Fridge: { 
            sensors: new Set(), 
            issues: { temp: [], humidity: [], power: [] },
            hasData: false 
        },
        RoomTemperature: { 
            sensors: new Set(), 
            issues: { temp: [] },
            hasData: false 
        },
        RoomHumidity: { 
            sensors: new Set(), 
            issues: { humidity: [] },
            hasData: false 
        },
        RoomCensor: { 
            sensors: new Set(), 
            issues: { power: [] },
            hasData: false 
        }
    };

    // Process all sensor data and group by device with null checks
    Object.entries(sensorDataMap).forEach(([sensor_id, data]) => {
        if (!data) return;

        // Temperature checks
        if (data.suhu) {
            Object.entries(data.suhu).forEach(([device, value]) => {
                const deviceData = deviceIssues[device];
                if (!deviceData) return;

                const threshold = THRESHOLDS.temperature[device];
                if (!threshold) return;
                
                deviceData.sensors.add(sensor_id);
                deviceData.hasData = true;
                
                if (value > threshold.max || value < threshold.min) {
                    deviceData.issues.temp.push(sensor_id);
                }
            });
        }

        // Humidity checks
        if (data.kelembapan) {
            Object.entries(data.kelembapan).forEach(([device, value]) => {
                const deviceData = deviceIssues[device];
                if (!deviceData) return;

                const threshold = THRESHOLDS.humidity[device];
                if (!threshold) return;
                
                deviceData.sensors.add(sensor_id);
                deviceData.hasData = true;
                
                if (value > threshold.max || value < threshold.min) {
                    deviceData.issues.humidity.push(sensor_id);
                }
            });
        }

        // Power checks
        if (data.konsumsiListrik) {
            Object.entries(data.konsumsiListrik).forEach(([device, value]) => {
                const deviceData = deviceIssues[device];
                if (!deviceData) return;

                const threshold = THRESHOLDS.power[device];
                if (!threshold) return;
                
                deviceData.sensors.add(sensor_id);
                deviceData.hasData = true;
                
                if (value > threshold.max) {
                    deviceData.issues.power.push(sensor_id);
                }
            });
        }
    });

    // Generate messages only for devices that have data
    Object.entries(deviceIssues).forEach(([device, data]) => {
        if (!data.hasData || data.sensors.size === 0) return;

        const getRandomMessage = templates => templates[Math.floor(Math.random() * templates.length)];
        const allSensors = Array.from(data.sensors).sort();
        let hasIssues = false;

        // Add issues messages with proper checks
        if (data.issues.temp && data.issues.temp.length > 0) {
            hasIssues = true;
            messages.push({
                type: 'warning',
                content: getRandomMessage(MESSAGE_TEMPLATES.temperature.high(device, null, data.issues.temp.sort())),
                device,
                timestamp: new Date()
            });
        }

        if (data.issues.humidity && data.issues.humidity.length > 0) {
            hasIssues = true;
            messages.push({
                type: 'warning',
                content: getRandomMessage(MESSAGE_TEMPLATES.humidity.high(device, null, data.issues.humidity.sort())),
                device,
                timestamp: new Date()
            });
        }

        if (data.issues.power && data.issues.power.length > 0) {
            hasIssues = true;
            messages.push({
                type: 'critical',
                content: getRandomMessage(MESSAGE_TEMPLATES.power.high(device, null, data.issues.power.sort())),
                device,
                timestamp: new Date()
            });
        }

        // Add success message if no issues
        if (!hasIssues) {
            messages.push({
                type: 'success',
                content: getRandomMessage(MESSAGE_TEMPLATES.normal(device, allSensors)),
                device,
                timestamp: new Date()
            });
        }
    });

    return messages;
}

module.exports = { generateSystemMessages };
