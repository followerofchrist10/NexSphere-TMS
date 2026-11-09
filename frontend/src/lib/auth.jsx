import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import api from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tms_auth_token'));
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('tms_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('tms_auth_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        return { user: { id: u.id, role: u.role } };
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);

  const signOut = useCallback(() => {
    localStorage.removeItem('tms_auth_token');
    localStorage.removeItem('tms_auth_user');
    supabase.auth.signOut();
    setToken(null);
    setProfile(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token && !session) return;
    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.data) {
        setProfile(res.data.data);
        localStorage.setItem('tms_auth_user', JSON.stringify(res.data.data));
        setProfileError(false);
      }
    } catch (_err) {
      // Check fallback via /api/me
      try {
        const fallback = await api.get('/api/me');
        if (fallback.data?.data) {
          setProfile(fallback.data.data);
          localStorage.setItem('tms_auth_user', JSON.stringify(fallback.data.data));
          setProfileError(false);
        }
      } catch (_e) {
        setProfileError(true);
      }
    }
  }, [token, session]);

  useEffect(() => {
    // If we have token, verify validity
    if (token) {
      refreshProfile();
    }
  }, [token, refreshProfile]);

  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    setProfileError(false);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user } = res.data;
      localStorage.setItem('tms_auth_token', newToken);
      localStorage.setItem('tms_auth_user', JSON.stringify(user));
      setToken(newToken);
      setProfile(user);
      setSession({ user: { id: user.id, role: user.role } });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const registerProfile = async ({ fullName, email, password, role }) => {
    setLoading(true);
    setProfileError(false);
    try {
      const res = await api.post('/api/auth/register', {
        full_name: fullName,
        email,
        password,
        role,
      });
      const { token: newToken, user } = res.data;
      localStorage.setItem('tms_auth_token', newToken);
      localStorage.setItem('tms_auth_user', JSON.stringify(user));
      setToken(newToken);
      setProfile(user);
      setSession({ user: { id: user.id, role: user.role } });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check inputs.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    profile,
    profileError,
    loading,
    token,
    loginWithCredentials,
    registerProfile,
    signOut,
    refreshProfile,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}