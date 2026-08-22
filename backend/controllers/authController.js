// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// POST /api/auth/register
async function register(req, res) {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email and password are required' });
        }

        const allowOfficerRegistration = process.env.ALLOW_OFFICER_REGISTRATION === 'true';
        if (role === 'officer' && !allowOfficerRegistration) {
            return res.status(403).json({ error: 'Officer accounts must be created by an administrator' });
        }
        const finalRole = role === 'officer' ? 'officer' : 'citizen';

        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
             VALUES ($1, $2, $3, $4, $5, FALSE)
             RETURNING id, name, email, phone, role, is_verified, created_at`,
            [name, email, phone || null, password_hash, finalRole]
        );

        const user = result.rows[0];

        // Officer self-registration is disabled by default. If explicitly enabled
        // for a local demo, department/designation can be supplied here.
        if (finalRole === 'officer') {
            const { department_id, designation } = req.body;
            await pool.query(
                `INSERT INTO officers (user_id, department_id, designation) VALUES ($1, $2, $3)`,
                [user.id, department_id || null, designation || null]
            );
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        return res.status(201).json({ user, token });
    } catch (err) {
        console.error('register error:', err);
        return res.status(500).json({ error: 'Something went wrong while registering' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        delete user.password_hash;

        return res.json({ user, token });
    } catch (err) {
        console.error('login error:', err);
        return res.status(500).json({ error: 'Something went wrong while logging in' });
    }
}

module.exports = { register, login };
