import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tables } from '../mockEngine.js';

export const lectures = Router();
lectures.use(authenticate);

// Get lectures for a specific course or batch
lectures.get('/', (req, res) => {
  const { courseId, batchId } = req.query;
  let list = [...tables.lectures];

  if (courseId) {
    list = list.filter((l) => l.course_id === courseId);
  }
  if (batchId) {
    list = list.filter((l) => l.batch_id === batchId);
  }

  list.sort((a, b) => a.lecture_number - b.lecture_number);
  res.json({ data: list, count: list.length });
});

// Add a lecture to a course
lectures.post('/', (req, res) => {
  const {
    course_id,
    batch_id,
    lecture_number,
    topic,
    date,
    time,
    room,
    instructor_name,
    materials_url,
    lab_exercise,
  } = req.body;

  if (!course_id || !topic) {
    return res.status(422).json({ error: 'course_id and topic are required.' });
  }

  const existing = tables.lectures.filter((l) => l.course_id === course_id);
  const nextNum = lecture_number || existing.length + 1;

  const newLec = {
    id: `lec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    course_id,
    batch_id: batch_id || (tables.batches.find((b) => b.course_id === course_id)?.id || null),
    lecture_number: Number(nextNum),
    topic,
    date: date || new Date().toISOString().slice(0, 10),
    time: time || '10:00 AM - 11:30 AM',
    room: room || 'Tech Lab 402',
    instructor_name: instructor_name || 'Assigned Instructor',
    status: 'upcoming',
    materials_url: materials_url || '',
    lab_exercise: lab_exercise || '',
    created_at: new Date().toISOString(),
  };

  tables.lectures.push(newLec);

  // Update total_lectures count on course
  const course = tables.courses.find((c) => c.id === course_id);
  if (course) {
    course.total_lectures = (course.total_lectures || 0) + 1;
  }

  res.status(201).json({ data: newLec });
});

// Update lecture status or details
lectures.patch('/:id', (req, res) => {
  const { id } = req.params;
  const idx = tables.lectures.findIndex((l) => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Lecture not found' });

  tables.lectures[idx] = { ...tables.lectures[idx], ...req.body };
  res.json({ data: tables.lectures[idx] });
});

// Delete a lecture
lectures.delete('/:id', (req, res) => {
  const { id } = req.params;
  tables.lectures = tables.lectures.filter((l) => l.id !== id);
  res.status(204).end();
});
