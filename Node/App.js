const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
const port = 8089;
const mongoURI = 'mongodb://localhost:27017';
const dbName = 'your_database_name';
const collectionName = 'users';

app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(mongoURI);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

// Register user endpoint
app.post('/register', async (req, res) => {
    const { username, password, email, lines } = req.body;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = { username, password, email, lines };
        const result = await collection.insertOne(newUser);
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Authenticate user endpoint
app.get('/authenticate', async (req, res) => {
    const { username, password } = req.query;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const user = await collection.findOne({ username, password });
        if (!user) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }
        res.json({ success: true, message: 'Login successful', user });
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
