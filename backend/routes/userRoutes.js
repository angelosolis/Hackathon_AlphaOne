const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', protect, userController.getUserProfile);
router.post('/upload-id-document', protect, userController.uploadIdDocument);

module.exports = router; 