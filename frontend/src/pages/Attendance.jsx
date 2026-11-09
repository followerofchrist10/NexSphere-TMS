import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Download, Radio, Wifi, Clock, Shield } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Badge, Btn, Empty, Loading, PageHeader, fmtDate } from '../components/ui';

const STATUSES = ['present', 'absent', 'late'];
const today = () => new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const { profile } = useAuth();
  if (['admin', 'staff'].includes(profile?.role)) {
    return <AdminAttendanceAuditView />;
  }
  if (profile?.role === 'instructor') {
    return <FacultyMarking />;
  }
  return <TraineeAttendanceView />;
}

/**
 * Trainee Attendance Portal
 * Features aggregate metrics, 75% certification threshold warnings,
 * session buffer calculator, and lecture-by-lecture attendance logs.
 */
function TraineeAttendanceView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/api/academic/attendance-summary');
      setData(res.data.data);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const exportAttendanceCSV = () => {
    if (!data?.courses) return;
    const rows = [
      ['Course Code', 'Course Title', 'Attendance %', 'Total Delivered', 'Attended', 'Late', 'Absent', 'Eligibility Status'],
    ];
    data.courses.forEach((c) => {
      rows.push([
        c.course_code,
        `"${c.course_title}"`,
        `${c.percentage}%`,
        c.total_delivered,
        c.attended,
        c.late || 0,
        c.absent,
        c.margin_status,
      ]);
    });
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexSphere_Attendance_${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const overall = data?.overall;
  const courses = data?.courses || [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Training Course Attendance & Telemetry"
          subtitle="Real-time online session attendance records, 75% certification eligibility tracker, and session buffer forecast."
        />
        <div className="flex items-center gap-2">
          {courses.length > 0 && (
            <Btn tone="ghost" onClick={exportAttendanceCSV} className="self-start text-xs flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Export CSV</span>
            </Btn>
          )}
          <Btn tone="ghost" onClick={loadSummary} className="self-start text-xs flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
            <span>Refresh Log</span>
          </Btn>
        </div>
      </div>

      <Alert>{err}</Alert>

      {loading ? (
        <Loading label="Computing course session attendance..." />
      ) : !data || courses.length === 0 ? (
        <Empty>No course attendance records found for your student profile.</Empty>
      ) : (
        <>
          {/* Overall Aggregate Attendance Banner */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                    ACADEMIC SESSION 2026-27
                  </span>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Overall Attendance: {overall.percentage}%
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Total Delivered: <strong className="text-white">{overall.total_delivered}</strong> lectures · Attended: <strong className="text-emerald-400">{overall.total_attended}</strong> lectures
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      overall.status === 'safe'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : overall.status === 'warning'
                        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                        : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    <span>
                      {overall.status === 'safe'
                        ? 'Certification Eligible (Safe >= 75%)'
                        : overall.status === 'warning'
                        ? 'Borderline Warning (65% - 74%)'
                        : 'Attendance Defaulter (< 65%)'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Mandatory 75% certification criteria enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50 text-center sm:grid-cols-4">
              <div className="p-3.5">
                <p className="text-[11px] font-medium text-slate-500 uppercase">Enrolled Tech Courses</p>
                <p className="text-lg font-bold text-slate-900">{courses.length}</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] font-medium text-slate-500 uppercase">Total Attended</p>
                <p className="text-lg font-bold text-emerald-600">{overall.total_attended}</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] font-medium text-slate-500 uppercase">Total Absents</p>
                <p className="text-lg font-bold text-rose-600">
                  {overall.total_delivered - overall.total_attended}
                </p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] font-medium text-slate-500 uppercase">Safe Courses</p>
                <p className="text-lg font-bold text-slate-900">
                  {courses.filter((c) => c.percentage >= 75).length} / {courses.length}
                </p>
              </div>
            </div>
          </div>

          {/* Subject-Wise Attendance Cards */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Course-Wise Attendance & Session Buffer Calculator
            </h3>

            {courses.map((course) => {
              const isExpanded = expandedCourse === course.course_id;
              const isSafe = course.percentage >= 75;
              const isWarning = course.percentage >= 65 && course.percentage < 75;

              return (
                <div
                  key={course.course_id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md ring-1 ring-emerald-600/20">
                          {course.course_code}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {course.category}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">
                          Commenced: <strong>{fmtDate(course.commencing_date)}</strong>
                        </span>
                      </div>

                      <h4 className="mt-1.5 text-base font-bold text-slate-900">
                        {course.course_title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Faculty: <strong className="text-slate-700">{course.instructor_name}</strong> · Venue: <span className="text-slate-700">{course.room_name}</span>
                      </p>
                    </div>

                    {/* Percentage and Badge */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          {course.percentage}%
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {course.attended} / {course.total_delivered} Lectures
                        </span>
                      </div>

                      <div
                        className={`h-12 w-2 rounded-full ${
                          isSafe
                            ? 'bg-emerald-500'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 75% Threshold Progress Bar */}
                  <div className="mt-4">
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isSafe
                            ? 'bg-emerald-500'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, course.percentage)}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>0%</span>
                      <span className="font-semibold text-slate-600">75% Required Threshold</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Session Buffer / Recovery Calculator Box */}
                  <div
                    className={`mt-4 rounded-xl p-3.5 text-xs border ${
                      isSafe
                        ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                        : isWarning
                        ? 'border-amber-200 bg-amber-50/80 text-amber-900'
                        : 'border-rose-200 bg-rose-50/80 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isSafe ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold">
                          {isSafe
                            ? 'Attendance Safe & Certified Standing'
                            : isWarning
                            ? 'Attendance Warning'
                            : 'Defaulter Warning'}
                        </p>
                        <p className="mt-0.5 leading-relaxed font-medium">
                          {course.calculator_message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Breakdown Counters */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex flex-wrap gap-4">
                      <span>Attended: <strong className="text-emerald-700">{course.attended}</strong></span>
                      <span>Absent: <strong className="text-rose-600">{course.absent}</strong></span>
                      <span>Late: <strong className="text-amber-600">{course.late || 0}</strong></span>
                      <span>Planned Sessions: <strong className="text-slate-800">{course.total_curriculum_lectures}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedCourse(isExpanded ? null : course.course_id)}
                      className="text-xs font-semibold text-slate-900 hover:text-emerald-700 underline"
                    >
                      {isExpanded ? 'Hide Session History' : `View ${course.records.length} Online Sessions`}
                    </button>
                  </div>

                  {/* Expandable Lecture-Wise Attendance Log */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Lecture-by-Lecture Attendance History
                      </h5>
                      {course.records.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">No individual lectures logged yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                              <tr>
                                <th className="p-2 font-semibold">Lecture</th>
                                <th className="p-2 font-semibold">Date</th>
                                <th className="p-2 font-semibold">Topic Covered</th>
                                <th className="p-2 font-semibold">Room</th>
                                <th className="p-2 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {course.records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-50">
                                  <td className="p-2 font-mono font-medium text-slate-700">
                                    {rec.lecture_number ? `Lec #${rec.lecture_number}` : 'Daily Lab'}
                                  </td>
                                  <td className="p-2 text-slate-600 whitespace-nowrap">
                                    {fmtDate(rec.date)}
                                  </td>
                                  <td className="p-2 font-medium text-slate-900">{rec.topic}</td>
                                  <td className="p-2 text-slate-500">{rec.room}</td>
                                  <td className="p-2">
                                    <span
                                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                        rec.status === 'present'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : rec.status === 'late'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {rec.status === 'present' ? 'Attended' : rec.status === 'late' ? 'Late Join' : 'Missed'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

/**
 * Faculty & Admin Attendance Marking Portal
 * Allows rapid batch/lecture selection, 1-click Mark All Present, and individual toggles.
 */
function FacultyMarking() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(today());
  const [roster, setRoster] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api
      .get('/api/batches', { params: { pageSize: 100 } })
      .then((r) => {
        setBatches(r.data.data);
        if (r.data.data.length > 0 && !batchId) {
          setBatchId(r.data.data[0].id);
        }
      })
      .catch((e) => setErr(errorMessage(e)));
  }, []);

  const load = useCallback(async () => {
    if (!batchId) return setRoster([]);
    setLoading(true);
    setOk('');
    try {
      const [r, a] = await Promise.all([
        api.get(`/api/roster/${batchId}`),
        api.get('/api/attendance', { params: { batchId, date } }),
      ]);
      setRoster(r.data.data);
      const markMap = Object.fromEntries(a.data.data.map((x) => [x.student_id, x.status]));
      // Pre-fill present if empty
      r.data.data.forEach((st) => {
        if (!markMap[st.student_id]) markMap[st.student_id] = 'present';
      });
      setMarks(markMap);
      setErr('');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [batchId, date]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => STATUSES.map((s) => [s, Object.values(marks).filter((m) => m === s).length]),
    [marks]
  );

  const save = async () => {
    const records = roster
      .filter((s) => marks[s.student_id])
      .map((s) => ({ studentId: s.student_id, status: marks[s.student_id] }));
    if (!records.length) return setErr('Mark at least one student.');
    try {
      const r = await api.put('/api/attendance', { batchId, date, records });
      setOk(`Saved attendance for ${r.data.saved} students on ${fmtDate(date)}.`);
      setErr('');
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const selectedBatchObj = batches.find((b) => b.id === batchId);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Online Session Attendance & Marking"
          subtitle="Record live technical session attendance, verify student connections, and update attendance records."
        />
        <div className="flex gap-2">
          {roster.length > 0 && (
            <Btn
              tone="ghost"
              onClick={() =>
                setMarks(Object.fromEntries(roster.map((s) => [s.student_id, 'present'])))
              }
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Mark All Present</span>
            </Btn>
          )}
          <Btn onClick={save}>Save Attendance</Btn>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-xs font-semibold text-slate-700">
            <span className="mb-1 block">Assigned Batch</span>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
            >
              <option value="">Select a batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.course?.title})
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            <span className="mb-1 block">Lecture Date</span>
            <input
              type="date"
              max={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
            />
          </label>

          {selectedBatchObj?.course && (
            <div className="rounded-md bg-slate-50 px-3 py-1.5 text-xs text-slate-600 border border-slate-200">
              Commenced: <strong>{fmtDate(selectedBatchObj.starts_on)}</strong> · Room: {selectedBatchObj.asset?.name || 'Assigned Lab'}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert onRetry={load}>{err}</Alert>
      </div>

      {loading ? (
        <Loading label="Loading batch student roster..." />
      ) : batchId && roster.length === 0 ? (
        <Empty>No approved students enrolled in this batch yet.</Empty>
      ) : (
        roster.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Enrolled Students ({roster.length})
              </span>
              <div className="flex gap-3 text-xs text-slate-600">
                {counts.map(([s, n]) => (
                  <span key={s} className="capitalize">
                    <strong className={s === 'present' ? 'text-emerald-700' : s === 'absent' ? 'text-rose-600' : 'text-amber-600'}>
                      {n}
                    </strong>{' '}
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <ul className="divide-y divide-slate-100">
              {roster.map((s) => (
                <li
                  key={s.student_id}
                  className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{s.full_name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>

                  <div className="flex gap-1.5" role="radiogroup" aria-label={`Attendance for ${s.full_name}`}>
                    {STATUSES.map((st) => {
                      const selected = marks[s.student_id] === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setMarks((m) => ({ ...m, [s.student_id]: st }))}
                          className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                            selected
                              ? st === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 bg-slate-50 p-4 flex justify-end">
              <Btn onClick={save}>Save Attendance for {fmtDate(date)}</Btn>
            </div>
          </div>
        )
      )}
    </section>
  );
}

/**
 * Administrator Institutional Attendance Audit & Telemetry
 * Provides high-altitude oversight, compliance monitoring, and telemetry logs.
 * Admin cannot mark attendance; this portal is strictly audit and oversight.
 */
function AdminAttendanceAuditView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/api/academic/attendance-audit', {
        params: { batchId: selectedBatch || undefined, search: search || undefined },
      });
      setData(res.data.data);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, search]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const exportAuditCSV = () => {
    if (!data?.records) return;
    const rows = [
      ['Date', 'Student ID', 'Student Name', 'Email', 'Batch / Cohort', 'Course', 'Lecture Topic', 'Status', 'Marked By'],
    ];
    data.records.forEach((r) => {
      rows.push([
        r.date,
        r.student_id,
        `"${r.student_name}"`,
        r.student_email,
        `"${r.batch_name}"`,
        `"${r.course_title}"`,
        `"${r.lecture_topic}"`,
        r.status,
        r.marked_by,
      ]);
    });
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexSphere_Institutional_Attendance_Audit_${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = data?.stats;
  const batchSummaries = data?.batch_summaries || [];
  const records = data?.records || [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Institutional Attendance Audit & Oversight"
          subtitle="Audit-only telemetry for administrators. Monitor cohort compliance rates and full session logs across all technical programs."
        />
        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <Btn tone="ghost" onClick={exportAuditCSV} className="text-xs flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Export Audit CSV</span>
            </Btn>
          )}
          <Btn tone="ghost" onClick={loadAudit} className="text-xs flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
            <span>Refresh Telemetry</span>
          </Btn>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
        <Shield className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Zero-Trust Role Enforcement: Institutional Auditor View</p>
          <p className="mt-0.5 text-[11px] text-blue-800 leading-relaxed">
            As an Administrator, you have full audit visibility into session compliance and trainee attendance telemetry. In accordance with institutional segregation of duties, live session attendance marking is handled exclusively by authorized Faculty Leads.
          </p>
        </div>
      </div>

      <Alert>{err}</Alert>

      {/* Institutional Telemetry Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Cohorts</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.total_batches ?? 0}</p>
          <p className="mt-1 text-[11px] text-slate-400">Technical training batches</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Logs Marked</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.total_records_marked ?? 0}</p>
          <p className="mt-1 text-[11px] text-slate-400">Total verified attendances</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutional Attendance</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{stats?.institutional_attendance_rate ?? 100}%</p>
          <p className="mt-1 text-[11px] text-slate-400">Aggregate trainee compliance</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliant Cohorts</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {stats?.compliant_batches ?? 0} / {stats?.total_batches ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">&gt;= 75% certification eligibility</p>
        </div>
      </div>

      {/* Cohort Compliance Summary Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cohort Compliance Oversight</h3>
            <p className="text-xs text-slate-500">Live attendance percentages across technical training tracks</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Technical Track / Batch</th>
                <th className="px-4 py-3">Faculty Lead</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Records</th>
                <th className="px-4 py-3">Attendance %</th>
                <th className="px-4 py-3">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batchSummaries.map((b) => (
                <tr key={b.batch_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{b.course_title}</p>
                    <p className="text-[11px] text-slate-500">{b.batch_name}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{b.instructor_name}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {fmtDate(b.starts_on)} - {fmtDate(b.ends_on)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{b.total_enrolled} trainees</td>
                  <td className="px-4 py-3 text-slate-600">{b.total_records_marked} logs</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 tabular-nums">{b.attendance_percentage}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            b.attendance_percentage >= 75 ? 'bg-emerald-500' : b.attendance_percentage >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, b.attendance_percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.compliance_status === 'compliant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.compliance_status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.compliance_status === 'compliant' ? 'Compliant (>=75%)' : b.compliance_status === 'warning' ? 'Warning (<75%)' : 'Defaulter (<65%)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Session Logs Audit */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Session Audit Logs</h3>
            <p className="text-xs text-slate-500">Searchable ledger of all attendance entries across the organization</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search trainee or cohort..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64 rounded-md border-slate-200 text-xs shadow-2xs focus:ring-slate-500 focus:border-slate-500"
            />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="rounded-md border-slate-200 text-xs shadow-2xs focus:ring-slate-500"
            >
              <option value="">All Cohorts</option>
              {batchSummaries.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8"><Loading label="Retrieving institutional attendance ledger..." /></div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center">
            <Empty>No session attendance logs recorded yet in database.</Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Trainee</th>
                  <th className="px-4 py-3">Cohort / Course</th>
                  <th className="px-4 py-3">Lecture Session</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{r.student_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{r.student_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{r.course_title}</p>
                      <p className="text-[11px] text-slate-500">{r.batch_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700">
                        {r.lecture_number ? `Lecture ${r.lecture_number}: ` : ''}{r.lecture_topic}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          r.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">{r.marked_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}