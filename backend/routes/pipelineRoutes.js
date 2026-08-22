const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth, requireRole, requireAuthOrAIService } = require('../middleware/auth');
const { getComplaintForRequest, requireComplaintAccess } = require('../middleware/complaintAccess');
const { addPrediction, addSeverityScore, addAuthenticityResult, addRoutingResult, addOfficerReview, setSla, getAuditTrail, getFullComplaintView, markDuplicate, getDuplicates } = require('../controllers/pipelineController');

// AI writes: service key is preferred; officer/admin JWT remains available for manual demo/testing.
router.post('/ai-prediction', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addPrediction);
router.post('/severity', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addSeverityScore);
router.post('/authenticity', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addAuthenticityResult);
router.post('/routing', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addRoutingResult);
router.post('/sla', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, setSla);
router.post('/duplicate', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, markDuplicate);

router.use(requireAuth);
router.post('/review', requireRole('officer', 'admin'), getComplaintForRequest, requireComplaintAccess, addOfficerReview);
router.get('/audit', getComplaintForRequest, requireComplaintAccess, getAuditTrail);
router.get('/full', getComplaintForRequest, requireComplaintAccess, getFullComplaintView);
router.get('/duplicates', getComplaintForRequest, requireComplaintAccess, getDuplicates);

module.exports = router;
