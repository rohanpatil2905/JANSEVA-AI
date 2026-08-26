const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { analyzeComplaint, getAiHealth, getAiJobStatus } = require('../controllers/aiController');

router.get('/health', getAiHealth);
router.get('/jobs/:complaintId', requireAuth, getAiJobStatus);
router.post('/analyze', requireAuth, analyzeComplaint);

module.exports = router;
