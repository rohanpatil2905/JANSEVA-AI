// middleware/auth.js
// JWT authentication + role/service authorization helpers.

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to do this' });
        }
        next();
    };
}

// AI service can authenticate with a private service key. Officer/admin JWTs
// remain supported for hackathon/manual testing.
function requireAIServiceOrRole(...roles) {
    return (req, res, next) => {
        const configuredKey = process.env.AI_SERVICE_API_KEY;
        const suppliedKey = req.get('x-ai-service-key');

        if (configuredKey && suppliedKey) {
            const a = Buffer.from(suppliedKey);
            const b = Buffer.from(configuredKey);
            if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                req.isAIService = true;
                return next();
            }
        }

        if (req.user && roles.includes(req.user.role)) return next();
        return res.status(403).json({ error: 'AI service or authorized officer/admin access required' });
    };
}

function requireAuthOrAIService(...roles) {
    return (req, res, next) => {
        const configuredKey = process.env.AI_SERVICE_API_KEY;
        const suppliedKey = req.get('x-ai-service-key');
        if (configuredKey && suppliedKey) {
            const a = Buffer.from(suppliedKey);
            const b = Buffer.from(configuredKey);
            if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                req.isAIService = true;
                return next();
            }
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'AI service key or Bearer token required' });
        }
        try {
            req.user = jwt.verify(authHeader.slice(7).trim(), JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to do this' });
        next();
    };
}

module.exports = { requireAuth, requireRole, requireAIServiceOrRole, requireAuthOrAIService };
