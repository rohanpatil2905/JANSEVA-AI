// server.js
// JanSeva AI — backend entry point

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const gisRoutes = require('./routes/gisRoutes');
const slaRoutes = require('./routes/slaRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const pool = require('./db/pool');
const { startEscalationTimer } = require('./services/slaEscalation');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded complaint media (photos/videos/audio) statically
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// API root and health check — help discover valid routes during development
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'JanSeva AI API',
        routes: [
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'POST /api/complaints',
            'GET /api/complaints',
            'GET /api/complaints/:id',
            'PUT /api/complaints/:id/status',
            'GET /api/gis/hotspots',
            'GET /api/gis/points',
            'GET /api/gis/nearby'
        ]
    });
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'ok',
            message: 'JanSeva AI backend is running',
            database: 'connected',
            postgres: true
        });
    } catch (err) {
        res.status(503).json({
            status: 'degraded',
            message: 'JanSeva AI backend is running but PostgreSQL is unavailable',
            database: 'disconnected',
            postgres: false,
            error: err.message
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/complaints/:id', pipelineRoutes);
app.use('/api/gis', gisRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.originalUrl,
        hint: 'Use GET /api or GET /api/health to list valid API routes.'
    });
});

// Generic error handler (catches anything thrown synchronously)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`JanSeva AI backend listening on http://localhost:${PORT}`);
    startEscalationTimer(); // background SLA breach sweep — see services/slaEscalation.js
});
