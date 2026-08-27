import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://janseva:janseva@localhost:5432/janseva',
});

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const userRes = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
     VALUES ('Officer Deshmukh', 'officer@janseva.ai', '9876543211', $1, 'officer', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'officer'
     RETURNING id`,
    [hash]
  );
  const deptRes = await pool.query('SELECT id FROM departments LIMIT 1');
  const deptId = deptRes.rows[0]?.id;
  await pool.query(
    `INSERT INTO officers (user_id, department_id, designation)
     VALUES ($1, $2, 'Ward 12 Municipal Officer')
     ON CONFLICT (user_id) DO UPDATE SET department_id = $2
     RETURNING id`,
    [userRes.rows[0].id, deptId]
  );
  console.log('Officer account ready: officer@janseva.ai / password123');
  await pool.end();
}

main().catch(console.error);
