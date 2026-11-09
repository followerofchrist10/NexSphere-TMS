import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tables } from '../mockEngine.js';

export const academic = Router();
academic.use(authenticate);

/**
 * Attendance Analytics & Eligibility Calculator
 * Returns training course-wise breakdown, aggregate attendance %,
 * and session buffer / sessions needed calculations.
 */
academic.get('/attendance-summary', (req, res) => {
  const studentId = req.query.studentId || req.user.id;

  // Find all batches where student has approved application (or all batches if demo student)
  const userApps = tables.applications.filter(
    (a) => a.student_id === studentId && a.status === 'approved'
  );
  let batchIds = userApps.map((a) => a.batch_id);

  if (batchIds.length === 0) {
    batchIds = tables.batches.map((b) => b.id);
  }

  const courseBreakdowns = [];
  let totalOverallDelivered = 0;
  let totalOverallAttended = 0;

  batchIds.forEach((bId) => {
    const batch = tables.batches.find((b) => b.id === bId);
    if (!batch) return;
    const course = tables.courses.find((c) => c.id === batch.course_id);
    const instructor = tables.profiles.find((p) => p.id === batch.instructor_id);
    const asset = tables.assets.find((a) => a.id === batch.asset_id);

    // Attendance logs for this student in this batch
    const records = tables.attendance
      .filter((att) => att.batch_id === bId && att.student_id === studentId)
      .sort((a, b) => new Date(b.on_date) - new Date(a.on_date));

    const totalDelivered = records.length;
    const attended = records.filter((r) => ['present', 'late'].includes(r.status)).length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;

    totalOverallDelivered += totalDelivered;
    totalOverallAttended += attended;

    const percentage = totalDelivered > 0 ? Number(((attended / totalDelivered) * 100).toFixed(1)) : 100;

    // Online session buffer vs required sessions (75% certification threshold)
    let marginStatus = 'safe';
    let calculatorMessage = '';
    let sessionBuffer = 0;
    let classesNeeded = 0;

    if (percentage >= 75) {
      marginStatus = 'safe';
      sessionBuffer = Math.max(0, Math.floor((attended - 0.75 * totalDelivered) / 0.75));
      calculatorMessage =
        sessionBuffer > 0
          ? `You have a safety buffer of ${sessionBuffer} online session${sessionBuffer > 1 ? 's' : ''} while maintaining the mandatory 75% certification eligibility.`
          : 'Attendance is right on the 75% boundary. Attend the upcoming live technical session to build a safety buffer.';
    } else if (percentage >= 65) {
      marginStatus = 'warning';
      classesNeeded = Math.ceil((0.75 * totalDelivered - attended) / 0.25);
      calculatorMessage = `Attendance Warning: Currently below 75%. Attend the next ${classesNeeded} consecutive live online session${classesNeeded > 1 ? 's' : ''} to restore certification standing.`;
    } else {
      marginStatus = 'defaulter';
      classesNeeded = Math.ceil((0.75 * totalDelivered - attended) / 0.25);
      calculatorMessage = `Certification Eligibility Risk: Below minimum criteria. You must attend the next ${classesNeeded} consecutive live session${classesNeeded > 1 ? 's' : ''} to qualify for course certification.`;
    }

    // Attach lecture details to records
    const enrichedRecords = records.map((r) => {
      const lecture = tables.lectures.find((l) => l.id === r.lecture_id);
      return {
        id: r.id,
        date: r.on_date,
        status: r.status,
        lecture_number: lecture?.lecture_number || null,
        topic: lecture?.topic || 'Practical Lab Session',
        time: lecture?.time || 'Scheduled Time',
        room: lecture?.room || asset?.name || 'Live Virtual Stream',
      };
    });

    courseBreakdowns.push({
      batch_id: bId,
      batch_name: batch.name,
      course_id: course?.id || 'crs-unknown',
      course_code: course?.code || 'TECH-TRACK',
      course_title: course?.title || 'Technical Architecture Course',
      category: course?.category || 'Tech Core',
      commencing_date: course?.commencing_date || batch.starts_on,
      ends_on: batch.ends_on,
      total_curriculum_lectures: course?.total_lectures || 36,
      credits: course?.credits || 4,
      instructor_name: instructor?.full_name || 'Faculty Lead',
      room_name: asset?.name || 'Live Virtual Stream',
      total_delivered: totalDelivered,
      attended,
      absent,
      late,
      percentage,
      margin_status: marginStatus,
      session_buffer: sessionBuffer,
      classes_needed: classesNeeded,
      calculator_message: calculatorMessage,
      records: enrichedRecords,
    });
  });

  const overallPercentage =
    totalOverallDelivered > 0
      ? Number(((totalOverallAttended / totalOverallDelivered) * 100).toFixed(1))
      : 100;

  res.json({
    data: {
      overall: {
        percentage: overallPercentage,
        total_delivered: totalOverallDelivered,
        total_attended: totalOverallAttended,
        status: overallPercentage >= 75 ? 'safe' : overallPercentage >= 65 ? 'warning' : 'defaulter',
      },
      courses: courseBreakdowns,
    },
  });
});

/**
 * Institutional Attendance Audit & Telemetry (Administrator Only)
 * High-altitude oversight: batch-wise delivery, student compliance %, and full logs.
 */
academic.get('/attendance-audit', (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Institutional attendance audit is strictly restricted to administrators.' });
  }

  const { batchId, search } = req.query;

  let records = [...tables.attendance];
  if (batchId) {
    records = records.filter((r) => r.batch_id === batchId);
  }

  // Enrich records
  const enrichedRecords = records.map((r) => {
    const student = tables.profiles.find((p) => p.id === r.student_id);
    const batch = tables.batches.find((b) => b.id === r.batch_id);
    const course = batch ? tables.courses.find((c) => c.id === batch.course_id) : null;
    const lecture = tables.lectures.find((l) => l.id === r.lecture_id);

    return {
      id: r.id,
      date: r.on_date,
      status: r.status,
      student_id: r.student_id,
      student_name: student?.full_name || 'Trainee',
      student_email: student?.email || '',
      batch_id: r.batch_id,
      batch_name: batch?.name || 'Cohort',
      course_title: course?.title || 'Course',
      lecture_topic: lecture?.topic || 'Session',
      lecture_number: lecture?.lecture_number || null,
      marked_by: r.marked_by || 'system',
    };
  });

  const filtered = search
    ? enrichedRecords.filter(
        (r) =>
          r.student_name.toLowerCase().includes(search.toLowerCase()) ||
          r.student_email.toLowerCase().includes(search.toLowerCase()) ||
          r.batch_name.toLowerCase().includes(search.toLowerCase())
      )
    : enrichedRecords;

  // Batch summary metrics
  const batchSummaries = tables.batches.map((b) => {
    const course = tables.courses.find((c) => c.id === b.course_id);
    const instructor = tables.profiles.find((p) => p.id === b.instructor_id);
    const bRecords = tables.attendance.filter((r) => r.batch_id === b.id);
    const bAttended = bRecords.filter((r) => ['present', 'late'].includes(r.status)).length;
    const bPct = bRecords.length > 0 ? Number(((bAttended / bRecords.length) * 100).toFixed(1)) : 100;
    const enrolledStudents = tables.applications.filter((a) => a.batch_id === b.id && a.status === 'approved').length;

    return {
      batch_id: b.id,
      batch_name: b.name,
      course_title: course?.title || 'Technical Track',
      instructor_name: instructor?.full_name || 'Faculty Lead',
      starts_on: b.starts_on,
      ends_on: b.ends_on,
      total_enrolled: enrolledStudents,
      total_records_marked: bRecords.length,
      attendance_percentage: bPct,
      compliance_status: bPct >= 75 ? 'compliant' : bPct >= 65 ? 'warning' : 'breached',
    };
  });

  const totalMarked = tables.attendance.length;
  const totalAttended = tables.attendance.filter((r) => ['present', 'late'].includes(r.status)).length;
  const institutionalAvg = totalMarked > 0 ? Number(((totalAttended / totalMarked) * 100).toFixed(1)) : 100;

  res.json({
    data: {
      stats: {
        total_batches: tables.batches.length,
        total_records_marked: totalMarked,
        institutional_attendance_rate: institutionalAvg,
        compliant_batches: batchSummaries.filter((b) => b.compliance_status === 'compliant').length,
      },
      batch_summaries: batchSummaries,
      records: filtered,
    },
  });
});

/**
 * Grade Analytics & Visual Distribution
 * Computes grade brackets (A, B, C, D, F) and summary statistics
 * for faculty to analyze performance.
 */
academic.get('/grade-analytics', (req, res) => {
  const { batchId, courseId, studentId } = req.query;
  let list = [...tables.grades];

  // Zero-trust student data isolation: students can only see their own grade evaluations
  if (req.user.role === 'student') {
    list = list.filter((g) => g.student_id === req.user.id);
  } else if (studentId) {
    list = list.filter((g) => g.student_id === studentId);
  }

  if (batchId) {
    list = list.filter((g) => g.batch_id === batchId);
  } else if (courseId) {
    const courseBatches = tables.batches.filter((b) => b.course_id === courseId).map((b) => b.id);
    list = list.filter((g) => courseBatches.includes(g.batch_id));
  }

  // Calculate percentages
  const percentages = list.map((g) => (g.max_score > 0 ? (g.score / g.max_score) * 100 : 0));

  const distribution = {
    A: { label: 'Grade A (90% - 100%)', count: 0, min: 90, max: 100, color: '#10b981' },
    B: { label: 'Grade B (80% - 89%)', count: 0, min: 80, max: 89.9, color: '#3b82f6' },
    C: { label: 'Grade C (70% - 79%)', count: 0, min: 70, max: 79.9, color: '#f59e0b' },
    D: { label: 'Grade D (60% - 69%)', count: 0, min: 60, max: 69.9, color: '#f97316' },
    F: { label: 'Grade F (< 60%)', count: 0, min: 0, max: 59.9, color: '#ef4444' },
  };

  percentages.forEach((pct) => {
    if (pct >= 90) distribution.A.count++;
    else if (pct >= 80) distribution.B.count++;
    else if (pct >= 70) distribution.C.count++;
    else if (pct >= 60) distribution.D.count++;
    else distribution.F.count++;
  });

  const totalGraded = percentages.length;
  const distributionArray = Object.entries(distribution).map(([key, val]) => ({
    grade: key,
    label: val.label,
    count: val.count,
    color: val.color,
    percentage: totalGraded > 0 ? Number(((val.count / totalGraded) * 100).toFixed(1)) : 0,
  }));

  const avg =
    totalGraded > 0
      ? Number((percentages.reduce((a, b) => a + b, 0) / totalGraded).toFixed(1))
      : 0;

  const sortedPct = [...percentages].sort((a, b) => a - b);
  const median =
    totalGraded > 0
      ? Number(
          (
            totalGraded % 2 === 0
              ? (sortedPct[totalGraded / 2 - 1] + sortedPct[totalGraded / 2]) / 2
              : sortedPct[Math.floor(totalGraded / 2)]
          ).toFixed(1)
        )
      : 0;

  const highest = totalGraded > 0 ? Math.max(...percentages) : 0;
  const lowest = totalGraded > 0 ? Math.min(...percentages) : 0;
  const passedCount = percentages.filter((p) => p >= 60).length;
  const passRate = totalGraded > 0 ? Number(((passedCount / totalGraded) * 100).toFixed(1)) : 0;

  // Enrich grade list for table display
  const enrichedList = list.map((g) => {
    const student = tables.profiles.find((p) => p.id === g.student_id);
    const batch = tables.batches.find((b) => b.id === g.batch_id);
    const course = tables.courses.find((c) => c.id === batch?.course_id);
    const pct = g.max_score > 0 ? Number(((g.score / g.max_score) * 100).toFixed(1)) : 0;
    let letter = 'F';
    if (pct >= 90) letter = 'A';
    else if (pct >= 80) letter = 'B';
    else if (pct >= 70) letter = 'C';
    else if (pct >= 60) letter = 'D';

    return {
      ...g,
      student_name: student?.full_name || 'Enrolled Trainee',
      student_email: student?.email || '',
      batch_name: batch?.name || 'Training Cohort',
      course_title: course?.title || 'Technical Course',
      percentage: pct,
      letter_grade: letter,
    };
  });

  res.json({
    data: {
      summary: {
        total_evaluations: totalGraded,
        average_score: avg,
        median_score: median,
        highest_score: Number(highest.toFixed(1)),
        lowest_score: Number(lowest.toFixed(1)),
        pass_rate: passRate,
      },
      distribution: distributionArray,
      grades: enrichedList,
    },
  });
});

/**
 * Assign or Update Student Grade
 * Available to Administrators and Instructors
 */
academic.post('/assign-grade', (req, res) => {
  const { id, batch_id, student_id, assessment, score, max_score, notes } = req.body;

  if (!batch_id || !student_id || !assessment || score === undefined) {
    return res.status(422).json({ error: 'batch_id, student_id, assessment, and score are required' });
  }

  const numScore = Number(score);
  const numMax = Number(max_score) || 100;

  if (id) {
    // Update existing grade
    const idx = tables.grades.findIndex((g) => g.id === id);
    if (idx >= 0) {
      tables.grades[idx] = {
        ...tables.grades[idx],
        batch_id,
        student_id,
        assessment,
        score: numScore,
        max_score: numMax,
        notes: notes || '',
        graded_at: new Date().toISOString(),
        graded_by: req.user.id,
      };
      return res.json({ data: tables.grades[idx], message: 'Grade updated successfully' });
    }
  }

  // Create new grade
  const newGrade = {
    id: `grd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    batch_id,
    student_id,
    assessment,
    score: numScore,
    max_score: numMax,
    notes: notes || '',
    graded_at: new Date().toISOString(),
    graded_by: req.user.id,
  };

  tables.grades.unshift(newGrade);
  res.status(201).json({ data: newGrade, message: 'Grade assigned successfully' });
});

/**
 * Delete Grade Entry
 */
academic.delete('/grades/:id', (req, res) => {
  const { id } = req.params;
  tables.grades = tables.grades.filter((g) => g.id !== id);
  res.status(204).end();
});

/**
 * Admin Course Assignment & Cohort Allocation
 */
academic.post('/assign-course', (req, res) => {
  const {
    course_id,
    instructor_id,
    asset_id,
    batch_name,
    commencing_date,
    ends_on,
    capacity,
    student_ids,
  } = req.body;

  if (!course_id || !commencing_date) {
    return res.status(422).json({ error: 'course_id and commencing_date are required' });
  }

  const course = tables.courses.find((c) => c.id === course_id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  course.commencing_date = commencing_date;

  const batchId = `btc-${course.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36).slice(-4)}`;
  const newBatch = {
    id: batchId,
    course_id,
    instructor_id: instructor_id || 'usr-inst-1',
    asset_id: asset_id || 'ast-lab-402',
    name: batch_name || `${course.title} (Commencing ${commencing_date})`,
    starts_on: commencing_date,
    ends_on: ends_on || '2027-04-30',
    capacity: Number(capacity) || 35,
    is_open: true,
    created_at: new Date().toISOString(),
  };

  tables.batches.unshift(newBatch);

  // Enroll selected students
  if (Array.isArray(student_ids) && student_ids.length > 0) {
    student_ids.forEach((sId) => {
      tables.applications.push({
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        student_id: sId,
        batch_id: batchId,
        status: 'approved',
        created_at: new Date().toISOString(),
      });
    });
  }

  // Generate initial lecture plan if empty
  const existingLectures = tables.lectures.filter((l) => l.course_id === course_id);
  if (existingLectures.length === 0) {
    const defaultTopics = [
      'Technical Orientation, Architecture Overview & Environment Setup',
      'Core Protocols, Theoretical Foundations & System Constraints',
      'Architectural Design Patterns & High-Throughput Pipelines',
      'Hands-on Lab: Containerized Development Environment',
      'State Management, Serialization & Protocol Verification',
      'High-Throughput Concurrency & Worker Orchestration',
      'Resilience Engineering, Chaos Testing & Fault Isolation',
      'Production Deployment, Monitoring & Observability SRE',
    ];

    defaultTopics.forEach((topic, idx) => {
      const lecDate = new Date(commencing_date);
      lecDate.setDate(lecDate.getDate() + idx * 3);
      tables.lectures.push({
        id: `lec-${batchId}-${idx + 1}`,
        course_id,
        batch_id: batchId,
        lecture_number: idx + 1,
        topic,
        date: lecDate.toISOString().slice(0, 10),
        time: idx % 2 === 0 ? '09:00 AM - 10:30 AM' : '11:00 AM - 12:30 PM',
        room: tables.assets.find((a) => a.id === asset_id)?.name || 'Cloud Computing Lab 402',
        instructor_name: tables.profiles.find((p) => p.id === instructor_id)?.full_name || 'Assigned Instructor',
        status: idx === 0 ? 'completed' : 'upcoming',
        materials_url: `https://docs.nexsphere.edu/${course.code.toLowerCase()}/session-${idx + 1}.pdf`,
        lab_exercise: `Practical Lab Exercise ${idx + 1} for ${course.title}`,
        created_at: new Date().toISOString(),
      });
    });
  }

  res.status(201).json({
    data: {
      batch: newBatch,
      enrolled_count: student_ids?.length || 0,
      message: `Training course assigned successfully with commencing date ${commencing_date}.`,
    },
  });
});

/**
 * ----------------------------------------------------
 * RARE FEATURE 1: Digital Verifiable Certificates
 * ----------------------------------------------------
 */
academic.get('/certificates', (req, res) => {
  const isStudent = req.user.role === 'student';
  let list = [...(tables.certificates || [])];
  if (isStudent) {
    list = list.filter((c) => c.student_id === req.user.id);
  }
  res.json({ data: list });
});

academic.post('/issue-certificate', (req, res) => {
  if (req.user.role === 'student') {
    return res.status(403).json({ error: 'Only administrators and instructors can issue certificates.' });
  }

  const { student_id, course_id, batch_id, grade, percentage } = req.body;
  if (!student_id || !course_id) {
    return res.status(422).json({ error: 'student_id and course_id are required' });
  }

  const student = tables.profiles.find((p) => p.id === student_id);
  const course = tables.courses.find((c) => c.id === course_id);
  const randomHex = Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
  const certNumber = Math.floor(1000 + Math.random() * 9000);

  const cert = {
    id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    cert_code: `CERT-NEX-${new Date().getFullYear()}-${certNumber}`,
    student_id,
    student_name: student?.full_name || 'Technical Trainee',
    course_id,
    course_title: course?.title || 'Advanced Technical Program',
    batch_id: batch_id || 'btc-general',
    issue_date: new Date().toISOString().slice(0, 10),
    grade: grade || 'A',
    percentage: Number(percentage) || 95.0,
    verification_hash: `sha256:${randomHex}${randomHex}`,
    status: 'active',
    issued_by: req.user.name || 'Dr. Sarah Chen, Director of Technical Programs',
  };

  tables.certificates.unshift(cert);
  res.status(201).json({ data: cert, message: 'Cryptographic certificate issued successfully' });
});

academic.get('/verify-certificate/:code', (req, res) => {
  const code = req.params.code?.trim().toUpperCase();
  const cert = tables.certificates.find((c) => c.cert_code.toUpperCase() === code);
  if (!cert) {
    return res.status(404).json({ error: 'Certificate record not found in NexSphere verification ledger.' });
  }
  res.json({
    data: {
      valid: cert.status === 'active',
      cert_code: cert.cert_code,
      student_name: cert.student_name,
      course_title: cert.course_title,
      issue_date: cert.issue_date,
      grade: cert.grade,
      percentage: cert.percentage,
      verification_hash: cert.verification_hash,
      issued_by: cert.issued_by,
      status: cert.status,
    },
  });
});

/**
 * ----------------------------------------------------
 * RARE FEATURE 2: Practical Code Lab Submissions & Review
 * ----------------------------------------------------
 */
academic.get('/submissions', (req, res) => {
  const isStudent = req.user.role === 'student';
  let list = [...(tables.submissions || [])];
  if (isStudent) {
    list = list.filter((s) => s.student_id === req.user.id);
  }
  res.json({ data: list });
});

academic.post('/submit-lab', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only student trainees can submit lab deliverables for review.' });
  }

  const { batch_id, course_id, lecture_id, assignment_title, repo_url, deploy_url, notes } = req.body;
  if (!repo_url || !assignment_title) {
    return res.status(422).json({ error: 'Repository URL and assignment title are required.' });
  }

  const student = tables.profiles.find((p) => p.id === req.user.id) || req.user;
  const newSub = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    student_id: req.user.id,
    student_name: student.full_name || student.name || 'Technical Trainee',
    batch_id: batch_id || 'btc-cloud-a',
    course_id: course_id || 'crs-cloud-arch',
    lecture_id: lecture_id || 'lec-general',
    assignment_title,
    repo_url,
    deploy_url: deploy_url || '',
    notes: notes || '',
    submitted_at: new Date().toISOString(),
    status: 'under_review',
    ci_status: 'passed',
    score: null,
    max_score: 100,
    reviewer_notes: '',
    reviewer_id: null,
  };

  tables.submissions.unshift(newSub);
  res.status(201).json({ data: newSub, message: 'Technical deliverable submitted for evaluation.' });
});

academic.patch('/review-submission/:id', (req, res) => {
  if (req.user.role === 'student') {
    return res.status(403).json({ error: 'Only instructors and administrators can evaluate code submissions.' });
  }

  const { id } = req.params;
  const { score, reviewer_notes, status } = req.body;

  const idx = tables.submissions.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Submission not found' });

  const numScore = Number(score);
  tables.submissions[idx] = {
    ...tables.submissions[idx],
    score: isNaN(numScore) ? tables.submissions[idx].score : numScore,
    reviewer_notes: reviewer_notes !== undefined ? reviewer_notes : tables.submissions[idx].reviewer_notes,
    status: status || 'graded',
    reviewer_id: req.user.id,
    reviewed_at: new Date().toISOString(),
  };

  // If graded, automatically insert or update in grade management
  if (!isNaN(numScore)) {
    const sub = tables.submissions[idx];
    const gradeIdx = tables.grades.findIndex((g) => g.batch_id === sub.batch_id && g.student_id === sub.student_id && g.assessment === sub.assignment_title);
    if (gradeIdx >= 0) {
      tables.grades[gradeIdx].score = numScore;
      tables.grades[gradeIdx].notes = reviewer_notes || tables.grades[gradeIdx].notes;
    } else {
      tables.grades.unshift({
        id: `grd-sub-${Date.now()}`,
        batch_id: sub.batch_id,
        student_id: sub.student_id,
        assessment: sub.assignment_title,
        score: numScore,
        max_score: 100,
        notes: reviewer_notes || 'Evaluated via Code Review Hub',
        graded_at: new Date().toISOString(),
        graded_by: req.user.id,
      });
    }
  }

  res.json({ data: tables.submissions[idx], message: 'Code review and grade published.' });
});

/**
 * ----------------------------------------------------
 * RARE FEATURE 3: Live Online Classroom Hub & Stream Telemetry
 * ----------------------------------------------------
 */
academic.get('/live-sessions', (req, res) => {
  const sessions = tables.lectures.map((lec) => {
    const course = tables.courses.find((c) => c.id === lec.course_id);
    const batch = tables.batches.find((b) => b.id === lec.batch_id);
    return {
      ...lec,
      course_title: course?.title || 'Technical Architecture Program',
      course_code: course?.code || 'TECH-TRACK',
      batch_name: batch?.name || 'Live Cohort',
      stream_url: lec.materials_url || 'https://meet.google.com/nex-stream-room',
      recording_url: `https://recordings.nexsphere.edu/streams/${lec.id}`,
      active_participants: lec.status === 'in_progress' ? 34 : 0,
      stream_health: 'optimal_1080p60',
    };
  });
  res.json({ data: sessions });
});

academic.post('/ping-attendance', (req, res) => {
  const { lecture_id, batch_id, watch_minutes } = req.body;
  if (!lecture_id || !batch_id) {
    return res.status(422).json({ error: 'lecture_id and batch_id are required' });
  }

  const studentId = req.user.id;
  const today = new Date().toISOString().slice(0, 10);

  // Check if attendance already recorded today
  const existing = tables.attendance.find(
    (a) => a.batch_id === batch_id && a.student_id === studentId && a.lecture_id === lecture_id
  );

  if (existing) {
    existing.status = 'present';
    existing.watch_minutes = (existing.watch_minutes || 0) + (Number(watch_minutes) || 15);
    return res.json({ ok: true, message: 'Stream watch time updated', status: 'present' });
  }

  const newAtt = {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    batch_id,
    student_id: studentId,
    lecture_id,
    on_date: today,
    status: 'present',
    watch_minutes: Number(watch_minutes) || 30,
    marked_by: 'system_stream_telemetry',
  };

  tables.attendance.push(newAtt);
  res.status(201).json({ ok: true, message: 'Online live session attendance confirmed', status: 'present' });
});

academic.patch('/session-status/:id', (req, res) => {
  if (req.user.role === 'student') {
    return res.status(403).json({ error: 'Only instructors and administrators can modify live stream status.' });
  }

  const { id } = req.params;
  const { status } = req.body;
  const lec = tables.lectures.find((l) => l.id === id);
  if (!lec) return res.status(404).json({ error: 'Session not found' });

  lec.status = status; // 'in_progress', 'completed', 'upcoming'
  res.json({ data: lec, message: `Session status updated to ${status}` });
});

