import { useState, useEffect } from 'react';
import { Award, ShieldCheck, Download, Search, Plus, CheckCircle2, Copy, ExternalLink, Hash, Calendar, User, BookOpen, X } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Btn, Empty, Loading, PageHeader, fmtDate } from '../components/ui';

export default function Certificates() {
  const { profile } = useAuth();
  const [certs, setCerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // Selected Certificate for preview modal
  const [selectedCert, setSelectedCert] = useState(null);

  // Verification Search
  const [verifyCode, setVerifyCode] = useState('');
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyErr, setVerifyErr] = useState('');

  // Issue Modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    course_id: '',
    grade: 'A',
    percentage: 95,
  });

  const isAdminOrStaff = ['admin', 'staff', 'instructor'].includes(profile?.role);

  const loadData = async () => {
    setLoading(true);
    setErr('');
    try {
      const [certRes, studRes, courseRes] = await Promise.all([
        api.get('/api/academic/certificates'),
        isAdminOrStaff ? api.get('/api/students', { params: { pageSize: 100 } }) : Promise.resolve({ data: { data: [] } }),
        api.get('/api/courses', { params: { pageSize: 100 } }),
      ]);
      setCerts(certRes.data.data || []);
      setStudents(studRes.data.data || []);
      setCourses(courseRes.data.data || []);
      if (studRes.data.data?.length > 0 && courseRes.data.data?.length > 0) {
        setForm((f) => ({
          ...f,
          student_id: studRes.data.data[0].id,
          course_id: courseRes.data.data[0].id,
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

  const handleIssueCert = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    try {
      const res = await api.post('/api/academic/issue-certificate', form);
      setIssueModalOpen(false);
      setOk(res.data.message || 'Digital certificate issued successfully.');
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyErr('');
    setVerifiedResult(null);
    try {
      const res = await api.get(`/api/academic/verify-certificate/${verifyCode.trim()}`);
      setVerifiedResult(res.data.data);
    } catch (e) {
      setVerifyErr(errorMessage(e));
    } finally {
      setVerifying(false);
    }
  };

  const copyVerificationLink = (certCode) => {
    const url = `${window.location.origin}/certificates?code=${certCode}`;
    navigator.clipboard?.writeText(url);
    setOk(`Verification URL for ${certCode} copied to clipboard.`);
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Digital Verifiable Certificates"
          subtitle="Cryptographically verified certificates of completion for advanced technical engineering tracks."
        />
        {isAdminOrStaff && (
          <Btn onClick={() => setIssueModalOpen(true)} className="self-start text-xs flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-white" />
            <span>Issue New Certificate</span>
          </Btn>
        )}
      </div>

      <div className="space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert>{err}</Alert>
      </div>

      {/* Public Cryptographic Verification Lookup Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Instant Credential Ledger Verification
          </h3>
        </div>
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Certificate Code (e.g. CERT-NEX-2026-9041)..."
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-2 pl-3 uppercase font-mono"
            />
          </div>
          <Btn type="submit" disabled={verifying || !verifyCode.trim()} className="text-xs flex items-center justify-center gap-1.5 shrink-0">
            <Search className="h-3.5 w-3.5 text-white" />
            <span>{verifying ? 'Verifying...' : 'Verify Authenticity'}</span>
          </Btn>
        </form>

        {verifyErr && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            {verifyErr}
          </div>
        )}

        {verifiedResult && (
          <div className="mt-3 rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 text-xs text-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Official Credential Verified Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500 block">Certificate Code:</span>
                <span className="font-mono font-bold text-slate-900">{verifiedResult.cert_code}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Awarded To:</span>
                <span className="font-semibold text-slate-900">{verifiedResult.student_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Program:</span>
                <span className="font-semibold text-slate-900">{verifiedResult.course_title}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Grade & Score:</span>
                <span className="font-bold text-emerald-700">Grade {verifiedResult.grade} ({verifiedResult.percentage}%)</span>
              </div>
            </div>
            <p className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-emerald-200/60">
              SHA256 Ledger Signature: {verifiedResult.verification_hash}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <Loading label="Querying credential ledger records..." />
      ) : certs.length === 0 ? (
        <Empty>No digital certificates recorded yet.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md ring-1 ring-emerald-600/20">
                    {c.cert_code}
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Grade {c.grade}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trainee</p>
                  <h4 className="text-base font-bold text-slate-900">{c.student_name}</h4>
                </div>

                <div className="mt-2.5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Program</p>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">{c.course_title}</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <span>Issued: {fmtDate(c.issue_date)}</span>
                  <span className="font-mono text-emerald-700 font-bold">{c.percentage}%</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCert(c)}
                  className="flex-1 rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors text-center"
                >
                  View Credential
                </button>
                <button
                  type="button"
                  onClick={() => copyVerificationLink(c.cert_code)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Copy verification link"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CERTIFICATE FULL MODAL VIEWER */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Official Certificate of Achievement</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={printCertificate}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="rounded-2xl border-4 border-double border-slate-200 bg-linear-to-b from-slate-50 to-white p-8 text-center space-y-5 shadow-xs">
              <div className="space-y-1">
                <p className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">
                  NEXSPHERE ACADEMY OF ADVANCED TECHNOLOGY
                </p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Certificate of Technical Excellence
                </h2>
                <p className="text-xs text-slate-500">
                  This certifies that
                </p>
              </div>

              <div className="py-2">
                <h3 className="text-3xl font-extrabold text-slate-900 underline decoration-emerald-500 decoration-2 underline-offset-8">
                  {selectedCert.student_name}
                </h3>
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                has successfully completed all rigorous curriculum milestones, laboratory architectures, and practical evaluations in
              </p>

              <h4 className="text-lg font-bold text-emerald-800">
                {selectedCert.course_title}
              </h4>

              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-200 py-3 text-xs max-w-md mx-auto">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Grade</span>
                  <span className="font-bold text-slate-900">{selectedCert.grade} Honors</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Percentage</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedCert.percentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Issue Date</span>
                  <span className="font-semibold text-slate-900">{fmtDate(selectedCert.issue_date)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-end justify-between text-left text-[11px] text-slate-500 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{selectedCert.issued_by}</p>
                  <p className="text-[10px] text-slate-400">Authorized Program Director</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800">{selectedCert.cert_code}</p>
                  <p className="text-[9px] font-mono text-slate-400 truncate max-w-xs">{selectedCert.verification_hash}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Issue Verifiable Digital Certificate</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a cryptographically stamped certificate for a graduating trainee.
            </p>

            <form onSubmit={handleIssueCert} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Trainee / Recipient *</label>
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
                <label className="block text-xs font-semibold text-slate-700">Course / Technical Track *</label>
                <select
                  required
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Final Grade *</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                  >
                    <option value="A">Grade A (Honors)</option>
                    <option value="B">Grade B (Proficient)</option>
                    <option value="C">Grade C (Satisfactory)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Final Percentage *</label>
                  <input
                    type="number"
                    min="60"
                    max="100"
                    required
                    value={form.percentage}
                    onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                    className="mt-1 w-full rounded-lg border-slate-300 text-xs shadow-xs focus:ring-emerald-500 py-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Btn tone="ghost" type="button" onClick={() => setIssueModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">Publish to Credential Ledger</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
