import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useRealtime } from '../lib/realtime';
import { Alert, Kpi, Loading, PageHeader, fmtDateTime, money } from '../components/ui';

const CARDS = {
  admin: (d) => [
    ['Tech Courses', d?.courses ?? 5, 'Active technical curricula'],
    ['Allocated Batches', d?.batches ?? (d?.active_batches ?? 3), 'Cohorts commencing on schedule'],
    ['Enrolled Trainees', d?.students ?? 5, 'Scholars in active cohorts'],
    ['Attendance Rate', `${d?.attendance_rate ?? 100}%`, 'Institutional compliance', 'ok'],
    ['Tuition Revenue', money(d?.revenue ?? 0), 'Collected payments'],
    ['Outstanding Dues', money(d?.outstanding ?? 0), 'Unpaid student dues', (d?.outstanding ?? 0) > 0 ? 'warn' : 'ok'],
  ],
  staff: (d) => [
    ['Tech Courses', d?.courses ?? 5],
    ['Active Batches', d?.batches ?? 3],
    ['Students Enrolled', d?.students ?? 5],
    ['Outstanding Fees', money(d?.outstanding ?? 0)],
  ],
  instructor: (d) => [
    ['My Assigned Batches', d?.my_batches ?? 2, 'Active cohort programs'],
    ['Trainees Taught', d?.my_students ?? 5, 'Enrolled scholars'],
    ['Sessions Marked', d?.marked_today ?? 0, 'Classroom records recorded'],
    ['Classroom Health', '1080p60 Optimal', 'Live streaming server active', 'ok'],
  ],
  student: (d) => [
    ['My Specializations', d?.enrolled ?? 1, 'Active technical training'],
    ['Session Attendance', `${d?.attendance_rate ?? 100}%`, '75% Certification Threshold', 'ok'],
    ['Completed Evaluations', d?.graded_count ?? 0, 'Sprint & lab submissions'],
    ['Tuition Dues', money(d?.balance_due ?? 0), 'Outstanding fees', (d?.balance_due ?? 0) > 0 ? 'warn' : 'ok'],
  ],
};

const QUICK = {
  admin: [
    ['/admin-courses', 'Upload & Manage Tech Courses'],
    ['/batches', 'Allocate Cohorts & Commencing Dates'],
    ['/attendance', 'Attendance Audit & Compliance Telemetry'],
    ['/invoices', 'Set Up Trainee Dues & Issue Invoices'],
    ['/students', 'Trainees Directory'],
    ['/instructors', 'Faculty & Instructors Directory'],
    ['/users', 'Manage User Roles & Access'],
    ['/audit', 'Security & Ledger Audit Logs'],
  ],
  staff: [
    ['/admin-courses', 'Manage Courses & Batches'],
    ['/batches', 'Cohorts & Batches'],
    ['/attendance', 'Attendance Audit'],
    ['/invoices', 'Billing & Invoices'],
    ['/students', 'Trainees'],
    ['/instructors', 'Instructors'],
  ],
  instructor: [
    ['/classroom', 'Start Live Virtual Classroom Stream'],
    ['/submissions', 'Code Review Hub & Sprint Evaluations'],
    ['/grades', 'Grade Management & Distribution'],
    ['/certificates', 'Issue Digital Cryptographic Certificates'],
    ['/attendance', 'Mark Session Attendance'],
    ['/batches', 'My Assigned Batches'],
    ['/admin-courses', 'Curriculum Syllabus & Lecture Plans'],
  ],
  student: [
    ['/classroom', 'Join Live Interactive Classroom Stream'],
    ['/submissions', 'Submit Code Lab Deliverable (Git/CI)'],
    ['/certificates', 'View & Cryptographically Verify Certificates'],
    ['/attendance', 'Check Session Attendance & Buffer Status'],
    ['/grades', 'View My Grade Ledger & Sprint Reviews'],
    ['/admin-courses', 'Course Curricula & Slides'],
    ['/invoices', 'Tuition Dues & Official Receipts'],
    ['/my-profile', 'Trainee Engineering Profile'],
  ],
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [d, setD] = useState(null);
  const [feed, setFeed] = useState([]);
  const [err, setErr] = useState('');
  const staff = ['staff', 'admin'].includes(profile?.role);

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        api.get('/api/dashboard'),
        api.get('/api/dashboard/activity'),
      ]);
      setD(a.data.data);
      setFeed(b.data.data || []);
      setErr('');
    } catch (e) {
      setErr(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(staff ? 'application_status_history' : 'notifications', load);

  const role = profile?.role || 'student';
  const cardsFn = CARDS[role] || CARDS.student;
  const quickItems = QUICK[role] || QUICK.student;

  return (
    <section>
      <PageHeader
        title={`Welcome, ${profile?.full_name ? profile.full_name.split(' ')[0] : 'User'}`}
        subtitle="Role-Isolated Technical Training Management Portal"
      />
      <div className="mt-4">
        <Alert onRetry={load}>{err}</Alert>
      </div>

      {!d && !err && <Loading />}

      {d && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cardsFn(d).map(([label, value, hint, tone]) => (
              <Kpi key={label} label={label} value={value} hint={hint} tone={tone} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-900">
                {staff ? 'Recent Institutional Activity' : 'Recent Updates'}{' '}
                <span className="ml-1 text-xs font-normal text-emerald-700">live telemetry</span>
              </h2>
              {feed.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No system updates recorded yet. Activity will populate as operations occur.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {feed.map((f) => (
                    <li key={f.id} className="py-2.5 text-xs">
                      <p className="font-semibold text-slate-800">{f.text}</p>
                      {f.sub && <p className="text-slate-500 mt-0.5">{f.sub}</p>}
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{fmtDateTime(f.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-900">Workspace Actions</h2>
              <ul className="mt-3 space-y-2">
                {quickItems.map(([to, label]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}