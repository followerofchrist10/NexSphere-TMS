import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, UserCheck, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../lib/auth';
import { Alert, Btn } from '../components/ui';

const inputStyle = 'mt-1 w-full rounded-md border-slate-300 text-sm shadow-xs focus:border-slate-500 focus:ring-slate-500';

function Shell({ title, children, footer }) {
  const { pathname } = useLocation();
  const transition = pathname === '/register' ? 'auth-enter-forward' : 'auth-enter-back';

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center px-4 py-10 bg-slate-100">
      <div className={`auth-content w-full max-w-lg ${transition}`}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo className="h-16 w-auto" />
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900">{title}</h1>
          <p className="mt-1 text-xs text-slate-600">
            Zero-Trust Role-Isolated Portal: Administrator, Faculty, and Student personas.
          </p>
        </div>

        <div className="auth-panel rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { session, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const submitCredentials = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await loginWithCredentials(email.trim(), password);
      navigate('/');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setBusy(false);
    }
  };

  const fillCredentials = (seedEmail, seedPassword) => {
    setEmail(seedEmail);
    setPassword(seedPassword);
    setErr('');
  };

  return (
    <Shell
      title="Portal Sign In"
      footer={
        <>
          New trainee or instructor?{' '}
          <Link to="/register" className="font-semibold text-slate-900 underline">
            Register a new account
          </Link>
        </>
      }
    >
      {/* Real Email/Password Authentication Form */}
      <form onSubmit={submitCredentials} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Account Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. admin@nexsphere.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyle}
          />
        </div>

        <Alert>{err}</Alert>

        <Btn type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2">
          <KeyRound className="h-4 w-4" />
          <span>{busy ? 'Verifying Credentials…' : 'Sign In with Credentials'}</span>
        </Btn>
      </form>

      {/* Verified Role-Isolated Credentials Reference */}
      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          <span>Role-Isolated Seed Credentials (Zero-Trust)</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Each persona is strictly segregated in the backend. Select an account to auto-fill credentials:
        </p>

        <div className="space-y-2">
          {/* Admin Account */}
          <button
            type="button"
            onClick={() => fillCredentials('admin@nexsphere.edu', 'Admin@123456')}
            className={`w-full text-left rounded-xl border p-2.5 transition-all flex items-center justify-between ${
              email === 'admin@nexsphere.edu'
                ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">Administrator</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">Dr. Sarah Chen</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">admin@nexsphere.edu · Admin@123456</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
              Courses, Audit & Dues
            </span>
          </button>

          {/* Instructor Account */}
          <button
            type="button"
            onClick={() => fillCredentials('alex.rivera@nexsphere.edu', 'Faculty@123456')}
            className={`w-full text-left rounded-xl border p-2.5 transition-all flex items-center justify-between ${
              email === 'alex.rivera@nexsphere.edu'
                ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">Faculty / Instructor</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">Prof. Alex Rivera</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">alex.rivera@nexsphere.edu · Faculty@123456</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded shrink-0">
              Classroom & Grading
            </span>
          </button>

          {/* Student Account */}
          <button
            type="button"
            onClick={() => fillCredentials('jordan.lee@nexsphere.edu', 'Student@123456')}
            className={`w-full text-left rounded-xl border p-2.5 transition-all flex items-center justify-between ${
              email === 'jordan.lee@nexsphere.edu'
                ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">Trainee / Student</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">Jordan Lee</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">jordan.lee@nexsphere.edu · Student@123456</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded shrink-0">
              Labs & Attendance
            </span>
          </button>
        </div>
      </div>
    </Shell>
  );
}

export function Register() {
  const { session, registerProfile } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: '', email: '', password: '', role: 'student' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (f.role === 'admin') {
      return setErr('An Administrator account already exists for this institution (Dr. Sarah Chen). Only one administrator can be created.');
    }

    if (f.fullName.trim().length < 2) return setErr('Enter your full name.');
    if (f.password.length < 8) return setErr('Use a password of at least 8 characters.');

    setBusy(true);
    try {
      await registerProfile(f);
      navigate('/');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title="Register Profile"
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-slate-900 underline">
            Sign in
          </Link>
        </>
      }
    >
      {/* Notice: Single Administrator Limit */}
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-amber-700" />
          <p className="font-bold">Single Administrator Limit</p>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed">
          The institutional administrator account has already been provisioned (Dr. Sarah Chen). New accounts can be registered as Trainees or Instructors.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Account Role
          </label>
          <select
            value={f.role}
            onChange={(e) => setF({ ...f, role: e.target.value })}
            className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
          >
            <option value="student">Trainee / Student</option>
            <option value="instructor">Instructor / Faculty</option>
            <option value="admin" disabled>Administrator (Already Provisioned)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Full Name
          </label>
          <input
            required
            maxLength={120}
            autoComplete="name"
            placeholder="e.g. Alex Mercer"
            value={f.fullName}
            onChange={(e) => setF({ ...f, fullName: e.target.value })}
            className={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. alex.m@nexsphere.edu"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            className={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            className={inputStyle}
          />
          <span className="mt-1 block text-[11px] text-slate-400">At least 8 characters.</span>
        </div>

        <Alert>{err}</Alert>
        <Btn type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{busy ? 'Registering Profile…' : 'Complete Registration'}</span>
        </Btn>
      </form>
    </Shell>
  );
}
