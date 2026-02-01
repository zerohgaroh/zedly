import bcrypt from 'bcryptjs';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const app = express();
const PORT = process.env.PORT || 8083;
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET || 'change_me_too';

app.use(cors());
app.use(express.json());

const signToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  return next();
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/seed-admin', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== ADMIN_SEED_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { username, password, firstName = '', lastName = '' } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rowCount) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (username, password_hash, role, first_name, last_name, is_temporary_password)
     VALUES ($1, $2, 'admin', $3, $4, false)
     RETURNING id, username, role, first_name, last_name, is_temporary_password`,
    [username, hash, firstName, lastName]
  );

  const user = result.rows[0];
  const token = signToken(user);
  return res.json({ user, token, requirePasswordChange: false });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const result = await query('SELECT * FROM users WHERE username = $1 AND role = $2', [username, role]);
  if (!result.rowCount) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      school: user.school,
      grade: user.grade,
      gradeSection: user.grade_section,
      isTemporaryPassword: user.is_temporary_password,
    },
    token,
    requirePasswordChange: user.is_temporary_password,
  });
});

app.post('/api/auth/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
  const user = result.rows[0];

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid password' });

  const hash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = $1, is_temporary_password = false WHERE id = $2', [hash, user.id]);

  return res.json({ success: true });
});

app.post('/api/users/register', auth, adminOnly, async (req, res) => {
  const {
    username,
    password,
    role,
    firstName = '',
    lastName = '',
    school = '',
    grade = null,
    gradeSection = null,
  } = req.body || {};

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const exists = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (exists.rowCount) return res.status(409).json({ message: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (username, password_hash, role, first_name, last_name, school, grade, grade_section, is_temporary_password)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
     RETURNING id, username, role, first_name, last_name, school, grade, grade_section, is_temporary_password`,
    [username, hash, role, firstName, lastName, school, grade, gradeSection]
  );

  return res.json({ user: result.rows[0] });
});

app.get('/api/users', auth, adminOnly, async (_req, res) => {
  const result = await query(
    'SELECT id, username, role, first_name, last_name, school, grade, grade_section, is_temporary_password FROM users ORDER BY created_at DESC'
  );
  return res.json(result.rows);
});

app.post('/api/classes', auth, adminOnly, async (req, res) => {
  const { grade, name, teacherId = null } = req.body || {};
  if (!grade) return res.status(400).json({ message: 'Missing grade' });
  const result = await query(
    'INSERT INTO classes (grade, name, teacher_id) VALUES ($1, $2, $3) RETURNING *',
    [grade, name || '', teacherId]
  );
  return res.json(result.rows[0]);
});

app.get('/api/classes', auth, adminOnly, async (_req, res) => {
  const result = await query('SELECT * FROM classes ORDER BY created_at DESC');
  return res.json(result.rows);
});

app.delete('/api/classes/:id', auth, adminOnly, async (req, res) => {
  await query('DELETE FROM classes WHERE id = $1', [req.params.id]);
  return res.json({ success: true });
});

app.post('/api/subjects', auth, adminOnly, async (req, res) => {
  const { nameRu, nameUz } = req.body || {};
  if (!nameRu || !nameUz) return res.status(400).json({ message: 'Missing fields' });
  const result = await query(
    'INSERT INTO subjects (name_ru, name_uz) VALUES ($1, $2) RETURNING *',
    [nameRu, nameUz]
  );
  return res.json(result.rows[0]);
});

app.get('/api/subjects', auth, adminOnly, async (_req, res) => {
  const result = await query('SELECT * FROM subjects ORDER BY created_at DESC');
  return res.json(result.rows);
});

app.put('/api/subjects/:id', auth, adminOnly, async (req, res) => {
  const { nameRu, nameUz } = req.body || {};
  const result = await query(
    'UPDATE subjects SET name_ru = $1, name_uz = $2 WHERE id = $3 RETURNING *',
    [nameRu, nameUz, req.params.id]
  );
  return res.json(result.rows[0]);
});

app.delete('/api/subjects/:id', auth, adminOnly, async (req, res) => {
  await query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
  return res.json({ success: true });
});

app.get('/api/tests', auth, adminOnly, async (_req, res) => res.json([]));
app.get('/api/teacher-tests', auth, adminOnly, async (_req, res) => res.json([]));

app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});
