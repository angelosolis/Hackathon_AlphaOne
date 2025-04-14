const express = require('express');
const propertyController = require('../controllers/propertyController');
const { protect, protectClient } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', propertyController.getAllProperties); // Get all properties (public)
router.get('/:id', propertyController.getPropertyById); // Get a single property by ID (public)

// Protected routes - require authentication
router.post('/', protectClient, propertyController.createProperty); // Only clients can create property listings

module.exports = router; 