const path = require('path'); // Add path module
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env from root

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // To generate unique UserIDs

// Configure AWS SDK (Might move to a shared config later)
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const USER_TABLE = "Hackathon_Users"; // Use the table name created earlier
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1); // Stop the server if JWT secret is missing
}

exports.register = async (req, res) => {
    const { email, password, name, userType } = req.body;

    // Basic validation
    if (!email || !password || !name || !userType) {
        return res.status(400).json({ message: "Please provide email, password, name, and userType (Client or Agent)." });
    }
    if (userType !== 'Client' && userType !== 'Agent') {
         return res.status(400).json({ message: "userType must be either 'Client' or 'Agent'." });
    }

    try {
        // Check if user already exists
        const getUserParams = {
            TableName: USER_TABLE,
            // We need an index to query by email, or we scan (inefficient)
            // For hackathon, let's scan, but add a TODO to create a GSI
            FilterExpression: "email = :email",
            ExpressionAttributeValues: { ":email": email }
        };
        console.log("Checking if user exists with params:", getUserParams); // Debug log
        const existingUserResult = await dynamoDbClient.scan(getUserParams).promise();
        console.log("Existing user scan result:", existingUserResult); // Debug log


        if (existingUserResult.Items && existingUserResult.Items.length > 0) {
            return res.status(409).json({ message: "Email already registered." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user object
        const userId = uuidv4();
        const newUser = {
            UserID: userId, // Generate unique ID
            email: email.toLowerCase(), // Store email in lowercase
            passwordHash: passwordHash,
            name: name,
            userType: userType,
            IsVerified: false, // Default verification status
            PresenceStatus: 'Offline',
            createdAt: new Date().toISOString() // Add timestamp
            // Add other optional fields like AgentBio, PRCLicenseID later if provided
        };

        const putUserParams = {
            TableName: USER_TABLE,
            Item: newUser
        };

        // Save user to DynamoDB
        await dynamoDbClient.put(putUserParams).promise();

        // Generate JWT (optional: log in user directly after registration)
        const token = jwt.sign({ id: newUser.UserID, type: newUser.userType }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        res.status(201).json({ token, userId: newUser.UserID, userType: newUser.userType, message: "User registered successfully" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." });
    }

    try {
        // Find user by email (using scan again - needs GSI for production)
        const getUserParams = {
            TableName: USER_TABLE,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: { ":email": email.toLowerCase() }
        };
         console.log("Attempting login scan with params:", getUserParams); // Debug log
        const userResult = await dynamoDbClient.scan(getUserParams).promise();
         console.log("Login scan result:", userResult); // Debug log


        if (!userResult.Items || userResult.Items.length === 0) {
            return res.status(401).json({ message: "Invalid credentials." }); // User not found
        }

        const user = userResult.Items[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." }); // Password doesn't match
        }

        // Generate JWT
        const token = jwt.sign({ id: user.UserID, type: user.userType }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, userId: user.UserID, userType: user.userType });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
}; 