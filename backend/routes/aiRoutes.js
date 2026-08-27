const express = require('express');
const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

const {
    analyzeComplaint,
    getAiHealth,
    getAiJobStatus,
    getAiRecommendations
} = require('../controllers/aiController');

router.get('/health', getAiHealth);

router.get(
    '/jobs/:complaintId',
    requireAuth,
    getAiJobStatus
);

router.post(
    '/analyze',
    requireAuth,
    analyzeComplaint
);

// AI recommendations used by Officer Console
router.get(
    '/recommendations/:complaintId',
    requireAuth,
    requireRole('officer', 'admin'),
    getAiRecommendations
);

module.exports = router;