const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getOfficerAnalytics, getComplaintTimeline, getAuditTrail, getNotifications } = require('../controllers/analyticsController');

router.use(requireAuth);
router.get('/officer-analytics', requireRole('officer', 'admin'), getOfficerAnalytics);
router.get('/notifications', requireRole('officer', 'admin'), getNotifications);
router.get('/complaints/:id/timeline', requireRole('officer', 'admin'), getComplaintTimeline);
router.get('/complaints/:id/audit', requireRole('officer', 'admin'), getAuditTrail);

module.exports = router;
