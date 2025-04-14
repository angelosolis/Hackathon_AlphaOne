const express = require('express');
const { requestAppointment, getAgentAppointments, updateAppointment } = require('../controllers/appointmentController');
// Assuming you have protect (for any logged-in user) and protectAgent (for agent role)
const { protect, protectAgent } = require('../middleware/authMiddleware'); 

const router = express.Router();

// POST /api/appointments - Request a new appointment (any logged-in user)
router.post('/', protect, requestAppointment); 

// GET /api/appointments/agent - Get appointments for agent dashboard (agent only)
router.get('/agent', protectAgent, getAgentAppointments); 

// PUT /api/appointments/:appointmentId - Update an appointment (agent only)
router.put('/:appointmentId', protectAgent, updateAppointment); 

module.exports = router;