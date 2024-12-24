const express = require('express')
const router = express.Router()
const sensorController = require('../controllers/sensor.controller')
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Latest readings endpoints
router.get('/temperature/latest', sensorController.getLatestTemperature)
router.get('/humidity/latest', sensorController.getLatestHumidity)
router.get('/power/latest', sensorController.getLatestPower)

// Historical data endpoints
router.get('/temperature/history', sensorController.getTemperatureHistory)
router.get('/humidity/history', sensorController.getHumidityHistory)
router.get('/power/history', sensorController.getPowerHistory)

// Change from const to let for database variables
let dbSuhu;
let dbListrik;
let dbKelembapan;

// Connect to the databases
async function initDbConnections() {
    try {
        await client.connect();
        dbSuhu = client.db("suhu").collection("iotmonitlog");
        dbKelembapan = client.db("kelembapan").collection("iotmonitlog");
        dbListrik = client.db("listrik").collection("iotmonitlog");
        console.log("Successfully connected to databases");
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
}

// Remove the old combined POST endpoint and add separate endpoints for each type
router.post('/temperature/data', async (req, res) => {
    try {
        const data = req.body;
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        await client.db("suhu").collection("iotmonitlog").insertMany(
            data.map(item => ({
                ...item,
                _time: new Date(),
                _measurement: item.measurement || 'temperature'
            }))
        );

        res.status(201).json({ message: 'Temperature data inserted successfully' });
    } catch (error) {
        console.error('Error inserting temperature data:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/humidity/data', async (req, res) => {
    try {
        const data = req.body;
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        await client.db("kelembapan").collection("iotmonitlog").insertMany(
            data.map(item => ({
                ...item,
                _time: new Date(),
                _measurement: item.measurement || 'humidity'
            }))
        );

        res.status(201).json({ message: 'Humidity data inserted successfully' });
    } catch (error) {
        console.error('Error inserting humidity data:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/power/data', async (req, res) => {
    try {
        const data = req.body;
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        await client.db("listrik").collection("iotmonitlog").insertMany(
            data.map(item => ({
                ...item,
                _time: new Date(),
                _measurement: item.measurement || 'power'
            }))
        );

        res.status(201).json({ message: 'Power data inserted successfully' });
    } catch (error) {
        console.error('Error inserting power data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initialize database connections
initDbConnections().catch(err => console.error('Failed to initialize DB connections:', err));

module.exports = router
