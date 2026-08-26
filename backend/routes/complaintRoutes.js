const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getComplaintForRequest, requireComplaintAccess } = require('../middleware/complaintAccess');
const { upload } = require('../middleware/upload');
const { createComplaint, submitVoiceComplaint, translateOfficerResponse, listComplaints, getComplaint, updateStatus, addMedia, uploadMedia, confirmResolution } = require('../controllers/complaintController');
const { listMasterIssues, getPendingReviews } = require('../controllers/pipelineController');
const { getComplaintMap, getComplaintHotspots, getComplaintLocation } = require('../controllers/gisController');

router.use(requireAuth);
router.post('/', requireRole('citizen'), createComplaint);
router.post('/voice', requireRole('citizen'), submitVoiceComplaint);
router.post('/:id/translate-response', requireRole('officer', 'admin'), getComplaintForRequest, requireComplaintAccess, translateOfficerResponse);
router.get('/', listComplaints);
router.get('/map', getComplaintMap);
router.get('/hotspots', getComplaintHotspots);
router.get('/master-issues', listMasterIssues);
router.get('/pending-reviews', requireRole('officer', 'admin'), getPendingReviews);
router.get('/:id/location', getComplaintForRequest, requireComplaintAccess, getComplaintLocation);
router.get('/:id', getComplaintForRequest, requireComplaintAccess, getComplaint);
router.put('/:id/status', requireRole('officer', 'admin'), getComplaintForRequest, requireComplaintAccess, updateStatus);
router.post('/:id/media', getComplaintForRequest, requireComplaintAccess, addMedia);
router.post('/:id/media/upload',
    getComplaintForRequest,
    requireComplaintAccess,
    (req, res, next) => upload.single('file')(req, res, err => err ? res.status(400).json({ error: err.message }) : next()),
    uploadMedia
);
router.post('/:id/confirm-resolution', requireRole('citizen'), getComplaintForRequest, requireComplaintAccess, confirmResolution);

module.exports = router;
