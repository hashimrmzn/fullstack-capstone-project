require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection URL from .env
const url = process.env.MONGO_URL;
const dbName = 'giftdb';
const collectionName = 'gifts';
const filename = `${__dirname}/gifts.json`;

// Load gifts data from JSON file
const data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs;

// Function to load data into MongoDB
async function loadData() {
    const client = new MongoClient(url);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected successfully to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Check if collection already has data
        const existingDocs = await collection.countDocuments();

        if (existingDocs === 0) {
            // Insert data if collection is empty
            const insertResult = await collection.insertMany(data);
            console.log(`Inserted ${insertResult.insertedCount} documents into "${collectionName}"`);
        } else {
            console.log(`Collection "${collectionName}" already has documents. No data inserted.`);
        }
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        await client.close();
    }
}

// Optionally run loadData if this file is executed directly
if (require.main === module) {
    loadData();
}

// Export function so other files can call it
module.exports = {
    loadData,
};
