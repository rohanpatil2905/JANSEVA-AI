// routes/slaRoutes.js
// Mounted at /api/sla — manual trigger for the escalation sweep that
// otherwise runs automatically on a timer (see services/slaEscalation.js).
// Useful for demos: don't wait 5 minutes to show escalation working.

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { runEscalationSweep, getComplaintSlaStatus } = require('../services/slaEscalation');

router.use(requireAuth);

router.get('/:complaintId', async (req, res) => {
    try {
        const status = await getComplaintSlaStatus(req.params.complaintId);
        return res.json({ sla: status });
    } catch (err) {
        console.error('get-sla-status error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching SLA status' });
    }
});

router.get('/:complaintId/escalations', async (req, res) => {
    try {
        const sla = await getComplaintSlaStatus(req.params.complaintId);
        return res.json({ complaint_id: req.params.complaintId, escalations: sla.escalations || [] });
    } catch (err) {
        console.error('get-sla-escalations error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching escalation history' });
    }
});

// POST /api/sla/check-escalations
router.post('/check-escalations', requireRole('officer', 'admin'), async (req, res) => {
    try {
        const escalated = await runEscalationSweep();
        return res.json({ escalated_count: escalated.length, escalated });
    } catch (err) {
        console.error('check-escalations error:', err);
        return res.status(500).json({ error: 'Something went wrong while checking SLA escalations' });
    }
});

module.exports = router;
