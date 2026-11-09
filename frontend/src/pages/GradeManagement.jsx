import { useState, useEffect, useMemo } from 'react';
import { Plus, Download, Search, Award, Edit3, Trash2 } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Badge, Btn, Empty, Loading, PageHeader, fmtDate } from '../components/ui';

export default function GradeManagement() {
  const { profile } = useAuth();
  if (profile?.role === 'student') {
    return <StudentGradesView />;
  }
  return <FacultyGradeManagement />;
}

function FacultyGradeManagement() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // Filtering
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [search, setSearch] = useState('');

  // Grade Modal (Create or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [form, setForm] = useState({
    batch_id: '',
    student_id: '',
    assessment: '',
    score: 85,
    max_score: 100,
    notes: '',
  });

  const isAdminOrStaff = ['admin', 'staff'].includes(profile?.role);

  const loadData = async () => {
    setLoading(true);
    setErr('');
    try {
      const [analyticsRes, coursesRes, batchesRes, studentsRes] = await Promise.all([
        api.get('/api/academic/grade-analytics', {
          params: { courseId: selectedCourseId || undefined },
        }),
        api.get('/api/courses', { params: { pageSize: 100 } }),
        api.get('/api/batches', { params: { pageSize: 100 } }),
        api.get('/api/students', { params: { pageSize: 100 } }),
      ]);
      setAnalytics(analyticsRes.data.data);
      setCourses(coursesRes.data.data || []);
      setBatches(batchesRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId]);

  const openCreateModal = () => {
    setEditingGrade(null);
    setForm({
      batch_id: batches[0]?.id || '',
      student_id: students[0]?.id || '',
      assessment: 'Technical Evaluation Sprint',
      score: 85,
      max_score: 100,
      notes: 'Demonstrated strong core principles and clean technical implementation.',
    });
    setModalOpen(true);
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setForm({
      batch_id: grade.batch_id,
      student_id: grade.student_id,
      assessment: grade.assessment,
      score: grade.score,
      max_score: grade.max_score,
      notes: grade.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const payload = {
        ...form,
        id: editingGrade?.id || undefined,
        score: Number(form.score),
        max_score: Number(form.max_score),
      };
      const res = await api.post('/api/academic/assign-grade', payload);
      setOk(res.data.message || 'Grade saved successfully!');
      setModalOpen(false);
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const handleDeleteGrade = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade evaluation?')) return;
    try {
      await api.delete(`/api/academic/grades/${id}`);
      setOk('Evaluation removed successfully.');
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const filteredGrades = useMemo(() => {
    const list = analytics?.grades || [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (g) =>
        g.student_name?.toLowerCase().includes(q) ||
        g.assessment?.toLowerCase().includes(q) ||
        g.course_title?.toLowerCase().includes(q)
    );
  }, [analytics, search]);

  const summary = analytics?.summary;
  const distribution = analytics?.distribution || [];

  const exportGradesCSV = () => {
    if (!filteredGrades.length) return;
    const rows = [
      ['Student Name', 'Email', 'Course', 'Cohort', 'Assessment', 'Score', 'Max Score', 'Percentage', 'Grade', 'Notes'],
    ];
    filteredGrades.forEach((g) => {
      rows.push([
        `"${g.student_name}"`,
        g.student_email,
        `"${g.course_title}"`,
        `"${g.batch_name}"`,
        `"${g.assessment}"`,
        g.score,
        g.max_score,
        `${g.percentage}%`,
        g.letter_grade,
        `"${(g.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexSphere_Grade_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Grade Management & Distribution Analytics"
          subtitle="Assign, evaluate, and monitor trainee evaluations with visual grade distribution histograms across training programs."
        />
        <div className="flex flex-wrap items-center gap-2 self-start">
          {filteredGrades.length > 0 && (
            <Btn tone="ghost" onClick={exportGradesCSV} className="text-xs flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Export CSV</span>
            </Btn>
          )}
          {isAdminOrStaff && (
            <Btn onClick={openCreateModal} className="text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-white" />
              <span>Assign Student Grade</span>
            </Btn>
          )}
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert>{err}</Alert>
      </div>

      {/* Course Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter Course:
            </span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
            >
              <option value="">All Technical Training Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search student or assessment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loading label="Computing grade distributions and evaluations..." />
      ) : (
        <>
          {/* VISUAL SUMMARY OF GRADE DISTRIBUTIONS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Visual Grade Distribution Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Performance breakdown across {summary?.total_evaluations || 0} evaluated trainee assessments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                  Pass Rate: {summary?.pass_rate}%
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Avg: {summary?.average_score}%
                </span>
              </div>
            </div>

            {/* Distribution Bar Histogram */}
            <div className="space-y-3.5">
              {distribution.map((d) => (
                <div key={d.grade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.label}
                    </span>
                    <span className="font-mono text-slate-500">
                      <strong className="text-slate-900">{d.count}</strong> trainees ({d.percentage}%)
                    </span>
                  </div>

                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(d.percentage, d.count > 0 ? 5 : 0)}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key Evaluation Metrics Strip */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 rounded-xl bg-slate-50 border border-slate-200/80 text-center sm:grid-cols-5">
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Score</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{summary?.average_score}%</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Median Score</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{summary?.median_score}%</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest Score</p>
                <p className="text-base font-black text-emerald-600 mt-0.5">{summary?.highest_score}%</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lowest Score</p>
                <p className="text-base font-black text-rose-600 mt-0.5">{summary?.lowest_score}%</p>
              </div>
              <div className="p-3 col-span-2 sm:col-span-1 border-t sm:border-t-0 border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Graded</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{summary?.total_evaluations}</p>
              </div>
            </div>
          </div>

          {/* STUDENT GRADES ROSTER TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Trainee Evaluation Records ({filteredGrades.length})
              </h3>
              {isAdminOrStaff && (
                <span className="text-xs text-slate-500 font-medium">
                  Administrator editing enabled
                </span>
              )}
            </div>

            {filteredGrades.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No grade evaluations recorded for this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Trainee</th>
                      <th className="py-3 px-4 font-bold">Training Course</th>
                      <th className="py-3 px-4 font-bold">Assessment / Sprint</th>
                      <th className="py-3 px-4 font-bold">Score</th>
                      <th className="py-3 px-4 font-bold">Grade</th>
                      <th className="py-3 px-4 font-bold">Feedback / Notes</th>
                      {isAdminOrStaff && <th className="py-3 px-4 font-bold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGrades.map((g) => {
                      const letterColor =
                        g.letter_grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : g.letter_grade === 'B'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : g.letter_grade === 'C'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300';

                      return (
                        <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{g.student_name}</p>
                            <p className="text-[11px] text-slate-400">{g.student_email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">{g.course_title}</p>
                            <p className="text-[10px] text-slate-400">{g.batch_name}</p>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {g.assessment}
                          </td>
                          <td className="py-3 px-4 font-mono whitespace-nowrap">
                            <span className="font-bold text-slate-900 text-sm">{g.score}</span>
                            <span className="text-slate-400 text-xs"> / {g.max_score}</span>
                            <span className="ml-1 text-slate-500 font-sans">({g.percentage}%)</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block rounded-md border px-2 py-0.5 font-bold font-mono text-xs ${letterColor}`}>
                              {g.letter_grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={g.notes}>
                            {g.notes || <span className="text-slate-300 italic">No notes</span>}
                          </td>
                          {isAdminOrStaff && (
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(g)}
                                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGrade(g.id)}
                                className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ASSIGN OR UPDATE GRADE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingGrade ? 'Update Trainee Grade' : 'Assign Student Grade'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record assessment evaluation score, rubric remarks, and performance grade.
            </p>

            <form onSubmit={handleSaveGrade} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Training Cohort / Course *</label>
                <select
                  required
                  value={form.batch_id}
                  onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.course?.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Trainee / Student *</label>
                <select
                  required
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Lab Practicum: Raft Consensus in Go"
                  value={form.assessment}
                  onChange={(e) => setForm({ ...form, assessment: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Awarded Score *</label>
                  <input
                    type="number"
                    min="0"
                    max={form.max_score}
                    required
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: e.target.value })}
                    className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Max Score *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                    className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                  />
                </div>
              </div>

              {/* Calculated Grade Letter Preview */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Computed Percentage:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {form.max_score > 0 ? ((form.score / form.max_score) * 100).toFixed(1) : 0}%
                  {' '}(Grade {((form.score / form.max_score) * 100) >= 90 ? 'A' : ((form.score / form.max_score) * 100) >= 80 ? 'B' : ((form.score / form.max_score) * 100) >= 70 ? 'C' : ((form.score / form.max_score) * 100) >= 60 ? 'D' : 'F'})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Instructor Feedback & Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Notes on architecture quality, code optimization, and test coverage..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Btn tone="ghost" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">
                  {editingGrade ? 'Update Evaluation' : 'Assign Grade'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Trainee Personal Grade & Evaluation Transcript
 * Strictly read-only: trainees can view their evaluations and letter grade transcript,
 * but cannot edit or view other trainees' records.
 */
function StudentGradesView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/api/academic/grade-analytics');
      setAnalytics(res.data.data);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const grades = analytics?.grades || [];
  const stats = analytics?.summary;

  const exportCSV = () => {
    if (!grades.length) return;
    const rows = [
      ['Course', 'Cohort', 'Assessment', 'Score', 'Max Score', 'Percentage', 'Letter Grade', 'Date', 'Notes'],
    ];
    grades.forEach((g) => {
      rows.push([
        `"${g.course_title}"`,
        `"${g.batch_name}"`,
        `"${g.assessment}"`,
        g.score,
        g.max_score,
        `${g.percentage}%`,
        g.letter_grade,
        fmtDate(g.graded_at),
        `"${g.notes || ''}"`,
      ]);
    });
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexSphere_Grade_Transcript_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="My Academic Performance & Grade Ledger"
          subtitle="Official technical evaluation scores, sprint reviews, and letter grade transcript."
        />
        {grades.length > 0 && (
          <Btn tone="ghost" onClick={exportCSV} className="text-xs flex items-center gap-1.5 self-start">
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Export Transcript CSV</span>
          </Btn>
        )}
      </div>

      <Alert>{err}</Alert>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evaluations</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.total_graded ?? 0}</p>
          <p className="mt-1 text-[11px] text-slate-400">Completed sprints & labs</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Average</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{stats?.avg_score ?? 0}%</p>
          <p className="mt-1 text-[11px] text-slate-400">Across all tech modules</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Score</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.max_score ?? 0}%</p>
          <p className="mt-1 text-[11px] text-slate-400">Peak evaluation</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passing Standing</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {stats?.passing_rate ?? 100}%
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">Grade C or higher</p>
        </div>
      </div>

      {/* Grades Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Sprint & Lab Evaluations</h3>
          <p className="text-xs text-slate-500">Continuous technical assessments graded by faculty</p>
        </div>
        {loading ? (
          <div className="p-8"><Loading label="Retrieving your evaluation transcript..." /></div>
        ) : grades.length === 0 ? (
          <div className="p-8 text-center">
            <Empty>No grade evaluations recorded yet in database.</Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Assessment Title</th>
                  <th className="px-4 py-3">Technical Track</th>
                  <th className="px-4 py-3">Score Awarded</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Evaluator Notes</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{g.assessment}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{g.course_title}</p>
                      <p className="text-[11px] text-slate-400">{g.batch_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 tabular-nums">{g.score}</span>
                      <span className="text-slate-400"> / {g.max_score}</span>
                      <span className="ml-1.5 text-[11px] text-slate-500 font-mono">({g.percentage}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          g.letter_grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : g.letter_grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : g.letter_grade === 'C'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Grade {g.letter_grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">{g.notes || 'Meets evaluation criteria.'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono">{fmtDate(g.graded_at)}</td>
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

