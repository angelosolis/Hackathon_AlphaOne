const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); // Ensure environment variables are loaded

// Configure AWS SDK (Credentials should be configured via environment variables or IAM roles)
AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
// Ensure you have DYNAMODB_APPOINTMENTS_TABLE in your backend .env file
const APPOINTMENT_TABLE = process.env.DYNAMODB_APPOINTMENTS_TABLE || "Hackathon_Appointments"; 

/**
 * @desc    Request a new appointment viewing
 * @route   POST /api/appointments
 * @access  Private (User must be logged in)
 */
exports.requestAppointment = async (req, res) => {
    try {
        // propertyId, requestedDate, requestedTime should come from frontend
        // 'notes' is optional
        const { propertyId, requestedDate, requestedTime, notes } = req.body;
        // clientId comes from the authentication middleware (req.user)
        const clientId = req.user?.id; 

        if (!clientId) {
            console.error("Authentication error: req.user or req.user.id not found.");
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!propertyId || !requestedDate || !requestedTime) {
            return res.status(400).json({ message: 'Missing required fields: propertyId, requestedDate, requestedTime.' });
        }

        // Validate date/time format if necessary before creating Date object
        let requestedDateTime;
        try {
            // Basic check: Ensure time format is somewhat valid (HH:MM)
            if (!/^[0-2][0-9]:[0-5][0-9]$/.test(requestedTime)) {
               throw new Error("Invalid time format. Use HH:MM.");
            }
            requestedDateTime = new Date(`${requestedDate}T${requestedTime}:00`).toISOString();
            // Check if date is valid after parsing
            if (isNaN(new Date(requestedDateTime).getTime())) {
                throw new Error("Invalid date/time combination.");
            }
        } catch (dateError) {
             console.error("Invalid date/time format:", dateError.message);
             return res.status(400).json({ message: `Invalid date/time provided. ${dateError.message}` });
        }


        const appointmentID = uuidv4();

        const appointmentItem = {
            AppointmentID: appointmentID,          // PK
            PropertyID: propertyId,
            ClientID: clientId,
            RequestedDateTime: requestedDateTime,  // Consider using this as SK or part of GSI SK
            Status: 'Requested',                   // Initial status
            Type: 'Viewing',                       // Defaulting to Viewing for now
            Notes: notes || '',                    // Optional notes from user/AI
            AgentID: null,                         // Initially unassigned
            CreationDate: new Date().toISOString(),
            // Example SK: `STATUS#Requested#DATETIME#${requestedDateTime}` 
            // Example GSI PK/SK for Agent: PK=AgentID, SK=Status#RequestedDateTime
        };

        const params = {
            TableName: APPOINTMENT_TABLE,
            Item: appointmentItem,
            ConditionExpression: "attribute_not_exists(AppointmentID)" // Ensure ID is unique
        };

        console.log("Attempting to save appointment:", JSON.stringify(appointmentItem, null, 2));
        await dynamoDbClient.put(params).promise();
        console.log("Appointment saved successfully:", appointmentID);

        res.status(201).json({
            message: 'Appointment requested successfully.',
            appointment: {
                appointmentId: appointmentID,
                propertyId: propertyId,
                requestedDateTime: requestedDateTime,
                status: 'Requested'
            }
        });

    } catch (error) {
        console.error('Error requesting appointment:', error);
        if (error.code === 'ConditionalCheckFailedException') {
             return res.status(409).json({ message: 'Appointment ID conflict. Please try again.' });
        }
        // Add more specific error checks if needed (e.g., DynamoDB access errors)
        res.status(500).json({ message: 'Server error requesting appointment.', error: error.message });
    }
};

/**
 * @desc    Get appointments (for agent dashboard)
 * @route   GET /api/appointments/agent
 * @access  Private (Agent Only)
 */
exports.getAgentAppointments = async (req, res) => {
    // Placeholder - Full implementation needed for agent dashboard
    // Need to query DynamoDB, potentially using a GSI on Status or AgentID
    console.log("Agent appointment retrieval requested by:", req.user?.id); 
    // Example Scan (less efficient for large tables, use Query with Index in production)
    const params = {
        TableName: APPOINTMENT_TABLE,
        // Example: FilterExpression: '#status = :statusVal',
        // ExpressionAttributeNames: {'#status': 'Status'},
        // ExpressionAttributeValues: {':statusVal': 'Requested'}
    };
    try {
         const result = await dynamoDbClient.scan(params).promise();
         res.status(200).json({ appointments: result.Items || [], count: result.Count });
    } catch(error) {
         console.error('Error fetching agent appointments:', error);
         res.status(500).json({ message: 'Server error fetching appointments.' });
    }
};

/**
 * @desc    Update appointment status or assign agent
 * @route   PUT /api/appointments/:appointmentId
 * @access  Private (Agent Only)
 */
exports.updateAppointment = async (req, res) => {
     // Placeholder - Full implementation needed
     const { appointmentId } = req.params;
     // Get agentId from authenticated agent user
     const agentId = req.user?.id; 
     const { status, notes } = req.body; // Allow updating status and maybe adding agent notes

     if (!agentId) {
          return res.status(401).json({ message: 'Agent not authenticated.' });
     }
     if (!status) { // Require at least status update
          return res.status(400).json({ message: 'Status is required for update.' });
     }
     // Validate status value if needed ('Confirmed', 'Cancelled', 'Completed')

     const params = {
         TableName: APPOINTMENT_TABLE,
         Key: { AppointmentID: appointmentId },
         UpdateExpression: "set #status = :s, AgentID = :a, LastUpdated = :lu", 
         // Add notes update if provided: ", AgentNotes = :n"
         ExpressionAttributeNames: {
             '#status': 'Status' 
         },
         ExpressionAttributeValues: {
             ":s": status,
             ":a": agentId, // Assign the agent confirming/cancelling
             ":lu": new Date().toISOString()
             // if notes: ":n": notes || '' 
         },
         ReturnValues: "UPDATED_NEW" // Return the updated item attributes
     };

     try {
         const result = await dynamoDbClient.update(params).promise();
         res.status(200).json({ 
             message: `Appointment ${appointmentId} updated successfully.`,
             updatedAttributes: result.Attributes 
         });
     } catch(error) {
         console.error(`Error updating appointment ${appointmentId}:`, error);
         // Handle potential errors like item not found
         res.status(500).json({ message: 'Server error updating appointment.' });
     }
};