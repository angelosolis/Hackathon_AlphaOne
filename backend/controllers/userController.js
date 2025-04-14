const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const USER_TABLE = "Hackathon_Users";

// Configure multer for memory storage (files will be in memory as buffers)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit filesize to 5MB
    },
    fileFilter: function (req, file, cb) {
        // Accept images and PDFs only
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "application/pdf"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, and PDF files are allowed."), false);
        }
    }
});

// We'll use this as middleware in the route
const uploadMiddleware = upload.single('idDocument');
const promisifiedUploadMiddleware = (req, res) => {
    return new Promise((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Upload ID document to S3 and update user's verification status
exports.uploadIdDocument = async (req, res) => {
    try {
        // Use multer to handle the file upload
        await promisifiedUploadMiddleware(req, res);

        // Verify user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized. Please login.' });
        }

        // Check if file was provided
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Generate a unique filename for S3
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const key = `documents/${req.user.id}/${uuidv4()}${fileExtension}`;

        // Upload the file to S3
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            // You might want to set ACL based on your needs
            // ACL: 'private'
        };

        const uploadResult = await s3.upload(params).promise();

        // Update user's document S3 key and verification status in DynamoDB
        const updateParams = {
            TableName: USER_TABLE,
            Key: { UserID: req.user.id },
            UpdateExpression: 'SET IdDocumentS3Key = :docKey, IsVerified = :isVerified, UpdatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':docKey': key,
                ':isVerified': true, // For hackathon, we automatically verify on upload
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const updateResult = await dynamoDbClient.update(updateParams).promise();

        res.status(200).json({
            message: 'ID document uploaded and verification status updated successfully.',
            documentUrl: uploadResult.Location, // S3 URL of the file
            userStatus: {
                isVerified: updateResult.Attributes.IsVerified,
                documentKey: updateResult.Attributes.IdDocumentS3Key
            }
        });

    } catch (error) {
        console.error('Error uploading ID document:', error);
        res.status(500).json({ message: 'Server error during document upload.', error: error.message });
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        // Verify user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized. Please login.' });
        }

        // Get user from DynamoDB
        const params = {
            TableName: USER_TABLE,
            Key: { UserID: req.user.id }
        };

        const result = await dynamoDbClient.get(params).promise();

        // Check if user exists
        if (!result.Item) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Remove sensitive information before sending
        const { passwordHash, ...userProfile } = result.Item;

        res.status(200).json(userProfile);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.', error: error.message });
    }
}; 