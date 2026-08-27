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
    '/:id/resolve',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    async (req, res) => {
        try {
            const {
                resolution_scope,
                resolution_summary,
                technical_actions,
                rectified_area_coverage,
                statutory_confirmation
            } = req.body;

            if (!resolution_summary) {
                return res.status(400).json({
                    error: 'Resolution summary is required'
                });
            }

            if (!technical_actions) {
                return res.status(400).json({
                    error: 'Technical actions are required'
                });
            }

            if (req.complaint.status !== 'in_progress') {
                return res.status(400).json({
                    error: `Complaint must be in_progress before resolution. Current status: ${req.complaint.status}`
                });
            }

            if (!statutory_confirmation) {
                return res.status(400).json({
                    error: 'Statutory officer confirmation is required'
                });
            }

            const result = await pool.query(
                `UPDATE complaints
                 SET status = 'resolved',
                     updated_at = NOW()
                 WHERE id = $1
                 RETURNING *`,
                [req.complaint.id]
            );

            await logAudit(
                req.complaint.id,
                req.user.id,
                'RESOLUTION_SUBMITTED',
                {
                    resolution_scope: resolution_scope || null,
                    resolution_summary,
                    technical_actions,
                    rectified_area_coverage: rectified_area_coverage || null,
                    statutory_confirmation: true
                }
            );

            return res.json({
                success: true,
                message: 'Resolution recorded successfully',
                complaint: result.rows[0]
            });

        } catch (err) {
            console.error('resolve complaint error:', err);
            return res.status(500).json({
                error: 'Something went wrong while recording resolution'
            });
        }
    }
);
router.post(
    '/:id/confirm-resolution',
    requireRole('citizen'),
    getComplaintForRequest,
    requireComplaintAccess,
    confirmResolution
);


module.exports = router;