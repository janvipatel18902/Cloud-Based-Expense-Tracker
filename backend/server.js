const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors'); // Enable CORS

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000', // Update with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.use(bodyParser.json());

// Configure AWS SDK
const client = new DynamoDBClient({
    region: process.env.DYNAMODB_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const dynamoDb = DynamoDBDocumentClient.from(client);

// Define POST route to save an expense
app.post('/api/expenses', async (req, res) => {
    const { category, amount, date } = req.body;
    const id = Date.now().toString(); // Generate a unique ID using the current timestamp

    if (!category || !amount || !date) {
        return res.status(400).send({ message: 'Category, amount, and date are required' });
    }

    const params = {
        TableName: 'Expenses', // Explicitly set the table name
        Item: { id, category, amount, date }, // Partition key: id, Sort key: date
    };

    try {
        const command = new PutCommand(params);
        await dynamoDb.send(command);
        res.status(201).send({ message: 'Expense saved successfully!', id });
    } catch (error) {
        console.error('Error saving expense:', error);
        res.status(500).send({ message: 'Error saving expense', error: error.message });
    }
});

// Define GET route to retrieve expenses by date
app.get('/api/expenses/date/:date', async (req, res) => {
    const { date } = req.params;

    // Ensure the date is in the correct format (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).send({ message: 'Invalid date format. Expected YYYY-MM-DD.' });
    }

    try {
        const params = {
            TableName: 'Expenses',
            IndexName: 'dateIndex', // Make sure this matches the GSI name in your table
            KeyConditionExpression: '#date = :dateValue',
            ExpressionAttributeNames: {
                '#date': 'date', // The attribute name for date
            },
            ExpressionAttributeValues: {
                ':dateValue': date, // The date value you are querying
            },
        };

        const command = new QueryCommand(params);
        const { Items } = await dynamoDb.send(command);

        if (Items && Items.length > 0) {
            res.status(200).json(Items); // Return all expenses for the given date
        } else {
            res.status(404).send({ message: 'No expenses found for the given date' });
        }
    } catch (error) {
        console.error('Error fetching expenses by date:', error);
        res.status(500).send({ message: 'Error fetching expenses by date', error: error.message });
    }
});

// Define GET route to retrieve all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const params = {
            TableName: 'Expenses', // Table name
        };

        // Use ScanCommand to get all items from the table
        const command = new ScanCommand(params); // Change this to ScanCommand
        const { Items } = await dynamoDb.send(command);

        if (Items && Items.length > 0) {
            res.status(200).json(Items); // Return all expenses
        } else {
            res.status(404).send({ message: 'No expenses found' });
        }
    } catch (error) {
        console.error('Error fetching all expenses:', error);
        res.status(500).send({ message: 'Error fetching all expenses', error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
