require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const pinoHttp = require('pino-http');

const connectToDatabase = require('./models/db');
const { loadData } = require('./util/import-mongo/index');

const app = express();
const port = 3060;

// Middleware
app.use("*", cors());
app.use(express.json());
app.use(pinoHttp({ logger: pinoLogger }));

// Connect to MongoDB
connectToDatabase()
    .then(() => {
        pinoLogger.info('Connected to DB');
    })
    .catch((e) => console.error('Failed to connect to DB', e));

// Route files
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Use Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Test route
app.get("/", (req, res) => {
    res.send("Inside the server");
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
