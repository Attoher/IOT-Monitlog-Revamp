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
            const mode = req.query.mode || 'current';
            const skip = (page - 1) * MESSAGES_PER_PAGE;
            const now = new Date();

            // Set up the current minute timestamp
            const currentMinuteTimestamp = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes()
            );

            // Only generate new messages if we're in current mode and it's time for an update
            if (mode === 'current' && currentMinuteTimestamp.getTime() > lastUpdateTimestamp) {
                // Delete previous messages from this minute to prevent duplicates
                await client.db("messages").collection("messages").deleteMany({
                    timestamp: {
                        $gte: currentMinuteTimestamp,
                        $lt: new Date(currentMinuteTimestamp.getTime() + 60000)
                    }
                });

                // Fetch latest data
                const [latestTemp, latestHumidity, latestPower] = await Promise.all([
                    client.db("suhu").collection("iotmonitlog")
                        .find({}).sort({ _time: -1 }).toArray(),
                    client.db("kelembapan").collection("iotmonitlog")
                        .find({}).sort({ _time: -1 }).toArray(),
                    client.db("listrik").collection("iotmonitlog")
                        .find({}).sort({ _time: -1 }).toArray()
                ]);

                // Generate new messages
                const messages = generateSystemMessages([
                    ...latestTemp.map(t => ({ 
                        ...t, 
                        field: 'Temperature',
                        measurement: t._measurement,
                        value: t._value,
                        sensor_id: t.sensor_id
                    })),
                    ...latestHumidity.map(h => ({ 
                        ...h, 
                        field: 'Kelembapan',
                        measurement: h._measurement,
                        value: h._value,
                        sensor_id: h.sensor_id
                    })),
                    ...latestPower.map(p => ({ 
                        ...p, 
                        field: 'KonsumsiListrik',
                        measurement: p._measurement,
                        value: p._value,
                        sensor_id: p.sensor_id
                    }))
                ]);

                if (messages.length > 0) {
                    const messagesWithTimestamp = messages.map(msg => ({
                        ...msg,
                        timestamp: currentMinuteTimestamp,
                        mode: mode,
                        messageId: `${msg.device}-${msg.type}-${currentMinuteTimestamp.getTime()}`
                    }));

                    await client.db("messages").collection("messages")
                        .insertMany(messagesWithTimestamp);
                }

                lastUpdateTimestamp = currentMinuteTimestamp.getTime();
            }

            // Fetch messages based on mode
            let query = {};
            if (mode === 'current') {
                query = {
                    timestamp: {
                        $gte: currentMinuteTimestamp,
                        $lt: new Date(currentMinuteTimestamp.getTime() + 60000)
                    }
                };
            }

            const totalMessages = await client.db("messages").collection("messages")
                .countDocuments(query);
            const totalPages = Math.ceil(totalMessages / MESSAGES_PER_PAGE);
            
            const allMessages = await client.db("messages").collection("messages")
                .find(query)
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
                    nextUpdate: 60 - new Date().getSeconds()
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
