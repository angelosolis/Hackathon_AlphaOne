const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
    let token;
    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user id and type to the request object (excluding sensitive info)
            // We might fetch the full user from DB here in a real app, but for hackathon, token payload is enough
            req.user = { id: decoded.id, type: decoded.type };

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Optional: Middleware to restrict routes to specific user types (e.g., Agents only)
const protectAgent = (req, res, next) => {
    protect(req, res, () => { // Run the standard protect middleware first
        if (req.user && req.user.type === 'Agent') {
            next(); // User is logged in and is an Agent
        } else {
            res.status(403).json({ message: 'Not authorized as an Agent' }); // Forbidden
        }
    });
};

const protectClient = (req, res, next) => {
    protect(req, res, () => {
        if (req.user && req.user.type === 'Client') {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as a Client' });
        }
    });
};

module.exports = { protect, protectAgent, protectClient };