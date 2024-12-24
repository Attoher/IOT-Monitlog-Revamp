const { generateSystemMessages } = require('../services/messageGenerator');

const MESSAGES_PER_PAGE = 10;
let lastUpdateTimestamp = 0;

const messageController = {
    getMessages: async (req, res) => {
        try {
            const client = req.app.locals.db;
            if (!client) {
                throw new Error("Database connection not available");
            }

            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * MESSAGES_PER_PAGE;

            const now = new Date();
            const currentMinuteTimestamp = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes()
            ).getTime();

            // Only update messages at the start of each minute
            if (currentMinuteTimestamp > lastUpdateTimestamp) {
                // Check if messages already exist for this minute
                const existingMessages = await client.db("messages").collection("messages")
                    .find({
                        timestamp: {
                            $gte: new Date(currentMinuteTimestamp),
                            $lt: new Date(currentMinuteTimestamp + 60000) // Next minute
                        }
                    }).toArray();

                if (existingMessages.length === 0) {
                    // Get latest sensor data
                    const sensorData = {
                        suhu: {
                            Fridge: await getLatestValue(client, "suhu", "Fridge"),
                            AC: await getLatestValue(client, "suhu", "AC"),
                            RoomTemperature: await getLatestValue(client, "suhu", "RoomTemperature")
                        },
                        kelembapan: {
                            Fridge: await getLatestValue(client, "kelembapan", "Fridge"),
                            AC: await getLatestValue(client, "kelembapan", "AC"),
                            RoomHumidity: await getLatestValue(client, "kelembapan", "RoomHumidity")
                        },
                        konsumsiListrik: {
                            AC: await getLatestValue(client, "listrik", "AC"),
                            Fridge: await getLatestValue(client, "listrik", "Fridge"),
                            RoomCensor: await getLatestValue(client, "listrik", "RoomCensor"),
                            TV: await getLatestValue(client, "listrik", "TV")
                        }
                    };

                    const messages = generateSystemMessages(sensorData);
                    
                    // Store in messages database
                    if (messages.length > 0) {
                        // Ensure all messages have exactly the same timestamp
                        const exactTimestamp = new Date(currentMinuteTimestamp);
                        const messagesWithTimestamp = messages.map(msg => ({
                            ...msg,
                            timestamp: exactTimestamp,
                            _id: new Date().getTime() + Math.random().toString(36).substring(7)
                        }));
                        await client.db("messages").collection("messages").insertMany(messagesWithTimestamp);
                    }
                }

                lastUpdateTimestamp = currentMinuteTimestamp;
            }

            // Get total count for pagination
            const totalMessages = await client.db("messages").collection("messages").countDocuments();
            const totalPages = Math.ceil(totalMessages / MESSAGES_PER_PAGE);
            
            // Fetch messages with pagination
            const allMessages = await client.db("messages").collection("messages")
                .find({})
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(MESSAGES_PER_PAGE)
                .toArray();
            
            res.json({
                messages: allMessages,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalMessages: totalMessages,
                    messagesPerPage: MESSAGES_PER_PAGE,
                    nextUpdate: 60 - new Date().getSeconds() // Seconds until next update
                }
            });

        } catch (error) {
            console.error("Error in getMessages:", error);
            res.status(500).json({ 
                error: error.message,
                messages: [{
                    type: 'error',
                    content: 'Gagal memuat pesan. Silakan coba lagi nanti.',
                    timestamp: new Date()
                }]
            });
        }
    },

    // Add createMessage method if needed
    createMessage: async (req, res) => {
        try {
            const client = req.app.locals.db;
            if (!client) {
                throw new Error("Database connection not available");
            }

            const message = {
                type: req.body.type || 'info',
                content: req.body.content,
                timestamp: new Date()
            };

            await client.db("messages").collection("messages").insertOne(message);
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    clearMessages: async (req, res) => {
        try {
            const client = req.app.locals.db;
            if (!client) {
                throw new Error("Database connection not available");
            }

            await client.db("messages").collection("messages").deleteMany({});
            
            res.status(200).json({ 
                message: 'All messages cleared successfully' 
            });
        } catch (error) {
            console.error("Error clearing messages:", error);
            res.status(500).json({ 
                error: error.message 
            });
        }
    }
};

// Add this helper function at the bottom of the file:
async function getLatestValue(client, database, measurement) {
    const data = await client.db(database).collection("iotmonitlog")
        .findOne({ _measurement: measurement }, { sort: { _time: -1 } });
    return data?._value ?? 0;
}

module.exports = messageController;
