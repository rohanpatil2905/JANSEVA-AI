// routes/gisRoutes.js
// Mounted at /api/gis — map/hotspot views for the officer dashboard, and
// nearby-complaint lookup usable by both citizens and officers.

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getHotspots, getHeatmapPoints, getNearby } = require('../controllers/gisController');

// All GIS routes require a logged-in user (citizen or officer) — no
// role restriction, since "nearby complaints" is useful to citizens too
// (e.g. "this looks like it may already be reported") and the hotspot/
// heatmap views are read-only aggregates, not sensitive per-user data.
router.use(requireAuth);

router.get('/hotspots', getHotspots);
router.get('/points', getHeatmapPoints);
router.get('/nearby', getNearby);

module.exports = router;
