import { Router } from 'express';
import { tables } from '../mockEngine.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

/**
 * Seed credentials reference for role-isolated demonstration
 */
authRouter.get('/seed-credentials', (_req, res) => {
  const seedAccounts = [
    {
      role: 'admin',
      roleTitle: 'Administrator',
      name: 'Dr. Sarah Chen',
      email: 'admin@nexsphere.edu',
      password: 'Admin@123456',
      permissions: 'Upload courses, allocate batches, institutional attendance audit, set up student dues/invoices, manage users',
    },
    {
      role: 'instructor',
      roleTitle: 'Faculty / Instructor',
      name: 'Prof. Alex Rivera',
      email: 'alex.rivera@nexsphere.edu',
      password: 'Faculty@123456',
      permissions: 'Host live online classroom, grade student sprint deliverables, code review hub, mark session attendance, issue digital certificates',
    },
    {
      role: 'student',
      roleTitle: 'Student / Trainee',
      name: 'Jordan Lee',
      email: 'jordan.lee@nexsphere.edu',
      password: 'Student@123456',
      permissions: 'Join live streams, submit git repositories, view personal attendance & 75% safe buffer, view earned certificates, view grades & tuition dues',
    },
  ];
  res.json({ data: seedAccounts });
});

/**
 * Strict Credential Login
 */
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  const user = tables.profiles.find((p) => (p.email || '').toLowerCase() === cleanEmail);

  if (!user || user.password !== cleanPassword) {
    return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'This account has been deactivated. Contact an administrator.' });
  }

  const token = `tms-token-${user.id}-${Date.now()}`;
  const safeUser = {
    id: user.id,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || '',
    created_at: user.created_at,
  };

  res.json({
    ok: true,
    token,
    user: safeUser,
    message: `Authenticated successfully as ${user.full_name} (${user.role}).`,
  });
});

/**
 * Registration: Student or Instructor only
 * Admin can only be created once
 */
authRouter.post('/register', (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (role === 'admin') {
    return res.status(403).json({
      error: 'An administrator account already exists for this organization. Only one administrator can be created.',
    });
  }

  const assignedRole = role === 'instructor' ? 'instructor' : 'student';
  const cleanEmail = String(email).trim().toLowerCase();

  const exists = tables.profiles.some((p) => (p.email || '').toLowerCase() === cleanEmail);
  if (exists) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const newId = `usr-${assignedRole === 'instructor' ? 'inst' : 'stud'}-${Date.now()}`;
  const newProfile = {
    id: newId,
    role: assignedRole,
    full_name: String(full_name).trim(),
    email: cleanEmail,
    password: String(password).trim(),
    phone: '',
    is_active: true,
    created_at: new Date().toISOString(),
    details: assignedRole === 'student' ? {
      learning_pathway: 'Online Technical Engineering Track',
      date_of_birth: '2002-01-01',
    } : null,
  };

  tables.profiles.push(newProfile);

  const token = `tms-token-${newProfile.id}-${Date.now()}`;
  const safeUser = {
    id: newProfile.id,
    role: newProfile.role,
    full_name: newProfile.full_name,
    email: newProfile.email,
    phone: newProfile.phone,
    created_at: newProfile.created_at,
  };

  res.status(201).json({
    ok: true,
    token,
    user: safeUser,
    message: 'Profile registered successfully.',
  });
});

/**
 * Current user profile
 */
authRouter.get('/me', authenticate, (req, res) => {
  const profile = tables.profiles.find((p) => p.id === req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  const safe = {
    id: profile.id,
    role: profile.role,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone || '',
  };
  res.json({ ok: true, data: safe });
});
