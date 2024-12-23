const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
dotenv.config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const loginRouter = require('./routes/login.router');
const sensorRouter = require('./routes/sensor.router');
const messageRouter = require('./routes/message.routes');

const mongoURI = "mongodb+srv://alden:1234@iot.hooqj.mongodb.net/?retryWrites=true&w=majority&appName=iot";
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbSuhu = "suhu";
const dbListrik = "listrik";
const dbKelembapan = "kelembapan";
const dbSystem = "messages"; // Add this with other db declarations

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Static files
const publicPath = path.resolve(process.cwd(), './src/public');
app.use(express.static(publicPath));

// Routes
app.use('/auth', loginRouter);
app.use('/api/sensors', sensorRouter);
app.use('/api', messageRouter); // Update the message router route to use /api prefix

// MongoDB Connection and Database endpoints
let dbSuhuClient, dbListrikClient, dbKelembapanClient;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    await client.db("admin").command({ ping: 1 });

    // Store MongoDB client in app.locals for global access
    app.locals.db = client;

    // Initialize database connections
    dbSuhuClient = client.db(dbSuhu);
    dbListrikClient = client.db(dbListrik);
    dbKelembapanClient = client.db(dbKelembapan);

    // Create messages database and collection instead of using system db
    const messagesDb = client.db(dbSystem);
    await messagesDb.createCollection("messages");
    await messagesDb.collection("messages").createIndex({ timestamp: -1 });

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

// MongoDB Data endpoints
app.get('/data/suhu', async (req, res) => {
  if (!dbSuhuClient) return res.status(500).send("Database connection not available.");

  try {
    const suhuCollection = dbSuhuClient.collection('suhu');
    const suhuData = await suhuCollection.find({}).toArray();
    res.status(200).json(suhuData);
  } catch (error) {
    console.error('Error fetching suhu data:', error);
    res.status(500).json({ error: 'Failed to fetch suhu data from MongoDB.' });
  }
});

app.get('/data/kelembapan', async (req, res) => {
  if (!dbKelembapanClient) return res.status(500).send("Database connection not available.");

  try {
    const kelembapanCollection = dbKelembapanClient.collection('kelembapan');
    const kelembapanData = await kelembapanCollection.find({}).toArray();
    res.status(200).json(kelembapanData);
  } catch (error) {
    console.error('Error fetching kelembapan data:', error);
    res.status(500).json({ error: 'Failed to fetch kelembapan data from MongoDB.' });
  }
});

app.get('/data/konsumsiListrik', async (req, res) => {
  if (!dbListrikClient) return res.status(500).send("Database connection not available.");

  try {
    const listrikCollection = dbListrikClient.collection('konsumsiListrik');
    const listrikData = await listrikCollection.find({}).toArray();
    res.status(200).json(listrikData);
  } catch (error) {
    console.error('Error fetching listrik data:', error);
    res.status(500).json({ error: 'Failed to fetch listrik data from MongoDB.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

run().catch(console.dir);

module.exports = app;
