import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('[TMS Backend] Warning: SUPABASE_URL / SUPABASE_ANON_KEY not set. Using placeholder credentials. Add your real Supabase credentials in .env to connect to your live database.');
}

const opts = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

/** Anonymous client: used ONLY to verify a JWT via auth.getUser(). */
export const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, opts);

/**
 * Per-request client that acts AS the caller. Postgres sees auth.uid() = caller,
 * so RLS is enforced on every query. We deliberately do NOT use the service-role
 * key anywhere in request handling: a bug here can't leak another tenant's rows.
 */
export const clientForToken = (accessToken) =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...opts,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });