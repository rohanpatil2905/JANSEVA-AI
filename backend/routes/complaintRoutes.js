const express = require('express');

const router = express.Router();

const {
    requireAuth,
    requireRole
} = require('../middleware/auth');

const {
    getComplaintForRequest,
    requireComplaintAccess
} = require('../middleware/complaintAccess');

const {
    upload
} = require('../middleware/upload');

const {
    createComplaint,
    submitVoiceComplaint,
    translateOfficerResponse,
    listComplaints,
    getComplaint,
    updateStatus,
    assignComplaint,
    addMedia,
    uploadMedia,
    confirmResolution
} = require('../controllers/complaintController');

const {
    listMasterIssues,
    getPendingReviews
} = require('../controllers/pipelineController');

const {
    getComplaintMap,
    getComplaintHotspots,
    getComplaintLocation
} = require('../controllers/gisController');


/*
 * All complaint routes require authentication.
 */
router.use(requireAuth);


/*
 * Citizen complaint creation.
 */
router.post(
    '/',
    requireRole('citizen'),
    createComplaint
);

router.post(
    '/voice',
    requireRole('citizen'),
    submitVoiceComplaint
);


/*
 * Officer response translation.
 */
router.post(
    '/:id/translate-response',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    translateOfficerResponse
);


/*
 * Complaint listing.
 */
router.get(
    '/',
    listComplaints
);


/*
 * GIS endpoints.
 */
router.get(
    '/map',
    getComplaintMap
);

router.get(
    '/hotspots',
    getComplaintHotspots
);


/*
 * Pipeline/master issue endpoints.
 */
router.get(
    '/master-issues',
    listMasterIssues
);

router.get(
    '/pending-reviews',
    requireRole('officer', 'admin'),
    getPendingReviews
);


/*
 * Individual complaint location.
 */
router.get(
    '/:id/location',
    getComplaintForRequest,
    requireComplaintAccess,
    getComplaintLocation
);


/*
 * Individual complaint.
 */
router.get(
    '/:id',
    getComplaintForRequest,
    requireComplaintAccess,
    getComplaint
);


/*
 * Update complaint status.
 */
router.put(
    '/:id/status',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    updateStatus
);


/*
 * ASSIGN COMPLAINT
 *
 * POST
 * /api/complaints/:id/assign
 *
 * This was the missing endpoint that caused:
 *
 * POST .../assign
 * 404 Route not found
 */
router.post(
    '/:id/assign',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    assignComplaint
);


/*
 * Complaint media.
 */
router.post(
    '/:id/media',
    getComplaintForRequest,
    requireComplaintAccess,
    addMedia
);

router.post(
    '/:id/media/upload',
    getComplaintForRequest,
    requireComplaintAccess,
    (req, res, next) =>
        upload.single('file')(
            req,
            res,
            err =>
                err
                    ? res.status(400).json({
                        error: err.message
                    })
                    : next()
        ),
    uploadMedia
);


/*
 * Citizen confirms/rejects resolution.
 */
router.post(
    '/:id/confirm-resolution',
    requireRole('citizen'),
    getComplaintForRequest,
    requireComplaintAccess,
    confirmResolution
);


module.exports = router;