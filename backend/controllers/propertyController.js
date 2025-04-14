const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const PROPERTY_TABLE = "Hackathon_Properties";

// Configure multer for memory storage (files will be in memory as buffers)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10 // Maximum 10 files
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/webp" ||
            file.mimetype === "image/gif"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, WebP, and GIF files are allowed."), false);
        }
    }
});

// We'll use this as middleware in the route
const uploadMiddleware = upload.array('images', 10); // Allow up to 10 images
const promisifiedUploadMiddleware = (req, res) => {
    return new Promise((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Create a new property listing
exports.createProperty = async (req, res) => {
    try {
        // Use multer to handle the file uploads
        await promisifiedUploadMiddleware(req, res);

        // Verify user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized. Please login.' });
        }

        // Check if images were provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required for the property listing.' });
        }

        // Extract property data from request body
        const { title, description, price, address, city, state, postalCode, country, propertyType, bedrooms, bathrooms, squareFootage } = req.body;

        // Basic validation
        if (!title || !description || !price || !address || !city) {
            return res.status(400).json({ message: 'Missing required property information.' });
        }

        // Upload each image to S3 and collect their keys
        const imageS3Keys = [];
        const imageUploadPromises = req.files.map(async (file) => {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const key = `properties/${uuidv4()}${fileExtension}`;

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            const uploadResult = await s3.upload(params).promise();
            imageS3Keys.push(key);
            return uploadResult;
        });

        // Wait for all images to be uploaded
        await Promise.all(imageUploadPromises);

        // Generate property ID
        const propertyID = uuidv4();
        
        // Create property object
        const property = {
            PropertyID: propertyID,
            OwnerID: req.user.id,
            Title: title,
            Description: description,
            Price: parseFloat(price),
            Address: address,
            City: city,
            State: state || "",
            PostalCode: postalCode || "",
            Country: country || "Philippines",
            PropertyType: propertyType || "Residential",
            Bedrooms: bedrooms ? parseInt(bedrooms) : 0,
            Bathrooms: bathrooms ? parseFloat(bathrooms) : 0,
            SquareFootage: squareFootage ? parseFloat(squareFootage) : 0,
            ImageS3Keys: imageS3Keys,
            Status: "Active",
            ListingAgentID: null, // Initially null, will be set when an agent takes the listing
            CreationDate: new Date().toISOString(),
            LastUpdated: new Date().toISOString()
        };

        // Save property to DynamoDB
        const params = {
            TableName: PROPERTY_TABLE,
            Item: property
        };

        await dynamoDbClient.put(params).promise();

        res.status(201).json({
            message: 'Property listing created successfully.',
            property: {
                propertyID,
                title,
                price,
                images: imageS3Keys.map(key => `${process.env.S3_BASE_URL}/${key}`) // Generate URLs for frontend
            }
        });

    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Server error during property creation.', error: error.message });
    }
};

// Get all properties (with basic filtering)
exports.getAllProperties = async (req, res) => {
    try {
        // Basic query parameters for filtering
        const { city, minPrice, maxPrice, propertyType, status } = req.query;

        // Prepare scan parameters
        let filterExpressions = [];
        let expressionAttributeValues = {};
        let expressionAttributeNames = {};

        // Add filters if provided
        if (city) {
            filterExpressions.push('#city = :city');
            expressionAttributeNames['#city'] = 'City';
            expressionAttributeValues[':city'] = city;
        }

        if (propertyType) {
            filterExpressions.push('#propType = :propType');
            expressionAttributeNames['#propType'] = 'PropertyType';
            expressionAttributeValues[':propType'] = propertyType;
        }

        if (status) {
            filterExpressions.push('#status = :status');
            expressionAttributeNames['#status'] = 'Status';
            expressionAttributeValues[':status'] = status;
        }

        if (minPrice) {
            filterExpressions.push('#price >= :minPrice');
            expressionAttributeNames['#price'] = 'Price';
            expressionAttributeValues[':minPrice'] = parseFloat(minPrice);
        }

        if (maxPrice) {
            filterExpressions.push('#price <= :maxPrice');
            expressionAttributeNames['#price'] = 'Price';
            expressionAttributeValues[':maxPrice'] = parseFloat(maxPrice);
        }

        // Build scan parameters
        const scanParams = {
            TableName: PROPERTY_TABLE
        };

        // Add filter expressions if any exist
        if (filterExpressions.length > 0) {
            scanParams.FilterExpression = filterExpressions.join(' AND ');
            scanParams.ExpressionAttributeValues = expressionAttributeValues;
            scanParams.ExpressionAttributeNames = expressionAttributeNames;
        }

        // Perform the scan
        const result = await dynamoDbClient.scan(scanParams).promise();

        // Transform the data for the frontend and add S3 URLs
        const propertiesWithUrls = await Promise.all(result.Items.map(async (item) => {
            let imageUrls = [];
            
            if (item.ImageS3Keys && item.ImageS3Keys.length > 0) {
                const s3BaseUrl = process.env.S3_BASE_URL || '';
                
                // Make sure we have a valid S3 base URL
                if (s3BaseUrl) {
                    // Get presigned URL for just the first image (thumbnail)
                    try {
                        const params = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: item.ImageS3Keys[0],
                            Expires: 1800 // 30 minutes
                        };
                        
                        const url = await s3.getSignedUrlPromise('getObject', params);
                        imageUrls = [url];
                    } catch (err) {
                        console.error(`Error creating presigned URL for thumbnail:`, err);
                        imageUrls = [];
                    }
                }
            }
            
            return {
                ...item,
                imageUrls
            };
        }));

        res.status(200).json({
            properties: propertiesWithUrls,
            count: propertiesWithUrls.length
        });

    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error fetching properties.', error: error.message });
    }
};

// Get a single property by ID
exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Property ID is required.' });
        }

        const params = {
            TableName: PROPERTY_TABLE,
            Key: { PropertyID: id }
        };

        const result = await dynamoDbClient.get(params).promise();

        if (!result.Item) {
            return res.status(404).json({ message: 'Property not found.' });
        }

        // Add image URLs for frontend - handle errors more gracefully
        let imageUrls = [];
        if (result.Item.ImageS3Keys && result.Item.ImageS3Keys.length > 0) {
            const s3BaseUrl = process.env.S3_BASE_URL || '';
            
            // Make sure we have a valid S3 base URL
            if (s3BaseUrl) {
                // Create pre-signed URLs for each image with 30-minute expiration
                imageUrls = await Promise.all(result.Item.ImageS3Keys.map(async (key) => {
                    try {
                        const params = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: key,
                            Expires: 1800 // 30 minutes
                        };
                        
                        return await s3.getSignedUrlPromise('getObject', params);
                    } catch (err) {
                        console.error(`Error creating presigned URL for key ${key}:`, err);
                        // Return a fallback URL or null in case of failure
                        return null;
                    }
                }));
                
                // Filter out any null values from failed URL generation
                imageUrls = imageUrls.filter(url => url !== null);
            } else {
                console.warn('S3_BASE_URL not configured. Image URLs will not be generated.');
            }
        }

        const property = {
            ...result.Item,
            imageUrls
        };

        res.status(200).json(property);

    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Server error fetching property.', error: error.message });
    }
}; 