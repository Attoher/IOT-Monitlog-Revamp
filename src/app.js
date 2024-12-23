
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const sensorRoutes = require('./routes/sensor.routes');
const messageRoutes = require('./routes/message.routes');

// Use routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/messages', messageRoutes);

// Serve static files
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});