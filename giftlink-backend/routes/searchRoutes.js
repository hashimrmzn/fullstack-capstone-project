const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db'); // Make sure this exports a function that connects to MongoDB

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase(); // <-- connect to MongoDB
        const collection = db.collection("gifts");

        // Initialize the query object
        let query = {};

        // Task 2: Add the name filter if it exists and is not empty
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" }; // Case-insensitive partial match
        }

        // Task 3: Add other filters
        if (req.query.category) {
            query.category = req.query.category; // Exact match for category
        }
        if (req.query.condition) {
            query.condition = req.query.condition; // Exact match for condition
        }
        if (req.query.age_years) {
            query.age_years = { $lte: parseInt(req.query.age_years) }; // Less than or equal to the age
        }

        // Task 4: Fetch filtered gifts
        const gifts = await collection.find(query).toArray();

        // Send response
        res.json({ success: true, gifts });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
