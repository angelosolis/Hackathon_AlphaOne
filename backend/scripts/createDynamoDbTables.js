require('dotenv').config({ path: '../.env' }); // Load .env file from root
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const dynamoDb = new AWS.DynamoDB(); // Use DynamoDB service object

const tables = [
    {
        TableName: "Hackathon_Users", // Using prefixed names
        KeySchema: [{ AttributeName: "UserID", KeyType: "HASH" }], // Partition key
        AttributeDefinitions: [{ AttributeName: "UserID", AttributeType: "S" }],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 } // Minimal throughput for free tier
    },
    {
        TableName: "Hackathon_Properties",
        KeySchema: [{ AttributeName: "PropertyID", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "PropertyID", AttributeType: "S" }],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    },
    {
        TableName: "Hackathon_ListingApplications",
        KeySchema: [
            { AttributeName: "PropertyID", KeyType: "HASH" }, // Partition key
            { AttributeName: "AgentID", KeyType: "RANGE" }   // Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "PropertyID", AttributeType: "S" },
            { AttributeName: "AgentID", AttributeType: "S" }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    },
    {
        TableName: "Hackathon_Offers",
        KeySchema: [
            { AttributeName: "PropertyID", KeyType: "HASH" },
            { AttributeName: "BuyerID", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "PropertyID", AttributeType: "S" },
            { AttributeName: "BuyerID", AttributeType: "S" }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    },
    {
        TableName: "Hackathon_Messages",
        KeySchema: [
            { AttributeName: "ConversationID", KeyType: "HASH" },
            { AttributeName: "Timestamp#MessageID", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "ConversationID", AttributeType: "S" },
            { AttributeName: "Timestamp#MessageID", AttributeType: "S" }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    },
    {
        TableName: "Hackathon_Reviews",
        KeySchema: [
            { AttributeName: "ReviewedEntityID", KeyType: "HASH" },
            { AttributeName: "ReviewerID#PropertyID", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "ReviewedEntityID", AttributeType: "S" },
            { AttributeName: "ReviewerID#PropertyID", AttributeType: "S" }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }
];

console.log("Attempting to create DynamoDB tables...");

tables.forEach(tableParams => {
    dynamoDb.createTable(tableParams, (err, data) => {
        if (err) {
            if (err.code === "ResourceInUseException") {
                console.log(`Table ${tableParams.TableName} already exists. Skipping.`);
            } else {
                console.error(`Unable to create table ${tableParams.TableName}. Error JSON:`, JSON.stringify(err, null, 2));
            }
        } else {
            console.log(`Created table ${tableParams.TableName}. Table description JSON:`, JSON.stringify(data, null, 2));
        }
    });
}); 