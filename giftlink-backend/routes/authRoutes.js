const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger

const logger = pino();  // Create a Pino logger instance

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// ===================== REGISTER ENDPOINT =====================
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Save user in DB
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Create JWT token
        const payload = { user: { id: newUser.insertedId } };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email: req.body.email });
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

// ===================== UPDATE ENDPOINT =====================
router.put('/update', [
    // Validation rules
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('password').optional().isLength({ min: 6 })
], async (req, res) => {
    try {
        // Task 2: Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Validation errors in update request', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        // Task 3: Check if email is present in header
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: Find user in DB
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        if (req.body.firstName) existingUser.firstName = req.body.firstName;
        if (req.body.lastName) existingUser.lastName = req.body.lastName;
        if (req.body.password) {
            const salt = await bcryptjs.genSalt(10);
            existingUser.password = await bcryptjs.hash(req.body.password, salt);
        }
        existingUser.updatedAt = new Date();

        // Task 6: Update user in DB
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        // Task 7: Create new JWT token
        const payload = { user: { id: updatedUser.value._id.toString() } };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User updated successfully');
        res.json({ authtoken });
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
