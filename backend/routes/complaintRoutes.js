const express = require('express');
const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');
const {
    getComplaintForRequest,
    requireComplaintAccess
} = require('../middleware/complaintAccess');

const { upload } = require('../middleware/upload');

const {
    createComplaint,
    submitVoiceComplaint,
    translateOfficerResponse,
    listComplaints,
    getComplaint,
    updateStatus,
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

const pool = require('../db/pool');
const { logAudit } = require('../db/auditLog');


// ============================================================
// AUTH
// ============================================================

router.use(requireAuth);


// ============================================================
// CREATE COMPLAINT
// ============================================================

router.post(
    '/',
    requireRole('citizen'),
    createComplaint
);


// ============================================================
// VOICE COMPLAINT
// ============================================================

router.post(
    '/voice',
    requireRole('citizen'),
    submitVoiceComplaint
);


// ============================================================
// TRANSLATE OFFICER RESPONSE
// ============================================================

router.post(
    '/:id/translate-response',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    translateOfficerResponse
);


// ============================================================
// LIST COMPLAINTS
// ============================================================

router.get(
    '/',
    listComplaints
);


// ============================================================
// GIS
// ============================================================

router.get(
    '/map',
    getComplaintMap
);

router.get(
    '/hotspots',
    getComplaintHotspots
);


// ============================================================
// MASTER ISSUES
// ============================================================

router.get(
    '/master-issues',
    listMasterIssues
);

router.get(
    '/pending-reviews',
    requireRole('officer', 'admin'),
    getPendingReviews
);


// ============================================================
// LOCATION
// ============================================================

router.get(
    '/:id/location',
    getComplaintForRequest,
    requireComplaintAccess,
    getComplaintLocation
);


// ============================================================
// UPDATE STATUS
// ============================================================

router.put(
    '/:id/status',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    updateStatus
);


// ============================================================
// RESOLUTION
// POST /api/complaints/:id/resolve
// ============================================================

router.post(
    '/:id/resolve',
    requireRole('officer', 'admin'),
    getComplaintForRequest,
    requireComplaintAccess,
    async (req, res) => {
        try {
            const {
                resolution_scope,
                resolution_type,
                resolutionType,

                resolution_summary,
                resolutionSummary,
                summary,

                technical_actions,
                technicalActions,
                actions_taken,
                actionsTaken,

                rectified_area_coverage,
                rectifiedAreaCoverage,
                affected_area,
                affectedArea,

                statutory_confirmation,
                statutoryConfirmation,
                statutory_officer_confirmation,
                statutoryOfficerConfirmation,
                is_confirmed,
                isConfirmed
            } = req.body || {};


            // ------------------------------------------------
            // Normalize frontend field names
            // ------------------------------------------------

            const finalResolutionSummary =
                resolution_summary ||
                resolutionSummary ||
                summary;

            const finalTechnicalActions =
                technical_actions ||
                technicalActions ||
                actions_taken ||
                actionsTaken ||
                null;

            const finalRectifiedAreaCoverage =
                rectified_area_coverage ||
                rectifiedAreaCoverage ||
                affected_area ||
                affectedArea ||
                null;

            const rawStatutoryConfirmation =
                statutory_confirmation !== undefined ? statutory_confirmation :
                statutoryConfirmation !== undefined ? statutoryConfirmation :
                statutory_officer_confirmation !== undefined ? statutory_officer_confirmation :
                statutoryOfficerConfirmation !== undefined ? statutoryOfficerConfirmation :
                is_confirmed !== undefined ? is_confirmed :
                isConfirmed !== undefined ? isConfirmed :
                false;

            const finalStatutoryConfirmation =
                rawStatutoryConfirmation === true ||
                rawStatutoryConfirmation === 'true' ||
                rawStatutoryConfirmation === 1 ||
                rawStatutoryConfirmation === '1';


            // ------------------------------------------------
            // REQUIRED VALIDATION
            // ------------------------------------------------

            if (!finalResolutionSummary) {
                return res.status(400).json({
                    error: 'Resolution summary is required'
                });
            }

            if (!finalStatutoryConfirmation) {
                return res.status(400).json({
                    error: 'Statutory officer confirmation is required'
                });
            }


            // ------------------------------------------------
            // STATUS CHECK
            // ------------------------------------------------

            if (req.complaint.status !== 'in_progress') {
                return res.status(400).json({
                    error:
                        `Complaint must be in_progress before resolution. ` +
                        `Current status: ${req.complaint.status}`
                });
            }


            // ------------------------------------------------
            // MARK COMPLAINT AS RESOLVED
            // ------------------------------------------------

            const result = await pool.query(
                `
                UPDATE complaints
                SET
                    status = 'resolved',
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
                `,
                [req.complaint.id]
            );


            // ------------------------------------------------
            // AUDIT
            // ------------------------------------------------

            await logAudit(
                req.complaint.id,
                req.user.id,
                'RESOLUTION_SUBMITTED',
                {
                    resolution_scope:
                        resolution_scope ||
                        resolution_type ||
                        resolutionType ||
                        null,

                    resolution_summary:
                        finalResolutionSummary,

                    technical_actions:
                        finalTechnicalActions,

                    rectified_area_coverage:
                        finalRectifiedAreaCoverage,

                    statutory_confirmation:
                        finalStatutoryConfirmation
                }
            );


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.json({
                success: true,
                message: 'Resolution recorded successfully',
                complaint: result.rows[0]
            });

        } catch (err) {
            console.error(
                'resolve complaint error:',
                err
            );

            return res.status(500).json({
                error:
                    'Something went wrong while recording resolution'
            });
        }
    }
);


// ============================================================
// GET SINGLE COMPLAINT
// ============================================================

router.get(
    '/:id',
    getComplaintForRequest,
    requireComplaintAccess,
    getComplaint
);


// ============================================================
// MEDIA URL
// ============================================================

router.post(
    '/:id/media',
    getComplaintForRequest,
    requireComplaintAccess,
    addMedia
);


// ============================================================
// MEDIA UPLOAD
// ============================================================

router.post(
    '/:id/media/upload',
    getComplaintForRequest,
    requireComplaintAccess,
    (req, res, next) =>
        upload.single('file')(
            req,
            res,
            err => {
                if (err) {
                    return res.status(400).json({
                        error: err.message
                    });
                }

                next();
            }
        ),
    uploadMedia
);


// ============================================================
// CITIZEN CONFIRM RESOLUTION
// ============================================================

router.post(
    '/:id/confirm-resolution',
    requireRole('citizen'),
    getComplaintForRequest,
    requireComplaintAccess,
    confirmResolution
);


module.exports = router;