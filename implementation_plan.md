# KAHE Coding Assessment Platform — Implementation Plan

**Project:** KAHE Coding Assessment Platform  
**Version:** 1.0  
**Prepared:** 2026-08-03  
**Status:** Ready for Implementation

---

## 1. Confirmed Decisions

All design decisions are finalized before coding begins.

| Concern | Decision |
|---------|----------|
| Language | **TypeScript** — frontend and backend both |
| Frontend | **React + Vite + Tailwind CSS + React Router + React Query + React Hook Form + Zod** |
| Code Editor | **Monaco Editor** |
| Backend | **Node.js + Express** |
| ORM | **Prisma** |
| Database | **PostgreSQL** |
| Authentication | **JWT (Access Token) + Refresh Token** |
| Real-time | **Socket.IO** — live events only (monitoring, timer, warnings, pause/resume) |
| Auto-save | **REST API** — not WebSocket |
| Submission Queue | **Bull + Redis** |
| Code Execution | **Direct OS execution** — `sandboxuser` + `timeout` + `ulimit` |
| Code Isolation | **No Docker**, no Judge0 |
| Forgot Password | **Admin-triggered reset only** — no SMTP, no OTP |
| Deployment | **Single Ubuntu server** — Nginx + PM2 |
| Domain | **coding.kahedu.edu.in** |

---

## 2. Final Architecture

```
Internet
    │
coding.kahedu.edu.in
    │
College Firewall
    │
Ubuntu Server
─────────────────────────────────────────────────────
Nginx  (port 80 → 443, HTTPS termination, reverse proxy)
    │
    ├── /          → React Frontend (static files served by Nginx)
    └── /api       → Express Backend (port 3001, managed by PM2)
                          │
                          ├── PostgreSQL  (local, port 5432)
                          ├── Redis       (local, port 6379)
                          └── Execution Engine (sandboxuser)
─────────────────────────────────────────────────────
```

### Real-time Layer (Socket.IO)

```
React Frontend  ←──── Socket.IO ────→  Express Backend
                                            │
                                     Live Events Only:
                                     - Timer countdown sync
                                     - Warning notifications
                                     - Exam pause / resume
                                     - Faculty monitoring updates
                                     - Force submit
                                     - Server announcements
```

### Code Execution Flow

```
Student clicks Run / Submit
         │
    Express API
         │
   Submission Service
         │
    Bull Queue (Redis)        ← controls concurrency
         │
   Execution Engine
         │
   ┌─────────────────────────────────────┐
   │  1. Write code to /tmp/sandbox/{id} │
   │  2. Compile (gcc / javac / python)  │
   │  3. timeout {limit}s                │
   │     ulimit -v {memory}              │
   │     runuser -u sandboxuser          │
   │     → ./a.out < input.txt           │
   │  4. Compare output vs expected      │
   │  5. Delete temp folder              │
   └─────────────────────────────────────┘
         │
   Result object
         │
   Store in PostgreSQL
         │
   Return to student
```

---

## 3. Folder Structure

### Backend

```
backend/
└── src/
    ├── config/           # DB, Redis, env config
    ├── middleware/        # auth, role, rate-limit, error handler
    ├── modules/
    │   ├── auth/          # login, logout, first-login, password reset
    │   ├── users/         # shared user utilities
    │   ├── students/      # student CRUD, profile
    │   ├── faculty/       # faculty CRUD, profile
    │   ├── admin/         # admin dashboard, settings
    │   ├── departments/   # departments, years, sections, semesters
    │   ├── groups/        # student groups
    │   ├── questions/     # question bank, test cases, tags
    │   ├── tests/         # test CRUD, publish, assign, clone
    │   ├── sessions/      # student exam sessions, autosave, run, submit
    │   ├── execution/     # Judge Service — compile + run + score
    │   ├── results/       # result storage and retrieval
    │   ├── warnings/      # warning recording and reset
    │   ├── monitoring/    # live faculty monitoring
    │   ├── reports/       # analytics and exports
    │   ├── notifications/ # in-app notification service
    │   ├── audit/         # audit log service
    │   └── settings/      # system settings
    ├── sockets/           # Socket.IO event handlers
    ├── jobs/              # Bull queue workers (execution, auto-submit)
    ├── storage/           # file storage service (uploads, exports)
    ├── utils/             # helpers, validators, formatters
    └── app.ts             # Express app entry point
```

> Each module contains: `controller.ts`, `service.ts`, `repository.ts`, `validator.ts`, `routes.ts`

### Frontend

```
frontend/
└── src/
    ├── assets/            # images, icons
    ├── components/        # reusable UI components
    │   ├── ui/            # Button, Input, Table, Modal, Badge, Toast...
    │   ├── layout/        # Header, Sidebar, PageWrapper
    │   └── shared/        # DataTable, FilterPanel, ConfirmDialog...
    ├── pages/
    │   ├── auth/          # Login, SetPassword
    │   ├── admin/         # Dashboard, Students, Faculty, Departments,
    │   │                  # Groups, Questions, Tests, Results, Reports,
    │   │                  # AuditLogs, Settings
    │   ├── faculty/       # Dashboard, QuestionBank, CreateTest, Tests,
    │   │                  # LiveMonitoring, Results
    │   └── student/       # Dashboard, MyTests, Exam, Results, Profile
    ├── hooks/             # custom React hooks
    ├── services/          # API call functions (axios)
    ├── store/             # auth state (Zustand or Context)
    ├── types/             # TypeScript type definitions
    ├── utils/             # helpers, formatters
    └── socket/            # Socket.IO client setup
```

---

## 4. Database Schema (Key Tables)

### Module 1 — Authentication
```
users
  id (UUID PK)
  email (unique)
  password_hash (nullable — NULL triggers Set Password flow)
  role  (ADMIN | FACULTY | STUDENT)
  first_login (boolean)
  account_status (ACTIVE | DISABLED | LOCKED | PENDING)
  failed_login_attempts
  last_login
  password_changed_at
  created_at, updated_at, deleted_at
```

### Module 2 — Academic Structure
```
departments    (id, name, code, hod_name)
study_years    (id, year_number: 1-4)
sections       (id, name: A/B/C)
semesters      (id, number: 1-8)
academic_years (id, label: "2026-2027")
```

### Module 3 & 4 — Users
```
students
  id, user_id (FK), roll_number (unique), full_name,
  department_id, study_year_id, section_id, semester_id,
  phone, photo_url, created_at, updated_at, deleted_at

faculty
  id, user_id (FK), faculty_code (unique), name,
  department_id, designation, phone, photo
```

### Module 5 — Student Groups
```
student_groups
  id, group_name, description, type (AUTO | CUSTOM),
  department_id, study_year_id, section_id, created_by

student_group_members
  group_id, student_id  (many-to-many)
```

### Module 6 — Question Bank
```
questions
  id, title, slug, description, difficulty (EASY|MEDIUM|HARD),
  question_type (PROGRAMMING|MCQ|SQL|DEBUGGING|OUTPUT|FILL_BLANK),
  topic, marks, time_limit, memory_limit,
  created_by, version, status (DRAFT|ACTIVE|ARCHIVED),
  created_at, updated_at, deleted_at

question_versions        ← snapshot on every edit
  id, question_id, version_number, content_snapshot, created_at

programming_details
  question_id, input_format, output_format, constraints,
  sample_input, sample_output, explanation

mcq_options              ← for MCQ type
  id, question_id, option_text, is_correct

test_cases
  id, question_id, input, expected_output,
  visibility (SAMPLE|VISIBLE|HIDDEN|EDGE),
  weightage, execution_order, timeout_override

question_languages       ← which languages are allowed per question
  question_id, language (C|CPP|JAVA|PYTHON)

question_tags
  id, tag_name

question_tag_mapping
  question_id, tag_id
```

### Module 7 — Tests
```
tests
  id, title, description, duration, password_hash,
  passing_percentage, maximum_marks,
  shuffle_questions, shuffle_mcq, allow_run,
  show_result, status (DRAFT|PUBLISHED|RUNNING|COMPLETED|ARCHIVED),
  created_by, created_at, updated_at, deleted_at

test_questions           ← bridge table
  test_id, question_id, display_order, marks

test_assignments         ← who can attend
  id, test_id, assignment_type (GROUP|SECTION|YEAR|INDIVIDUAL),
  group_id, student_id, department_id, section_id, study_year_id
```

### Module 8 — Student Test Session
```
student_tests            ← one row per student per test
  id, student_id, test_id, started_at, submitted_at,
  remaining_time, status (NOT_STARTED|RUNNING|SUBMITTED|AUTO_SUBMITTED|EXPIRED),
  warning_count, ip_address, browser, device,
  fullscreen_exit_count, is_password_verified
```

### Module 9 — Submissions
```
submissions              ← every Run and Submit click
  id, student_test_id, question_id, language,
  source_code, compiler_status, execution_time, memory_used,
  score, submission_type (RUN|FINAL), submitted_at

submission_testcase_results   ← per test case
  submission_id, test_case_id,
  status (PASSED|FAILED|TLE|RUNTIME_ERROR|COMPILATION_ERROR),
  execution_time, memory, actual_output
```

### Module 10 — Warnings
```
warnings
  id, student_test_id,
  warning_type (TAB_SWITCH|FULLSCREEN_EXIT|WINDOW_BLUR|NETWORK_LOSS),
  timestamp, details
```

### Module 11 — Results
```
results
  student_test_id (PK), total_marks, percentage, rank,
  result_status (PASS|FAIL)
```

### Module 12 — Audit Logs
```
audit_logs
  id, user_id, action, entity, entity_id,
  timestamp, ip_address, browser, details
```

### Module 13 — Notifications
```
notifications
  id, title, message, recipient_type (STUDENT|FACULTY|ADMIN|GROUP),
  recipient_id, is_read, created_at
```

### Module 14 — System Settings
```
system_settings
  setting_key (PK), setting_value, description
  e.g. MAX_WARNINGS=4, DEFAULT_DURATION=60, MAX_FILE_SIZE=5MB
```

---

## 5. Code Execution Engine (No Docker)

### One-Time Server Setup

```bash
# 1. Install compilers and runtimes
sudo apt install gcc g++ default-jdk python3

# 2. Create restricted sandbox user
sudo useradd -m -s /bin/bash sandboxuser
sudo passwd -l sandboxuser        # disable password login
# sandboxuser has no sudo, no network, no access outside /tmp/sandbox/

# 3. Create and permission the sandbox temp directory
sudo mkdir -p /tmp/sandbox
sudo chown sandboxuser:sandboxuser /tmp/sandbox
sudo chmod 700 /tmp/sandbox

# 4. Install Redis for Bull queue
sudo apt install redis-server
```

### Execution Flow Per Submission

```
Student code arrives at Execution Service
         │
1. Generate unique job ID
2. Create temp directory:  /tmp/sandbox/{jobId}/
3. Write source file:      Main.java / main.c / main.py
4. Compile:
     C:      gcc -o /tmp/sandbox/{id}/out main.c
     C++:    g++ -o /tmp/sandbox/{id}/out main.cpp
     Java:   javac Main.java
     Python: (no compile step)
5. For each test case:
     timeout {question.time_limit}s  \
     runuser -u sandboxuser          \
     -- bash -c "ulimit -v 262144;   \
                 ulimit -f 10240;    \
                 ./out < input.txt > actual_output.txt 2>&1"
6. Compare actual_output.txt with expected_output
7. Record: PASSED / FAILED / TLE / RUNTIME_ERROR / COMPILATION_ERROR
8. Calculate score (sum of passed test case weightages)
9. Delete /tmp/sandbox/{jobId}/ entirely
10. Return result object
```

### Time Limit by Language

Faculty sets the time limit per question. Recommended guidelines:

| Program Complexity | C/C++ Limit | Java Limit | Python Limit |
|----|----|----|---|
| Simple I/O | 1s | 2s | 2s |
| Arrays, strings | 2s | 3s | 3s |
| Sorting, searching | 2s | 3s | 4s |
| Graph, DP | 3–5s | 5–7s | 6–8s |

> Java adds ~1s JVM startup. Python is slower by nature. Faculty adjusts accordingly.

### Queue Concurrency

```
Bull Queue Config:
  concurrency: 10       ← max 10 simultaneous executions
  attempts: 1           ← no retry on failure (student gets error msg)
  timeout: 30000        ← job-level 30s hard kill (safety net)
```

If all 10 slots are busy, new jobs wait in queue. Student sees:
> "Running your code... (position 3 in queue)"

---

## 6. Authentication & Password Flow

### Login
```
POST /api/v1/auth/login
  { email, password }
  ↓
Validate email format (must be @kahedu.edu.in)
  ↓
Find user in DB
  ↓
Check account_status (ACTIVE only)
  ↓
Check password_hash IS NOT NULL
  ↓
bcrypt.compare(password, hash)
  ↓
If first_login = true OR password_hash IS NULL:
  return { requiresPasswordSetup: true, setupToken: "..." }
  ↓
Generate Access Token (15 min) + Refresh Token (7 days)
  ↓
Update last_login, record audit log
  ↓
Return { accessToken, refreshToken, role }
```

### First Login / Forgot Password Reset
```
POST /api/v1/auth/setup-password
  { setupToken, newPassword, confirmPassword }
  ↓
Validate password policy
  ↓
bcrypt.hash(newPassword)
  ↓
Update: password_hash = hash, first_login = false
  ↓
Record audit log
  ↓
Redirect to login
```

### Admin Resets a Student Password
```
Admin clicks "Reset Password" on student profile
  ↓
POST /api/v1/admin/students/{id}/reset-password
  ↓
Set: password_hash = NULL, first_login = TRUE
  ↓
Audit log: "Admin reset password for student {rollNumber}"
  ↓
Student's next login → system detects NULL hash → shows Set Password screen
```

---

## 7. API Conventions

### Versioning
All routes are prefixed: `/api/v1/...`

### Response Format
```typescript
// Success
{ success: true, message: "...", data: {} }

// Error
{ success: false, message: "...", errorCode: "INVALID_TEST_PASSWORD" }
```

### Middleware Chain (every protected route)
```
Request
  → verifyJWT
  → checkUserExists
  → checkAccountActive
  → checkRole(["ADMIN", "FACULTY"])
  → validate(requestSchema)      ← Zod schema
  → controller
```

### Key API Routes

```
Auth
  POST   /api/v1/auth/login
  POST   /api/v1/auth/logout
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/setup-password

Student (role: STUDENT)
  GET    /api/v1/student/dashboard
  GET    /api/v1/student/profile
  PUT    /api/v1/student/profile
  PUT    /api/v1/student/change-password
  GET    /api/v1/student/tests
  POST   /api/v1/student/tests/:id/unlock        ← enter exam password
  POST   /api/v1/student/tests/:id/start
  GET    /api/v1/student/tests/:id/questions
  POST   /api/v1/student/session/save            ← autosave (REST)
  POST   /api/v1/student/session/run             ← run code
  POST   /api/v1/student/session/submit          ← final submit
  POST   /api/v1/session/warning                 ← record warning
  GET    /api/v1/student/results/:testId

Faculty (role: FACULTY)
  GET    /api/v1/faculty/dashboard
  GET    /api/v1/questions
  POST   /api/v1/questions
  PUT    /api/v1/questions/:id
  DELETE /api/v1/questions/:id
  POST   /api/v1/tests
  PUT    /api/v1/tests/:id
  POST   /api/v1/tests/:id/publish
  POST   /api/v1/tests/:id/pause
  POST   /api/v1/tests/:id/resume
  POST   /api/v1/tests/:id/extend
  POST   /api/v1/tests/:id/clone
  GET    /api/v1/tests/:id/monitoring            ← live student states
  POST   /api/v1/session/:sessionId/reset-warning
  POST   /api/v1/session/:sessionId/force-submit
  GET    /api/v1/tests/:id/results
  GET    /api/v1/tests/:id/results/export        ← Excel/PDF

Admin (role: ADMIN)
  GET    /api/v1/admin/dashboard
  GET/POST/PUT  /api/v1/admin/students
  POST   /api/v1/admin/students/import           ← CSV bulk import
  POST   /api/v1/admin/students/:id/reset-password
  GET/POST/PUT  /api/v1/admin/faculty
  GET/POST/PUT  /api/v1/admin/departments
  GET/POST/PUT  /api/v1/admin/groups
  GET    /api/v1/admin/audit-logs
  GET    /api/v1/admin/reports
  GET/PUT /api/v1/admin/settings
```

---

## 8. Socket.IO Events

```
Client → Server (student emits):
  "exam:warning"          { type, sessionId }

Server → Client (server emits to student):
  "exam:paused"           { message }
  "exam:resumed"          {}
  "exam:time-extended"    { additionalMinutes }
  "exam:force-submit"     {}
  "exam:warning-issued"   { count, max }
  "exam:auto-submitted"   { reason }

Server → Faculty room:
  "monitoring:update"     { studentId, status, warningCount, ... }
  "monitoring:submission" { studentId, questionId, status }
  "monitoring:disconnect" { studentId }
```

---

## 9. Security Implementation

| Security Concern | Implementation |
|---|---|
| Official email only | Validate `@kahedu.edu.in` suffix on login and user creation |
| Password hashing | `bcrypt` with salt rounds = 12 |
| Test password | Hashed with bcrypt, never stored plain text |
| JWT secret | Environment variable, never in source code |
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 7 days, stored in DB, invalidated on logout |
| Account lock | After 5 failed logins → status = LOCKED |
| Hidden test cases | Never sent to frontend, only evaluated server-side |
| Server-side timer | `remaining_time` stored in DB; browser shows display only |
| Concurrent login block | If session already active on Device A → Device B gets rejected |
| Student code isolation | Runs as `sandboxuser` OS user |
| Infinite loop protection | `timeout {limit}s` kills process |
| Memory protection | `ulimit -v 262144` (256 MB cap) |
| File write protection | `sandboxuser` has no access outside `/tmp/sandbox/` |
| Rate limiting | Express rate-limit on login, OTP, run-code endpoints |
| Input validation | Zod schemas on every API request |
| SQL injection | Prisma parameterized queries — no raw string concatenation |
| Audit logging | Every critical action → `audit_logs` table |
| HTTPS | Nginx handles SSL termination |

---

## 10. Development Phases

---

### PHASE 1 — Foundation (3–5 days)

**Goal:** Both frontend and backend start successfully. Database connects.

#### Backend Tasks
- [ ] Initialize Express + TypeScript project
- [ ] Configure folder structure (modules pattern)
- [ ] Set up environment variables (`.env`)
- [ ] Configure Prisma + PostgreSQL connection
- [ ] Write and run initial migration (all 14 schema modules)
- [ ] Set up global error handler middleware
- [ ] Set up request logging (Morgan or Winston)
- [ ] Set up API versioning (`/api/v1/`)
- [ ] Set up Redis connection + Bull queue
- [ ] Seed admin user

#### Frontend Tasks
- [ ] Initialize React + Vite + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Configure React Router
- [ ] Configure React Query (API call caching)
- [ ] Configure Axios instance (base URL, auth interceptor)
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Build reusable UI component library:
  - Button, Input, Select, Textarea
  - Table, Pagination
  - Modal, ConfirmDialog
  - Toast notifications
  - Badge, StatusDot
  - Card, StatCard
  - Sidebar, Header layout
  - LoadingSpinner, EmptyState, ErrorState

#### Deliverable
> `npm run dev` starts frontend and backend. Prisma migrations run cleanly.

---

### PHASE 2 — Authentication (5 days)

**Goal:** All three roles can log in. Role-based routing works.

#### Backend Tasks
- [ ] `POST /api/v1/auth/login` — validate email, check status, compare hash, issue JWT
- [ ] `POST /api/v1/auth/logout` — invalidate refresh token
- [ ] `POST /api/v1/auth/refresh` — issue new access token
- [ ] `POST /api/v1/auth/setup-password` — first login and admin reset flow
- [ ] `PUT /api/v1/student/change-password` — old password required
- [ ] JWT middleware (verify + attach user to request)
- [ ] Role guard middleware
- [ ] Rate limiting on login endpoint
- [ ] Audit log on login, logout, password change

#### Frontend Tasks
- [ ] Login page (email + password, validation, error messages)
- [ ] Set Password page (first login + post-admin-reset, password strength indicator)
- [ ] Auth context / Zustand store (store token, role, user info)
- [ ] Protected route wrapper (redirects by role)
- [ ] Token refresh logic (Axios interceptor auto-refreshes on 401)
- [ ] Logout handler (clears tokens, redirects to login)

#### Deliverable
> Admin, Faculty, Student each log in and land on their respective dashboards.

---

### PHASE 3 — Academic Structure (3 days)

**Goal:** Admin can manage departments, years, sections, and semesters.

#### Backend Tasks
- [ ] CRUD APIs for departments, study_years, sections, semesters, academic_years
- [ ] Seed common data (years 1–4, sections A/B/C, semesters 1–8)

#### Frontend Tasks
- [ ] Admin → Departments page (list, create, edit)
- [ ] Admin → Academic structure settings

#### Deliverable
> Academic structure is seeded and manageable.

---

### PHASE 4 — User Management (5 days)

**Goal:** Admin can import, manage, enable/disable students and faculty.

#### Backend Tasks
- [ ] `GET/PUT` student profile APIs
- [ ] `POST /admin/students/import` — CSV bulk import (validate email, roll number format)
- [ ] `POST /admin/students/:id/reset-password` — sets hash=NULL, first_login=TRUE
- [ ] Enable / disable account
- [ ] Faculty CRUD APIs
- [ ] Student login history, activity logs

#### Frontend Tasks
- [ ] Admin → Students page (searchable, filterable table)
- [ ] Student detail modal (info, test history, warnings, login history)
- [ ] Admin → Faculty page
- [ ] CSV import UI (upload, preview, confirm)
- [ ] Student profile page (read-only academic info, editable phone/photo)

#### Deliverable
> Admin imports student list. Students have accounts. Admin can reset passwords.

---

### PHASE 5 — Student Groups (3 days)

**Goal:** Admin and faculty can create groups and assign students.

#### Backend Tasks
- [ ] Auto-generate groups by department + year + section
- [ ] Custom group CRUD
- [ ] Add/remove members from custom groups
- [ ] Export group member list

#### Frontend Tasks
- [ ] Admin → Student Groups page
- [ ] Create/edit group UI
- [ ] Member management UI

#### Deliverable
> Faculty can select groups instead of individual students when assigning tests.

---

### PHASE 6 — Question Bank (8 days)

**Goal:** Faculty can create, search, and manage programming questions with test cases.

#### Backend Tasks
- [ ] Question CRUD with version snapshotting on edit
- [ ] Programming details (input/output format, constraints, sample)
- [ ] Test case management (visible, hidden, sample, edge)
- [ ] MCQ options management
- [ ] Question tags system
- [ ] Language assignment per question
- [ ] Question search and filter API (difficulty, type, topic, tag, language)
- [ ] Question archive / soft delete
- [ ] Question clone

#### Frontend Tasks
- [ ] Question Bank page (searchable, filterable table with tag chips)
- [ ] Create Question wizard (multi-step: details → test cases → languages → tags)
- [ ] Test case editor (add input/expected output, set visibility, weightage)
- [ ] MCQ option editor
- [ ] Question preview (exactly as students will see it)
- [ ] Question version history viewer

#### Deliverable
> Faculty creates reusable programming questions with hidden test cases.

---

### PHASE 7 — Test Management (8 days)

**Goal:** Faculty creates, publishes, and manages tests.

#### Backend Tasks
- [ ] Test CRUD (title, description, duration, password_hash, rules)
- [ ] Add/remove/reorder questions
- [ ] Student assignment (by group, section, year, individual)
- [ ] Test status state machine: DRAFT → PUBLISHED → RUNNING → COMPLETED → ARCHIVED
- [ ] Publish validation (requires questions, assignments, password, duration)
- [ ] Test clone (copies questions + settings, not results/students/passwords)
- [ ] Pause / Resume test API
- [ ] Extend time API
- [ ] Test preview API (faculty sees exam exactly as students will)

#### Frontend Tasks
- [ ] Faculty → Tests list page
- [ ] Create Test wizard (5 steps: Info → Questions → Students → Rules → Review)
- [ ] Question search and add within wizard
- [ ] Student group assignment step
- [ ] Preview mode (read-only exam view)
- [ ] Test detail page with status controls (publish, pause, resume)
- [ ] Test clone button

#### Deliverable
> Faculty creates a test, assigns students, publishes it with a password.

---

### PHASE 8 — Student Exam Module (10 days)

**Goal:** Students can take exams end-to-end.

#### Backend Tasks
- [ ] `GET /student/tests` — list assigned tests (upcoming, active, completed, missed)
- [ ] `POST /student/tests/:id/unlock` — verify exam password (hash compare)
- [ ] `POST /student/tests/:id/start` — create `student_tests` session row, record IP/browser
- [ ] `GET /student/tests/:id/questions` — fetch questions (no hidden test cases)
- [ ] `POST /session/save` — autosave code + language + question number (REST, debounced)
- [ ] `POST /session/run` — queue run job (visible test cases only), return result
- [ ] `POST /session/submit` — queue final submit job (all test cases), lock session
- [ ] `POST /session/warning` — record warning, increment count, auto-submit at 4
- [ ] Server-side timer validation on all session endpoints
- [ ] Auto-submit background job for expired sessions (Bull cron)
- [ ] Session resume on reconnect (return saved code + remaining time)
- [ ] Concurrent login block (reject second login during active exam)

#### Frontend Tasks
- [ ] Student Dashboard (upcoming tests, active test banner, recent results)
- [ ] My Tests page (filterable cards: locked, available, running, completed)
- [ ] Exam Password dialog
- [ ] Instructions screen (test details, rules, academic integrity checkbox)
- [ ] **Exam Screen (most complex page):**
  - Split-pane layout: Question panel (left) | Monaco Editor (right)
  - Console/Output panel (bottom)
  - Countdown timer (yellow at 10 min, red at 2 min)
  - Question navigator (Q1, Q2… with color status: gray/blue/green/orange)
  - Language selector dropdown
  - Run button → shows test case results
  - Submit button → confirmation dialog → final submit
  - Fullscreen enforcement on start
  - Warning popup on fullscreen exit (Warning 1 of 4)
  - Auto-submit popup on 4th warning
  - Network lost overlay ("Reconnecting…")
  - Connection status indicator
  - Auto-save indicator ("Saved" / "Saving…")
- [ ] Result screen (marks, percentage, rank, question-wise breakdown)
- [ ] Mobile block ("Use a desktop/laptop for exams")

#### Deliverable
> Student logs in, enters exam password, writes code, submits, sees results.

---

### PHASE 9 — Code Execution Engine (6 days)

**Goal:** Code runs safely with time/memory limits. All 4 languages work.

#### Server Setup (one-time)
- [ ] `sudo apt install gcc g++ default-jdk python3`
- [ ] Create `sandboxuser` OS user (no sudo, no password login)
- [ ] Set up `/tmp/sandbox/` with correct permissions
- [ ] Test each language manually from terminal before integration

#### Backend Tasks
- [ ] Execution Service: compile → run → compare → score
- [ ] Language-specific compile commands (C, C++, Java, Python)
- [ ] Time limit from question (`timeout {question.time_limit}s`)
- [ ] Memory limit (`ulimit -v 262144`)
- [ ] Per test-case execution loop
- [ ] Output comparison (trim whitespace, handle newlines)
- [ ] Result classification: ACCEPTED / WRONG_ANSWER / TLE / RUNTIME_ERROR / COMPILATION_ERROR
- [ ] Temp folder creation and guaranteed cleanup (even on error)
- [ ] Run vs Submit distinction (visible test cases vs all test cases)
- [ ] Partial scoring (sum of passed test case weightages)
- [ ] Bull queue setup with concurrency limit (10)
- [ ] Language starter templates (Java Main class, C main, Python main)

#### Frontend Tasks
- [ ] Run button → show per-test-case result table
- [ ] Execution status badges (Accepted ✅, Wrong Answer ❌, TLE ⏱, Error 🔴)
- [ ] Execution time and memory display
- [ ] Queue position indicator ("Position 3 in queue…")
- [ ] Compilation error display with message

#### Deliverable
> C, C++, Java, Python all compile, run, and return correct results with enforced limits.

---

### PHASE 10 — Live Monitoring (5 days)

**Goal:** Faculty can watch the exam live and intervene.

#### Backend Tasks
- [ ] Socket.IO server setup and room management (one room per test)
- [ ] Broadcast student status updates to faculty room
- [ ] `GET /tests/:id/monitoring` — initial snapshot of all student states
- [ ] `POST /session/:id/reset-warning` — faculty resets a student's warning count
- [ ] `POST /session/:id/force-submit` — faculty forces student submission
- [ ] `POST /tests/:id/pause` — broadcasts pause to all students in test room
- [ ] `POST /tests/:id/resume` — broadcasts resume
- [ ] `POST /tests/:id/extend` — updates remaining time for selected students

#### Frontend Tasks
- [ ] Faculty → Live Monitoring page
- [ ] Student grid (cards with: name, roll, time left, question, warnings, status)
- [ ] Status color codes: Green (coding), Yellow (idle), Red (disconnected), Gray (submitted)
- [ ] Click student → detail panel (current code view, IP, browser, last activity)
- [ ] Faculty action buttons: Reset Warning, Force Submit, Extend Time, Pause, Resume

#### Deliverable
> Faculty sees all students live during an exam and can intervene.

---

### PHASE 11 — Results, Reports & Analytics (5 days)

**Goal:** Results are stored and exportable. Analytics are available.

#### Backend Tasks
- [ ] Auto-generate `results` row after final submission
- [ ] Rank calculation per test
- [ ] `GET /tests/:id/results` — class statistics, rank list, question analysis
- [ ] `GET /results/:testId` — student's own result (own only)
- [ ] Excel export (ExcelJS)
- [ ] PDF export (PDFKit or Puppeteer)
- [ ] Reports API: daily, weekly, monthly, department, faculty summaries
- [ ] Admin dashboard stats query
- [ ] Audit log query with filters

#### Frontend Tasks
- [ ] Student result page (marks, percentage, rank, per-question breakdown)
- [ ] Faculty results page (class average, highest, lowest, question analysis chart)
- [ ] Export buttons (Excel, PDF)
- [ ] Admin dashboard charts (Chart.js or Recharts):
  - Daily test count
  - Department-wise student count
  - Language usage pie chart
  - Average marks trend
  - Warning statistics

#### Deliverable
> Faculty can export a full result sheet. Admin sees platform-wide analytics.

---

### PHASE 12 — Deployment (3 days)

**Goal:** Platform is live on `coding.kahedu.edu.in` over HTTPS.

#### Server Setup
- [ ] Install Ubuntu Server LTS on college server
- [ ] Install: Node.js, PostgreSQL, Redis, Nginx, PM2, Git
- [ ] Install compilers: `gcc g++ default-jdk python3`
- [ ] Create `sandboxuser` with correct permissions
- [ ] Configure Nginx (reverse proxy + static file serving + HTTPS redirect)
- [ ] Obtain SSL certificate (Let's Encrypt / college IT internal CA)
- [ ] Configure PM2 for Express backend (auto-restart, startup on boot)
- [ ] Set up environment variables on server (never in source code)
- [ ] Run Prisma migrations on production database
- [ ] Seed admin account

#### CI/CD (Simple)
- [ ] `git pull` on server
- [ ] `npm run build` (React)
- [ ] Copy static files to Nginx web root
- [ ] `pm2 restart backend`

#### Pre-Launch Checklist
- [ ] HTTPS working end-to-end
- [ ] All 4 languages compile and run correctly
- [ ] Login flow tested for all 3 roles
- [ ] Exam password flow tested
- [ ] Autosave tested (kill browser mid-exam, reopen, code is restored)
- [ ] Auto-submit tested (let timer expire)
- [ ] Warning system tested (exit fullscreen 4 times)
- [ ] Result generation tested
- [ ] Excel/PDF export tested
- [ ] Load test (simulate 50–100 concurrent students)
- [ ] Database backup configured (daily cron)

#### Deliverable
> Platform is live, HTTPS secured, and passes pre-launch checklist.

---

## 11. Pre-Implementation Checklist (Before Writing Any Code)

Complete these before starting Phase 1:

- [ ] **Compiler test** — on the Ubuntu development/test machine, run:
  ```bash
  gcc --version && g++ --version && java --version && python3 --version
  ```
- [ ] **sandboxuser test** — create the user, try running a Hello World program as it
- [ ] **Redis test** — install Redis, verify `redis-cli ping` returns PONG
- [ ] **Prisma test** — connect Prisma to a local PostgreSQL and run a migration
- [ ] **DNS plan** — confirm with IT team that `coding.kahedu.edu.in` can be pointed to the server when ready
- [ ] **MCQ schema finalized** — confirm `mcq_options` table design before Phase 6

---

## 12. Tech Stack Summary (Quick Reference)

```
Frontend:   React 18 + Vite + TypeScript + Tailwind CSS
            React Router v6 + React Query v5 + React Hook Form + Zod
            Monaco Editor + Socket.IO Client + Axios

Backend:    Node.js + Express + TypeScript
            Prisma ORM + PostgreSQL
            Socket.IO Server + Bull + Redis
            bcrypt + jsonwebtoken + zod + multer + exceljs + pdfkit

Execution:  Direct OS: gcc, g++, javac/java, python3
            sandboxuser + timeout + ulimit + temp folder cleanup
            Bull queue with concurrency limit

Deployment: Ubuntu Server LTS + Nginx + PM2
            PostgreSQL (local) + Redis (local)
            Let's Encrypt SSL
```

---

## 13. Timeline Estimate

| Phase | Name | Estimated Days |
|-------|------|---------------|
| 1 | Foundation | 3–5 days |
| 2 | Authentication | 5 days |
| 3 | Academic Structure | 3 days |
| 4 | User Management | 5 days |
| 5 | Student Groups | 3 days |
| 6 | Question Bank | 8 days |
| 7 | Test Management | 8 days |
| 8 | Student Exam Module | 10 days |
| 9 | Code Execution Engine | 6 days |
| 10 | Live Monitoring | 5 days |
| 11 | Results & Reports | 5 days |
| 12 | Deployment | 3 days |
| **Total** | | **~65 days** |

> This assumes one developer. Each phase must pass its deliverable before the next begins.

---

*Plan finalized. Ready to begin Phase 1 — Foundation.*
