import { useState, useEffect } from 'react';
import { Terminal, GitBranch, ExternalLink, CheckCircle2, Clock, AlertCircle, Plus, Edit3, MessageSquare, Shield, Code2 } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Btn, Empty, Loading, PageHeader, fmtDate } from '../components/ui';

export default function CodeSubmissions() {
  const { profile } = useAuth();
  const [subs, setSubs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // Submit Modal (Student)
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    course_id: '',
    batch_id: '',
    assignment_title: '',
    repo_url: '',
    deploy_url: '',
    notes: '',
  });

  // Review Modal (Faculty / Admin)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    score: 90,
    reviewer_notes: '',
    status: 'graded',
  });

  const isAdminOrFaculty = ['admin', 'staff', 'instructor'].includes(profile?.role);

  const loadData = async () => {
    setLoading(true);
    setErr('');
    try {
      const [subRes, courseRes, batchRes] = await Promise.all([
        api.get('/api/academic/submissions'),
        api.get('/api/courses', { params: { pageSize: 100 } }),
        api.get('/api/batches', { params: { pageSize: 100 } }),
      ]);
      setSubs(subRes.data.data || []);
      setCourses(courseRes.data.data || []);
      setBatches(batchRes.data.data || []);
      if (courseRes.data.data?.length > 0 && batchRes.data.data?.length > 0) {
        setSubForm((f) => ({
          ...f,
          course_id: courseRes.data.data[0].id,
          batch_id: batchRes.data.data[0].id,
        }));
      }
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitLab = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    try {
      const res = await api.post('/api/academic/submit-lab', subForm);
      setSubmitModalOpen(false);
      setOk(res.data.message || 'Lab deliverable submitted successfully.');
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setErr('');
    setOk('');
    try {
      const res = await api.patch(`/api/academic/review-submission/${selectedSub.id}`, reviewForm);
      setReviewModalOpen(false);
      setOk(res.data.message || 'Code review published successfully.');
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const openReviewModal = (sub) => {
    setSelectedSub(sub);
    setReviewForm({
      score: sub.score !== null ? sub.score : 90,
      reviewer_notes: sub.reviewer_notes || '',
      status: 'graded',
    });
    setReviewModalOpen(true);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Practical Code Lab Submissions & Review"
          subtitle="Submit Git repositories, live cloud deployments, and receive structured peer & instructor code reviews."
        />
        <div className="flex items-center gap-2">
          <Btn onClick={() => setSubmitModalOpen(true)} className="text-xs flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-white" />
            <span>Submit Code Deliverable</span>
          </Btn>
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert>{err}</Alert>
      </div>

      {loading ? (
        <Loading label="Fetching technical submissions ledger..." />
      ) : subs.length === 0 ? (
        <Empty>No code lab submissions recorded yet.</Empty>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => {
            const isGraded = s.status === 'graded';
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md ring-1 ring-emerald-600/20">
                        {s.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isGraded
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isGraded ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {isGraded ? 'Reviewed & Graded' : 'Under Review'}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-medium">Submitted {fmtDate(s.submitted_at)}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{s.assignment_title}</h3>
                    <p className="text-xs text-slate-500">
                      Author: <strong className="text-slate-800">{s.student_name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isGraded && (
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900 font-mono">
                          {s.score} <span className="text-xs font-normal text-slate-500">/ {s.max_score}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Passed Evaluation</span>
                      </div>
                    )}

                    {isAdminOrFaculty && (
                      <button
                        type="button"
                        onClick={() => openReviewModal(s)}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{isGraded ? 'Update Review' : 'Review & Grade'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Code Links & Notes */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={s.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>{s.repo_url}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {s.deploy_url && (
                      <a
                        href={s.deploy_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
                      >
                        <Terminal className="h-3.5 w-3.5 text-slate-500" />
                        <span>Live Deployment</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans">{s.notes}</p>
                </div>

                {/* Reviewer Feedback Box */}
                {s.reviewer_notes && (
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Instructor Code Review Feedback</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{s.reviewer_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMIT LAB MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Submit Practical Lab Deliverable</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your Git repository URL and notes for automated verification and evaluation.
            </p>

            <form onSubmit={handleSubmitLab} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Course / Technical Track *</label>
                <select
                  required
                  value={subForm.course_id}
                  onChange={(e) => setSubForm({ ...subForm, course_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Assignment / Deliverable Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Engine in Go"
                  value={subForm.assignment_title}
                  onChange={(e) => setSubForm({ ...subForm, assignment_title: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Git Repository URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/project-repo"
                  value={subForm.repo_url}
                  onChange={(e) => setSubForm({ ...subForm, repo_url: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Live Deploy / Endpoint URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://my-service.cloud.run"
                  value={subForm.deploy_url}
                  onChange={(e) => setSubForm({ ...subForm, deploy_url: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Architecture Notes & Implementation Highlights</label>
                <textarea
                  rows={3}
                  placeholder="Describe your concurrency patterns, benchmark results, and unit tests..."
                  value={subForm.notes}
                  onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Btn tone="ghost" type="button" onClick={() => setSubmitModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">Submit for Review</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & GRADE MODAL */}
      {reviewModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Review Code Deliverable</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate {selectedSub.student_name}'s implementation for {selectedSub.assignment_title}.
            </p>

            <form onSubmit={handleReviewSubmission} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Awarded Score (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={reviewForm.score}
                  onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Instructor Code Review & Feedback *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide constructive feedback on architectural choices, code readability, and test coverage..."
                  value={reviewForm.reviewer_notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewer_notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Btn tone="ghost" type="button" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">Publish Review & Record Grade</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
