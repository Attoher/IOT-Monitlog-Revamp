const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const loginRouter = require('./routes/login.router')
app.use("/auth", loginRouter)

// Static files
const publicPath = path.resolve(process.cwd(), './src/public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

// Eksport aplikasi untuk Vercel
module.exports = app;
