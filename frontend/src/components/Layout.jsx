import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Shield, GraduationCap, UserCheck, Menu, LogOut, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { useRealtime } from '../lib/realtime';

const NAV = {
  admin: [
    ['/', 'Dashboard'],
    ['/admin-courses', 'Courses & Allocation'],
    ['/batches', 'Cohorts & Batches'],
    ['/attendance', 'Attendance Audit'],
    ['/invoices', 'Dues & Invoices Setup'],
    ['/students', 'Trainees'],
    ['/instructors', 'Instructors'],
    ['/users', 'Users & Roles'],
    ['/audit', 'Audit Logs'],
    ['/deploy', 'Production Deploy'],
  ],
  staff: [
    ['/', 'Dashboard'],
    ['/admin-courses', 'Courses & Allocation'],
    ['/batches', 'Cohorts & Batches'],
    ['/attendance', 'Attendance Audit'],
    ['/invoices', 'Dues & Invoices Setup'],
    ['/students', 'Trainees'],
    ['/instructors', 'Instructors'],
  ],
  instructor: [
    ['/', 'Dashboard'],
    ['/classroom', 'Live Online Classroom'],
    ['/submissions', 'Code Review Hub'],
    ['/grades', 'Grade Management'],
    ['/certificates', 'Issue Certificates'],
    ['/attendance', 'Session Attendance Marking'],
    ['/batches', 'My Batches'],
    ['/admin-courses', 'Curriculum & Lectures'],
  ],
  student: [
    ['/', 'Dashboard'],
    ['/classroom', 'Live Online Classroom'],
    ['/submissions', 'My Code Submissions'],
    ['/certificates', 'My Certificates'],
    ['/attendance', 'My Session Attendance'],
    ['/grades', 'My Grades'],
    ['/admin-courses', 'Course Curricula'],
    ['/invoices', 'My Tuition Dues'],
    ['/my-profile', 'Trainee Profile'],
  ],
};

export default function Layout() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

  const refreshUnread = () =>
    api
      .get('/api/notifications', { params: { pageSize: 1 } })
      .then((r) => setUnread(r.data?.meta?.unread || 0))
      .catch(() => {});

  useEffect(() => {
    refreshUnread();
  }, []);
  useRealtime('notifications', refreshUnread);

  const link = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
    }`;

  const currentRole = profile?.role || 'student';
  const roleNavItems = NAV[currentRole] || NAV.student;

  const nav = (
    <nav className="app-navigation space-y-1" aria-label="Main">
      {roleNavItems.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === '/'} className={link}>
          {label}
        </NavLink>
      ))}
      <NavLink to="/notifications" className={link}>
        Notifications{' '}
        {unread > 0 && (
          <span className="ml-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-xs text-white">
            {unread}
          </span>
        )}
      </NavLink>
    </nav>
  );

  const roleBadge = () => {
    if (currentRole === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-slate-700">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span>Administrator</span>
        </span>
      );
    }
    if (currentRole === 'instructor') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-bold text-blue-200 border border-blue-700">
          <UserCheck className="h-3 w-3 text-blue-300" />
          <span>Faculty Lead</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900 px-2.5 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-700">
        <GraduationCap className="h-3 w-3 text-emerald-300" />
        <span>Trainee</span>
      </span>
    );
  };

  return (
    <div className="app-shell min-h-screen md:flex bg-slate-50">
      <aside className="app-sidebar hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:flex md:flex-col md:justify-between">
        <div>
          <div className="app-brand flex items-center pb-4 mb-3 border-b border-white/10">
            <Logo inverted className="h-10 w-auto" />
          </div>

          <div className="mb-4">
            {roleBadge()}
          </div>

          <p className="app-nav-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {nav}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Account:</span>
              <span className="capitalize font-bold text-slate-900">{profile?.role}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Role Isolation Active</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="app-topbar flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-slate-700 ring-1 ring-inset ring-slate-300 md:hidden hover:bg-slate-50"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:inline-block">
                Portal:
              </span>
              {roleBadge()}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="app-user-name hidden max-w-[14rem] truncate text-xs font-semibold text-slate-700 sm:inline-block">
              {profile?.full_name}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500" />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
            <div className="app-mobile-nav absolute inset-y-0 left-0 w-64 bg-white p-4 shadow-xl">
              <div className="app-brand flex items-center pb-4 mb-3 border-b border-white/10">
                <Logo inverted className="h-9 w-auto" />
              </div>
              <div className="mb-4">
                {roleBadge()}
              </div>
              <p className="app-nav-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Workspace
              </p>
              {nav}
            </div>
          </div>
        )}

        <main className="app-main mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}