import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ApplicationTracker from './components/ApplicationTracker';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import Invoices from './pages/Invoices';
import Attendance from './pages/Attendance';
import GradeManagement from './pages/GradeManagement';
import AdminCourses from './pages/AdminCourses';
import Classroom from './pages/Classroom';
import Certificates from './pages/Certificates';
import CodeSubmissions from './pages/CodeSubmissions';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import MyProfile from './pages/MyProfile';
import DeployGuide from './pages/DeployGuide';
import { Batches, Assets, Students, Instructors, Users, AuditLog } from './pages/Resources';

const ADMIN_ONLY = ['admin'];
const STAFF_ADMIN = ['staff', 'admin'];
const ACADEMIC_PERSONAS = ['instructor', 'student'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="admin-courses" element={<AdminCourses />} />
          <Route path="courses" element={<AdminCourses />} />

          {/* Attendance: All roles have their own segregated portal:
              - Admin: Institutional Audit & Compliance Telemetry
              - Faculty: Session Attendance Marking Portal
              - Student: Personal Attendance & 75% Safe Buffer Calculator */}
          <Route path="attendance" element={<Attendance />} />

          {/* Administrator & Management Only */}
          <Route element={<ProtectedRoute roles={STAFF_ADMIN} />}>
            <Route path="students" element={<Students />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="assets" element={<Assets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="applications" element={<ApplicationTracker />} />
          </Route>

          <Route element={<ProtectedRoute roles={ADMIN_ONLY} />}>
            <Route path="users" element={<Users />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="deploy" element={<DeployGuide />} />
          </Route>

          {/* Batches: Admin, Staff, and Instructors */}
          <Route element={<ProtectedRoute roles={[...STAFF_ADMIN, 'instructor']} />}>
            <Route path="batches" element={<Batches />} />
          </Route>

          {/* Invoices: Admin sets up dues; Student views personal dues (Faculty blocked) */}
          <Route element={<ProtectedRoute roles={[...STAFF_ADMIN, 'student']} />}>
            <Route path="invoices" element={<Invoices />} />
          </Route>

          {/* Classroom, Code Submissions, Grades & Certificates:
              Faculty hosts/grades; Students participate/view (Admin blocked) */}
          <Route element={<ProtectedRoute roles={ACADEMIC_PERSONAS} />}>
            <Route path="classroom" element={<Classroom />} />
            <Route path="submissions" element={<CodeSubmissions />} />
            <Route path="grades" element={<GradeManagement />} />
            <Route path="certificates" element={<Certificates />} />
          </Route>

          {/* Trainee Private Pages */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="apply" element={<Apply />} />
            <Route path="my-profile" element={<MyProfile />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}