const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth, requireRole, requireAuthOrAIService } = require('../middleware/auth');
const { getComplaintForRequest, requireComplaintAccess } = require('../middleware/complaintAccess');
const { addPrediction, addSeverityScore, addAuthenticityResult, addRoutingResult, addOfficerReview, getPendingReviews, getReviewHistory, getXaiExplanation, setSla, getAuditTrail, getFullComplaintView, markDuplicate, getDuplicates, getMasterIssueForComplaint, refreshMasterIssue } = require('../controllers/pipelineController');
const { getComplaintSlaStatus } = require('../services/slaEscalation');

// AI writes: service key is preferred; officer/admin JWT remains available for manual demo/testing.
router.post('/ai-prediction', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addPrediction);
router.post('/severity', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addSeverityScore);
router.post('/authenticity', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addAuthenticityResult);
router.post('/routing', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, addRoutingResult);
router.post('/sla', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, setSla);
router.get('/sla', getComplaintForRequest, requireComplaintAccess, async (req, res) => {
    try {
        const sla = await getComplaintSlaStatus(req.params.id);
        return res.json({ sla });
    } catch (err) {
        console.error('get complaint sla error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching complaint SLA status' });
    }
});
router.post('/duplicate', requireAuthOrAIService('officer', 'admin'), getComplaintForRequest, markDuplicate);

router.use(requireAuth);
router.get('/pending-reviews', requireRole('officer', 'admin'), getPendingReviews);
router.post('/review', requireRole('officer', 'admin'), getComplaintForRequest, requireComplaintAccess, addOfficerReview);
router.get('/review-history', getComplaintForRequest, requireComplaintAccess, getReviewHistory);
router.get('/xai', getComplaintForRequest, requireComplaintAccess, getXaiExplanation);
router.get('/audit', getComplaintForRequest, requireComplaintAccess, getAuditTrail);
router.get('/full', getComplaintForRequest, requireComplaintAccess, getFullComplaintView);
router.get('/duplicates', getComplaintForRequest, requireComplaintAccess, getDuplicates);
router.get('/master-issue', getComplaintForRequest, requireComplaintAccess, getMasterIssueForComplaint);
router.post('/master-issue/refresh', requireRole('officer', 'admin'), getComplaintForRequest, requireComplaintAccess, refreshMasterIssue);

module.exports = router;
