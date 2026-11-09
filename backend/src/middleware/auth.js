import { anonClient, clientForToken } from '../config/supabase.js';
import { tables, createMockClient } from '../mockEngine.js';

export async function authenticate(req, res, next) {
  // Reject arbitrary role spoofing headers
  const authHeader = req.get('authorization') ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in with valid credentials.' });
  }

  // 1. Resolve TMS session token: tms-token-<userId>-<timestamp>
  if (token.startsWith('tms-token-')) {
    const parts = token.split('-');
    // Expected format: tms-token-usr-[admin|inst|stud]-[id]-[timestamp]
    // Reconstruct user id which begins with usr-
    const tokenRest = token.slice('tms-token-'.length);
    const lastDashIdx = tokenRest.lastIndexOf('-');
    const userId = lastDashIdx !== -1 ? tokenRest.slice(0, lastDashIdx) : tokenRest;

    const profile = tables.profiles.find((p) => p.id === userId);
    if (!profile || !profile.is_active) {
      return res.status(401).json({ error: 'Session expired or user profile invalid. Please sign in again.' });
    }

    req.user = { id: profile.id, role: profile.role, name: profile.full_name, email: profile.email };
    req.sb = createMockClient(req.user);
    return next();
  }

  // 2. Try standard Supabase authentication
  try {
    const { data, error } = await anonClient.auth.getUser(token);
    if (!error && data?.user) {
      const sb = clientForToken(token);
      const { data: profile, error: pErr } = await sb
        .from('profiles')
        .select('id, role, full_name, is_active')
        .eq('id', data.user.id)
        .single();
      if (!pErr && profile && profile.is_active) {
        req.user = { id: profile.id, role: profile.role, name: profile.full_name, email: profile.email };
        req.sb = sb;
        return next();
      }
    }
  } catch (_err) {
    // Continue to error return
  }

  return res.status(401).json({ error: 'Invalid authentication token. Please sign in again.' });
}

/**
 * Strict Role Guard
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. This view or action requires ${roles.join(' or ')} privileges.`,
    });
  }
  next();
};