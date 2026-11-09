import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Radio, UserCheck, Terminal, X, Plus, Calendar, Download, ExternalLink } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Badge, Btn, Empty, Loading, PageHeader, fmtDate, money } from '../components/ui';

const CATEGORIES = [
  'All Domains',
  'Cloud & Infrastructure',
  'Artificial Intelligence',
  'Cybersecurity',
  'Backend Systems',
  'DevOps & SRE',
  'Mobile Engineering',
];

export default function AdminCourses() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // Filtering
  const [categoryFilter, setCategoryFilter] = useState('All Domains');
  const [search, setSearch] = useState('');

  // Modals
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [lectureDrawerOpen, setLectureDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Lectures for selected course
  const [courseLectures, setCourseLectures] = useState([]);
  const [lectureLoading, setLectureLoading] = useState(false);
  const [newLectureForm, setNewLectureForm] = useState({
    topic: '',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Computing Lab 402',
    materials_url: '',
    lab_exercise: '',
  });

  // Course Form
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    category: 'Cloud & Infrastructure',
    commencing_date: new Date().toISOString().slice(0, 10),
    duration: '16 Weeks (48 Lectures)',
    total_lectures: 32,
    credits: 4,
    price: 14500,
    tech_stack: 'Docker, Kubernetes, Go, Redis',
    syllabus: '',
  });

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    course_id: '',
    instructor_id: '',
    asset_id: '',
    batch_name: '',
    commencing_date: new Date().toISOString().slice(0, 10),
    ends_on: '2027-04-15',
    capacity: 35,
    student_ids: [],
  });

  const loadData = async () => {
    setLoading(true);
    setErr('');
    try {
      const [cRes, bRes, iRes, aRes, sRes] = await Promise.all([
        api.get('/api/courses', { params: { pageSize: 100 } }),
        api.get('/api/batches', { params: { pageSize: 100 } }),
        api.get('/api/instructors', { params: { pageSize: 100 } }),
        api.get('/api/assets', { params: { pageSize: 100 } }),
        api.get('/api/students', { params: { pageSize: 100 } }),
      ]);
      setCourses(cRes.data.data || []);
      setBatches(bRes.data.data || []);
      setInstructors(iRes.data.data || []);
      setAssets(aRes.data.data || []);
      setStudents(sRes.data.data || []);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openLectures = async (course) => {
    setSelectedCourse(course);
    setLectureDrawerOpen(true);
    setLectureLoading(true);
    try {
      const res = await api.get('/api/lectures', { params: { courseId: course.id } });
      setCourseLectures(res.data.data || []);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLectureLoading(false);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.post('/api/lectures', {
        course_id: selectedCourse.id,
        ...newLectureForm,
      });
      setOk('Lecture added successfully to syllabus.');
      // Refresh lectures
      const res = await api.get('/api/lectures', { params: { courseId: selectedCourse.id } });
      setCourseLectures(res.data.data || []);
      setNewLectureForm({
        topic: '',
        date: new Date().toISOString().slice(0, 10),
        time: '09:00 AM - 10:30 AM',
        room: 'Cloud Computing Lab 402',
        materials_url: '',
        lab_exercise: '',
      });
    } catch (err) {
      setErr(errorMessage(err));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/courses', {
        code: courseForm.code.trim().toUpperCase(),
        title: courseForm.title.trim(),
        category: courseForm.category,
        commencing_date: courseForm.commencing_date,
        duration: courseForm.duration,
        total_lectures: Number(courseForm.total_lectures),
        credits: Number(courseForm.credits),
        price: Number(courseForm.price),
        syllabus: courseForm.syllabus || `### ${courseForm.title}\nTech stack: ${courseForm.tech_stack}`,
        is_active: true,
      });
      setOk(`Created tech course ${courseForm.code} successfully!`);
      setCourseModalOpen(false);
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await api.post('/api/academic/assign-course', assignForm);
      setOk(res.data.data.message || 'Course and batch assigned successfully!');
      setAssignModalOpen(false);
      loadData();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const openAssignModalForCourse = (course) => {
    setSelectedCourse(course);
    setAssignForm({
      course_id: course.id,
      instructor_id: instructors[0]?.id || '',
      asset_id: assets[0]?.id || '',
      batch_name: `${course.code} - ${course.title} (Batch Beta)`,
      commencing_date: course.commencing_date || new Date().toISOString().slice(0, 10),
      ends_on: '2027-04-15',
      capacity: 35,
      student_ids: students.map((s) => s.id),
    });
    setAssignModalOpen(true);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesCategory =
        categoryFilter === 'All Domains' || c.category === categoryFilter;
      const matchesSearch =
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.code?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, categoryFilter, search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Curriculum & Course Assignment Portal"
          subtitle="Manage tech-only curricula, commencing dates, structured lecture plans, and faculty assignments."
        />
        {['admin', 'staff'].includes(profile?.role) && (
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => setCourseModalOpen(true)}>+ New Tech Course</Btn>
            <Btn
              tone="ghost"
              onClick={() => {
                if (courses.length > 0) openAssignModalForCourse(courses[0]);
              }}
            >
              Assign Course / Batch
            </Btn>
          </div>
        )}
      </div>

      <div className="space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert>{err}</Alert>
      </div>

      {/* Domain Filters & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border-slate-300 text-xs shadow-xs focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <Loading label="Loading tech courses and syllabi..." />
      ) : filteredCourses.length === 0 ? (
        <Empty>No courses found in this category.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c) => {
            const courseBatches = batches.filter((b) => b.course_id === c.id);
            return (
              <div
                key={c.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-mono font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                      {c.code}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {c.credits || 4} Credits
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {c.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Category: <span className="text-slate-800">{c.category || 'Tech Core'}</span>
                  </p>

                  {/* Commencing Date Pill */}
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Commencing: {c.commencing_date ? fmtDate(c.commencing_date) : 'Nov 15, 2026'}
                  </div>

                  {/* Tech stack tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(Array.isArray(c.tech_stack)
                      ? c.tech_stack
                      : typeof c.tech_stack === 'string'
                      ? c.tech_stack.split(',')
                      : ['Cloud', 'Docker', 'Systems']
                    ).slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600"
                      >
                        {typeof tech === 'string' ? tech.trim() : tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <span>{c.duration || '16 Weeks'}</span> · <span>{c.total_lectures || 32} Lectures planned</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>Active Batches: <strong className="text-slate-800">{courseBatches.length}</strong></span>
                    <span className="font-semibold text-slate-900">{money(c.price)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openLectures(c)}
                      className="flex-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Lecture Matrix</span>
                    </button>
                    {['admin', 'staff'].includes(profile?.role) && (
                      <button
                        type="button"
                        onClick={() => openAssignModalForCourse(c)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Assign course to students or batches"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Lecture Plan Drawer / Modal */}
      {lectureDrawerOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800">
                    {selectedCourse.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Curriculum Lecture Matrix</span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{selectedCourse.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Commencing Date: <strong className="text-slate-800">{selectedCourse.commencing_date ? fmtDate(selectedCourse.commencing_date) : 'Nov 15, 2026'}</strong> · Total Delivered: {courseLectures.filter(l => l.status === 'completed').length} / {courseLectures.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLectureDrawerOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Add New Lecture Form */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                + Schedule / Add Lecture for this Course
              </h4>
              <form onSubmit={handleAddLecture} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600">Lecture Topic / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Consensus: Raft vs Paxos"
                    value={newLectureForm.topic}
                    onChange={(e) => setNewLectureForm({ ...newLectureForm, topic: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">Lecture Date</label>
                  <input
                    type="date"
                    required
                    value={newLectureForm.date}
                    onChange={(e) => setNewLectureForm({ ...newLectureForm, date: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">Time Window</label>
                  <input
                    type="text"
                    value={newLectureForm.time}
                    onChange={(e) => setNewLectureForm({ ...newLectureForm, time: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600">Classroom / Lab Venue</label>
                  <input
                    type="text"
                    value={newLectureForm.room}
                    onChange={(e) => setNewLectureForm({ ...newLectureForm, room: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600">Hands-on Lab Exercise</label>
                  <input
                    type="text"
                    placeholder="e.g. Deploy 3-node Raft cluster in Docker"
                    value={newLectureForm.lab_exercise}
                    onChange={(e) => setNewLectureForm({ ...newLectureForm, lab_exercise: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end">
                  <Btn type="submit" tone="primary" className="text-xs">
                    Save Lecture to Plan
                  </Btn>
                </div>
              </form>
            </div>

            {/* Lecture Matrix List */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Delivered & Scheduled Lectures ({courseLectures.length})
              </h4>
              {lectureLoading ? (
                <Loading label="Fetching lectures..." />
              ) : courseLectures.length === 0 ? (
                <Empty>No lectures created yet for this course. Add one above.</Empty>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {courseLectures.map((lec) => (
                    <div key={lec.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            Lec #{lec.lecture_number}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            lec.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lec.status}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-slate-600">{fmtDate(lec.date)} ({lec.time})</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{lec.topic}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Radio className="h-3 w-3 text-slate-400" /><span>{lec.room}</span></span>
                          <span className="flex items-center gap-1"><UserCheck className="h-3 w-3 text-slate-400" /><span>{lec.instructor_name}</span></span>
                          {lec.lab_exercise && (
                            <span className="flex items-center gap-1 text-emerald-700"><Terminal className="h-3 w-3" /><span>Lab: {lec.lab_exercise}</span></span>
                          )}
                        </div>
                      </div>

                      {lec.materials_url && (
                        <div className="mt-2 sm:mt-0">
                          <a
                            href={lec.materials_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                          >
                            <span>Slide Deck PDF</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Create Tech Course */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">+ Add New Technical Course</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly tech-focused curriculum (systems, cloud, AI, cybersecurity, DevOps).
            </p>

            <form onSubmit={handleCreateCourse} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CLOUD-ARCH, AI-SYSTEMS"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Tech Category *</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Domains').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Performance Distributed Systems & Consensus"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Commencing Date *</label>
                  <input
                    type="date"
                    required
                    value={courseForm.commencing_date}
                    onChange={(e) => setCourseForm({ ...courseForm, commencing_date: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Planned Lectures</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={courseForm.total_lectures}
                    onChange={(e) => setCourseForm({ ...courseForm, total_lectures: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Tuition Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Tech Stack Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Go, Kubernetes, gRPC, Redis, Kafka"
                  value={courseForm.tech_stack}
                  onChange={(e) => setCourseForm({ ...courseForm, tech_stack: e.target.value })}
                  className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Syllabus Overview & Modules</label>
                <textarea
                  rows="3"
                  placeholder="Module 1: Foundations... Module 2: Consensus..."
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })}
                  className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Btn tone="ghost" type="button" onClick={() => setCourseModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">Create Course</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Course to Batch & Students */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Assign Course & Batch Allocation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign technical courses, set commencing dates, allocate faculty, and enroll students.
            </p>

            <form onSubmit={handleAssignCourse} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700">Select Technical Course *</label>
                <select
                  required
                  value={assignForm.course_id}
                  onChange={(e) => {
                    const c = courses.find((item) => item.id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      course_id: e.target.value,
                      commencing_date: c?.commencing_date || assignForm.commencing_date,
                      batch_name: c ? `${c.code} - ${c.title} (Batch Beta)` : assignForm.batch_name,
                    });
                  }}
                  className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                >
                  <option value="">Choose a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Course Commencing Date *</label>
                  <input
                    type="date"
                    required
                    value={assignForm.commencing_date}
                    onChange={(e) => setAssignForm({ ...assignForm, commencing_date: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Semester End Date *</label>
                  <input
                    type="date"
                    required
                    value={assignForm.ends_on}
                    onChange={(e) => setAssignForm({ ...assignForm, ends_on: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Assign Faculty / Instructor</label>
                  <select
                    value={assignForm.instructor_id}
                    onChange={(e) => setAssignForm({ ...assignForm, instructor_id: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  >
                    {instructors.map((ins) => (
                      <option key={ins.id} value={ins.id}>{ins.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Classroom / Lab Venue</label>
                  <select
                    value={assignForm.asset_id}
                    onChange={(e) => setAssignForm({ ...assignForm, asset_id: e.target.value })}
                    className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                  >
                    {assets.map((ast) => (
                      <option key={ast.id} value={ast.id}>{ast.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Batch Name</label>
                <input
                  type="text"
                  required
                  value={assignForm.batch_name}
                  onChange={(e) => setAssignForm({ ...assignForm, batch_name: e.target.value })}
                  className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Select Students to Enroll ({assignForm.student_ids.length} selected)
                </label>
                <div className="mt-1 max-h-36 overflow-y-auto rounded-md border border-slate-200 p-2 space-y-1.5 bg-slate-50">
                  {students.map((st) => (
                    <label key={st.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignForm.student_ids.includes(st.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignForm({
                              ...assignForm,
                              student_ids: [...assignForm.student_ids, st.id],
                            });
                          } else {
                            setAssignForm({
                              ...assignForm,
                              student_ids: assignForm.student_ids.filter((id) => id !== st.id),
                            });
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{st.full_name} ({st.email})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Btn tone="ghost" type="button" onClick={() => setAssignModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">Assign Batch & Commencing Date</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
