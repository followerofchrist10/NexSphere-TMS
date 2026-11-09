import { useState, useEffect } from 'react';
import { Video, Radio, Users, Clock, PlayCircle, ExternalLink, MessageSquare, Send, CheckCircle2, Wifi, Shield, Terminal, BookOpen, AlertCircle, X } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Btn, Empty, Loading, PageHeader, fmtDate } from '../components/ui';

export default function Classroom() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // Active Stream Viewer Modal
  const [activeSession, setActiveSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Alex Rivera (Instructor)', text: 'Welcome everyone! We will commence with the Raft leader election partition benchmarks.', at: '10:01 AM' },
    { id: 2, sender: 'Jordan Lee (Trainee)', text: 'Is the split-brain timeout randomized across a 150ms-300ms window?', at: '10:04 AM' },
    { id: 3, sender: 'Alex Rivera (Instructor)', text: 'Correct, that prevents split votes during simultaneous elections.', at: '10:05 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');

  const isAdminOrFaculty = ['admin', 'staff', 'instructor'].includes(profile?.role);

  const loadSessions = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/api/academic/live-sessions');
      setSessions(res.data.data || []);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'in_progress';
    try {
      await api.patch(`/api/academic/session-status/${id}`, { status: newStatus });
      setOk(`Session status updated to ${newStatus}.`);
      loadSessions();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const handlePingAttendance = async () => {
    if (!activeSession) return;
    try {
      const res = await api.post('/api/academic/ping-attendance', {
        lecture_id: activeSession.id,
        batch_id: activeSession.batch_id,
        watch_minutes: 45,
      });
      setCheckedIn(true);
      setCheckInMsg(res.data.message || 'Live session attendance confirmed!');
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: profile.full_name,
        text: newMessage.trim(),
        at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMessage('');
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Live Virtual Classroom Hub"
          subtitle="Real-time interactive technical broadcasts, live stream telemetry, and automated connection verification."
        />
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
            <span>Broadcast Gateway Online</span>
          </span>
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert>{err}</Alert>
      </div>

      {loading ? (
        <Loading label="Connecting to broadcast distribution servers..." />
      ) : sessions.length === 0 ? (
        <Empty>No scheduled live online sessions found.</Empty>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const isLive = s.status === 'in_progress';
            const isCompleted = s.status === 'completed';

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md ring-1 ring-emerald-600/20">
                        {s.course_code} · Lecture #{s.lecture_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isLive
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isLive && <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />}
                        {isLive ? 'Live Stream Active' : isCompleted ? 'Recorded Archive' : 'Scheduled'}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {fmtDate(s.date)} at {s.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{s.topic}</h3>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-0.5">
                      <span>Course: <strong className="text-slate-800">{s.course_title}</strong></span>
                      <span>Faculty: <strong className="text-slate-800">{s.instructor_name}</strong></span>
                      <span>Cohort: <strong className="text-slate-800">{s.batch_name}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSession(s);
                        setCheckedIn(false);
                        setCheckInMsg('');
                      }}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>{isLive ? 'Join Live Classroom' : 'Launch Session Hub'}</span>
                    </button>

                    {isAdminOrFaculty && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {isLive ? 'Conclude Stream' : 'Set as Live'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE CLASSROOM MODAL */}
      {activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">{activeSession.topic}</h3>
                  <p className="text-[11px] text-slate-400">
                    {activeSession.course_title} · Faculty: {activeSession.instructor_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
                  <Wifi className="h-3 w-3" />
                  <span>1080p60 · 48ms</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSession(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Video Viewport & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 min-h-[460px] overflow-hidden">
              {/* Virtual Video Viewport */}
              <div className="lg:col-span-2 bg-black flex flex-col justify-between p-6 relative">
                <div className="absolute inset-0 bg-radial from-slate-900/40 to-black flex flex-col items-center justify-center text-center p-6">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                    <Video className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Live Technical Broadcast Active</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    High-throughput stream synchronized with interactive laboratory workspace.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 border border-slate-700">
                      Bitrate: 6,240 kbps
                    </span>
                    <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 border border-slate-700">
                      Codec: AV1 / Opus
                    </span>
                    <span className="rounded-md bg-emerald-950/80 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-emerald-800">
                      Active Trainees: 34
                    </span>
                  </div>
                </div>

                {/* Bottom Control Strip */}
                <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      disabled={checkedIn}
                      onClick={handlePingAttendance}
                      className={`rounded-lg px-3 py-1.5 font-bold transition-all flex items-center gap-1.5 ${
                        checkedIn
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{checkedIn ? 'Attendance Confirmed' : 'Check In to Live Session'}</span>
                    </button>
                    {checkInMsg && <span className="text-[11px] text-emerald-400 font-medium">{checkInMsg}</span>}
                  </div>

                  <a
                    href={activeSession.materials_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>External Meeting Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Sidebar Q&A Chat */}
              <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
                <div className="border-b border-slate-800 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Live Technical Q&A</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{chatMessages.length} messages</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 max-h-[320px]">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="rounded-lg bg-slate-800/60 p-2.5 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-400">{msg.sender}</span>
                        <span className="text-slate-500">{msg.at}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a technical question..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 rounded-lg border-slate-700 bg-slate-800 text-xs text-white placeholder-slate-500 py-1.5 px-3 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
