const { MongoClient } = require('mongodb');

const mongoURI = "mongodb+srv://alden:1234@iot.hooqj.mongodb.net/?retryWrites=true&w=majority&appName=iot";
const client = new MongoClient(mongoURI);

const sensorController = {
    getLatestTemperature: async (req, res) => {
        try {
            const db = client.db("suhu");
            const collection = db.collection("iotmonitlog");
    
            const data = await collection.aggregate([
                {
                    $sort: { "_time": -1 }
                },
                {
                    $group: {
                        _id: {
                            sensor_id: "$sensor_id",
                            measurement: "$_measurement"
                        },
                        value: { $first: "$_value" },
                        time: { $first: "$_time" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        sensor_id: "$_id.sensor_id",
                        measurement: "$_id.measurement",
                        value: "$value",
                        timestamp: "$time"
                    }
                }
            ]).toArray();
    
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getLatestHumidity: async (req, res) => {
        try {
            const db = client.db("kelembapan");
            const collection = db.collection("iotmonitlog");
            const data = await collection.aggregate([
                {
                    $sort: { "_time": -1 }
                },
                {
                    $group: {
                        _id: {
                            sensor_id: "$sensor_id",
                            measurement: "$_measurement"
                        },
                        value: { $first: "$_value" },
                        time: { $first: "$_time" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        sensor_id: "$_id.sensor_id",
                        measurement: "$_id.measurement",
                        value: "$value",
                        timestamp: "$time"
                    }
                }
            ]).toArray();
    
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getLatestPower: async (req, res) => {
        try {
            const db = client.db("listrik");
            const collection = db.collection("iotmonitlog");
            const data = await collection.aggregate([
                {
                    $sort: { "_time": -1 }
                },
                {
                    $group: {
                        _id: {
                            sensor_id: "$sensor_id",
                            measurement: "$_measurement"
                        },
                        value: { $first: "$_value" },
                        time: { $first: "$_time" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        sensor_id: "$_id.sensor_id",
                        measurement: "$_id.measurement",
                        value: "$value",
                        timestamp: "$time"
                    }
                }
            ]).toArray();
    
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getTemperatureHistory: async (req, res) => {
        try {
            const db = client.db("suhu");
            const collection = db.collection("iotmonitlog");
            const data = await collection.find().sort({ timestamp: -1 }).toArray();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getHumidityHistory: async (req, res) => {
        try {
            const db = client.db("kelembapan");
            const collection = db.collection("iotmonitlog");
            const data = await collection.find().sort({ timestamp: -1 }).toArray();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPowerHistory: async (req, res) => {
        try {
            const db = client.db("listrik");
            const collection = db.collection("iotmonitlog");
            const data = await collection.find().sort({ timestamp: -1 }).toArray();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = sensorController;
