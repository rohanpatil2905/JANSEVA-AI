const assert = require('node:assert/strict');
const { Pool } = require('pg');
const { submitVoiceComplaint, translateOfficerResponse } = require('../controllers/complaintController');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function ensureComplaintColumns() {
  await pool.query(`
    ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS language VARCHAR(20) NOT NULL DEFAULT 'en',
      ADD COLUMN IF NOT EXISTS original_language VARCHAR(20) NOT NULL DEFAULT 'en',
      ADD COLUMN IF NOT EXISTS original_text TEXT,
      ADD COLUMN IF NOT EXISTS transcript_text TEXT,
      ADD COLUMN IF NOT EXISTS translated_text TEXT,
      ADD COLUMN IF NOT EXISTS audio_reference TEXT,
      ADD COLUMN IF NOT EXISTS citizen_language VARCHAR(20) DEFAULT 'en',
      ADD COLUMN IF NOT EXISTS response_translation TEXT;
  `);
}

async function ensureUniqueUser(email, name, role = 'citizen') {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return existing.rows[0].id;
  const created = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id`,
    [name, email, '9999999999', 'placeholder-hash', role]
  );
  return created.rows[0].id;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  await ensureComplaintColumns();
  const citizenId = await ensureUniqueUser(`voice-citizen-${Date.now()}@example.com`, 'Voice Citizen');
  const audioUrl = 'https://example.com/uploads/ward12-water.wav';
  const transcript = 'Ward 12 mein paani nahi aa raha hai, do din se.';

  const req = {
    user: { id: citizenId },
    body: {
      audio_url: audioUrl,
      transcript,
      target_language: 'en',
    },
  };
  const res = makeRes();
  await submitVoiceComplaint(req, res);
  assert.equal(res.statusCode, 201, 'Voice complaint should be created successfully');

  const complaint = res.body.complaint;
  assert.equal(complaint.original_language, 'hi', 'Detected language should be Hindi');
  assert.equal(complaint.language, 'en', 'Backend processing language should be English');
  assert.equal(complaint.original_text, transcript, 'Original complaint transcript should be stored');
  assert.equal(complaint.audio_reference, audioUrl, 'Audio reference should be stored');
  assert.ok(complaint.translated_text && complaint.translated_text.length > 0, 'Translated text should be stored');
  assert.ok(complaint.translated_text.toLowerCase().includes('water') || complaint.translated_text.toLowerCase().includes('ward 12'), 'Translated complaint should be usable by the multilingual pipeline');
  assert.equal(complaint.provider_status || 'FALLBACK', 'FALLBACK', 'Without real translation credentials, provider must report fallback honestly');

  const responseReq = {
    params: { id: complaint.id },
    user: { id: citizenId },
    body: {
      note: 'Water pipeline inspection has been scheduled for tomorrow.',
      target_language: complaint.original_language,
    },
  };
  const responseRes = makeRes();
  await translateOfficerResponse(responseReq, responseRes);
  assert.equal(responseRes.statusCode, 200, 'Officer response translation should succeed');
  assert.equal(responseRes.body.target_language, 'hi', 'Officer response should translate back to the citizen language');
  assert.equal(responseRes.body.provider_status, 'FALLBACK', 'Translation fallback should remain honest when no real provider is configured');

  console.log('Multilingual complaint validation passed.');
  console.log(JSON.stringify({
    complaint_id: complaint.id,
    original_language: complaint.original_language,
    backend_language: complaint.language,
    translated_text: complaint.translated_text,
    provider_status: complaint.provider_status || 'FALLBACK',
    response_target_language: responseRes.body.target_language,
    translated_note: responseRes.body.translated_note,
  }, null, 2));

  await pool.query('DELETE FROM complaints WHERE id = $1', [complaint.id]);
  await pool.query('DELETE FROM users WHERE id = $1', [citizenId]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(() => pool.end());
