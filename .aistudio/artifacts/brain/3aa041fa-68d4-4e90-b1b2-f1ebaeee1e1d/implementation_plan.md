# Strict Role Isolation & Production Clean Slate Plan

Strictly isolates permissions across Trainees, Faculty, and Administrators, removes all demo shortcuts and persona switchers, wipes all residual test records, and enforces dedicated workflows for course authoring, attendance auditing, and fee/due management.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Clarifications:**
> - **Initial Data State**: Completely empty data tables for certificates, attendance, grades, submissions, and invoices. The platform starts with a pristine production slate ready for the administrator to upload new courses, batches, and dues.
> - **Authentication Flow**: All demo shortcuts, quick role bypass buttons, and in-app role switcher bars are removed. Authentication is strictly credential-based (Email & Password) with server-side role validation.

---

## 1. Overview & Core Concept

- **What It Does**: Establishes strict zero-trust role isolation across the platform:
  - **Trainee / Student**: Can only access their enrolled courses, personal attendance, personal grades, lab submissions, verifiable certificates, and payment dues. Access to faculty marking, grading portals, admin course allocation, and user management is strictly forbidden and redirected.
  - **Faculty / Instructor**: Can only access their assigned training batches, mark session attendance for their cohorts, review practical code deliverables, and enter grades. Access to admin course authoring, fee/due setup, user permissions, and other instructors' courses is blocked.
  - **Administrator**: Dedicated governance portal to upload new technical courses, allocate cohorts, audit attendance across all programs, and set up tuition fees and student dues. Cannot access student-exclusive views or pretend to be trainees.
  - **Data Clean Slate**: Purges all residual mock test records across certificates, attendance logs, grades, submissions, and invoices so the organization starts 100% clean.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Unauthenticated Entry**:
   - The user arrives on `/login`.
   - No demo shortcuts, quick-switch persona tiles, or role bypasses exist.
   - Clean, professional login form accepts Email and Password with secure error handling.
   - For new trainees, the registration link allows profile creation; administrator creation remains locked.
2. **Role-Enforced Navigation**:
   - The top navigation bar no longer contains the "Switch Role" bar.
   - The sidebar navigation strictly renders only the tools permitted for the authenticated user's role.
   - Direct URL tampering (e.g. student navigating to `/admin-courses` or `/grades` instructor views) is intercepted at both route and API levels, immediately redirecting to `/` with an authorization notice.
3. **Admin Course & Due Management**:
   - Dedicated Course Creation drawer allowing Admin to define course title, code, category, syllabus, and commencing dates.
   - Dedicated Cohort & Dues Setup modal allowing Admin to assign instructors, rooms, tuition fees, and payment deadlines.
   - Global Attendance Audit view where Admin can inspect batch attendance rates without instructor marking controls.

### Visual Identity
- **Palette**: Deep slate enterprise foundation (`bg-slate-900`, `bg-slate-50`, `border-slate-200`) with emerald accents (`text-emerald-700`, `bg-emerald-600`).
- **Icons**: 100% Lucide SVG enterprise icons (`Shield`, `GraduationCap`, `UserCheck`, `BookOpen`, `Receipt`, `Calendar`, `X`). Zero casual emojis.

---

## 3. Key Product Decisions & Trade-Offs

- **Zero Demo Shortcuts**:
  - *Chosen Approach*: Completely remove `tms_demo_role` auto-login, localStorage persona selection, and role switcher buttons.
  - *Why*: Eliminates security confusion and satisfies strict user requirement that "nobody can access each other".
  - *Default Seed Accounts*: Provides 3 clean, production-ready default user credentials (Admin, Instructor, Trainee) with known passwords so you can test logging into each isolated account separately without cross-access.
- **Data Clean Slate**:
  - *Chosen Approach*: Clear `tables.certificates`, `tables.attendance`, `tables.grades`, `tables.submissions`, and `tables.invoices` to empty arrays (`[]`).
  - *Why*: Ensures you can create each course, lecture, batch, student, attendance entry, and invoice from scratch.

---

## 4. Technical Architecture & Security Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Strict Auth Gate                     │
│  /login (Email + Password) -> JWT / User Session       │
└──────────────────────────┬─────────────────────────────┘
                           │
             Role-Based Route Guard (React SPA)
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  Admin Portal  │ │ Faculty Portal │ │ Student Portal │
│ - Upload Course│ │ - Mark Attend. │ │ - My Curricula │
│ - Batch Alloc. │ │ - Code Review  │ │ - My Attend.   │
│ - Set Dues     │ │ - Submit Grades│ │ - My Grades    │
│ - Attend. Audit│ │                │ │ - Pay Dues     │
└────────┬───────┘ └────────┬───────┘ └────────┬───────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
               Express Middleware RBAC
         ┌──────────────────┼──────────────────┐
         │ requireRole(adm) │ requireRole(inst)│ requireRole(stud)
         ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────┐
│             Backend API Ledger & Clean Data            │
│  courses: [] | batches: [] | attendance: [] | dues: [] │
└────────────────────────────────────────────────────────┘
```

### Component & Route Mapping
1. **`frontend/src/pages/Auth.jsx`**:
   - Strip out `handleRoleSelectAndLogin` and the 3 persona quick-buttons.
   - Implement clean email + password authentication against backend user accounts.
2. **`frontend/src/components/Layout.jsx`**:
   - Delete the persona switcher bar (lines 149–191).
   - Enforce discrete `NAV.admin`, `NAV.instructor`, and `NAV.student` sets with no overlap on sensitive management paths.
3. **`frontend/src/components/ProtectedRoute.jsx`**:
   - Enforce strict role matching with redirect to `/` if unauthorized.
4. **`backend/src/mockStore.js` & `backend/src/mockEngine.js`**:
   - Reset `mockAttendance = []`, `mockGrades = []`, `mockCertificates = []`, `mockSubmissions = []`, `mockInvoices = []`, `mockApplications = []`.
   - Retain core users (`admin@nexsphere.edu`, `alex.rivera@nexsphere.edu`, `jordan.lee@nexsphere.edu`) with secure password verification.
5. **Backend RBAC Middleware (`backend/src/middleware/auth.js`)**:
   - Strictly read authenticated user from session token or credentials, blocking arbitrary `x-demo-role` headers.
   - Enforce `requireRole('admin')` for course creation, batch allocation, and fee/due setup.
   - Enforce `requireRole('instructor')` for marking attendance and grading.
   - Restrict trainee views so students can only read records where `student_id === req.user.id`.

---

## 5. Implementation Status: Complete & Verified

- [x] **Empty Data State**: Reset `mockAttendance`, `mockGrades`, `mockInvoices`, `mockCertificates`, `mockSubmissions`, `mockApplications`, `payments`, and `application_status_history` to pure `[]`.
- [x] **Zero Demo Shortcuts**: Purged in-app "Switch Role:" quick bar from `Layout.jsx` and quick role buttons from `Auth.jsx`. Authentication now strictly validates email and password.
- [x] **Zero-Trust Role Isolation**:
  - Admin can only upload courses, allocate batches, view institutional attendance audits, set up student dues/invoices, and manage users. Admin cannot mark attendance or assign student grades.
  - Faculty can only host virtual classrooms, mark session attendance for their cohorts, review code deliverables, and manage student grades. Faculty cannot access admin dues setup or user administration.
  - Students can only access their enrolled courses, join live streams, submit deliverables, and view personal attendance (with 75% safe buffer predictor), grades, certificates, and dues. Students cannot access faculty marking or admin tools.
- [x] **Dues Setup**: Admin has dedicated "Set Up Dues / Create Invoice" action and modal in `/invoices`.
- [x] **Attendance Audit**: Admin has dedicated Institutional Attendance Audit & Telemetry portal in `/attendance`.
- [x] **Compilation & Linting**: Passed with 0 errors across frontend and backend.
