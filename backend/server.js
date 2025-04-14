require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const AWS = require('aws-sdk');
const authRoutes = require('./routes/authRoutes'); // Add this

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

// Export clients for use in other modules (optional for now)
// module.exports = { s3, dynamoDbClient };

// TODO: Import AWS SDK and initialize clients (DynamoDB, S3) later

const app = express();
const server = http.createServer(app);

// --- Middleware ---
// Enable CORS for requests from your frontend origin
// TODO: Replace '*' with your frontend URL in production for security
app.use(cors({
  origin: '*' // Allow all origins for now (hackathon)
}));

// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));


// --- Socket.IO Setup ---
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for Socket.IO connections (hackathon)
        methods: ["GET", "POST"]
    }
});

// Basic connection handler (We'll add more logic later)
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // TODO: Update user presence status in DynamoDB
    });

    // TODO: Add handlers for chat messages, status updates, etc.
});


// --- Routes --- // Add this section heading if needed
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth

// Example base route
app.get('/api', (req, res) => { // Changed from '/' to '/api'
  res.send('Backend API is Running!');
});

// TODO: Add routes for Properties, Users, etc. later


// --- Start Server ---
const PORT = process.env.BACKEND_PORT || 3001; // Use port from .env or default to 3001
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Socket.IO initialized`);
}); 