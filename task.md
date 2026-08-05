# Task Checklist

## Phase 1 — Foundation

### Backend Tasks
- [x] Initialize Express + TypeScript project
- [x] Configure folder structure (modules pattern)
- [x] Set up environment variables (`.env`)
- [x] Configure Prisma + PostgreSQL connection
- [x] Write and run initial migration (Requires local PostgreSQL)
- [x] Set up global error handler middleware
- [x] Set up request logging (Morgan or Winston)
- [x] Set up API versioning (`/api/v1/`)
- [x] Set up Redis connection + Bull queue
- [x] Seed admin user (Requires local PostgreSQL)

### Frontend Tasks
- [x] Initialize React + Vite + TypeScript project
- [x] Install and configure Tailwind CSS
- [x] Configure React Router
- [x] Configure React Query (API call caching)
- [x] Configure Axios instance (base URL, auth interceptor)
- [x] Create design tokens (colors, typography, spacing)
- [x] Build reusable UI component library
  - [x] Button, Input, Card
  - [x] Select, Textarea, Table, Pagination, Modal, ConfirmDialog
  - [x] Toast notifications, Badge, StatusDot, StatCard
  - [x] Sidebar, Header layout
  - [x] LoadingSpinner, EmptyState, ErrorState

### Phase 2: Authentication
#### Backend
- [x] Create Auth Controller (login, logout, refresh, setup password)
- [x] Create JWT middleware and Role Guard middleware
- [x] Integrate backend APIs with frontend

#### Frontend
- [x] Create Auth Context / Store (Zustand)
- [x] Build Login Page (`/login`)
- [x] Build Setup Password Page (`/setup-password`)
- [x] Set up Protected Routes logic

### Phase 3: Academic Structure
- [x] Backend: CRUD APIs for departments, study_years, sections, semesters
- [x] Backend: CRUD APIs for subjects / courses
- [x] Frontend: Academic management UI (Admin only)
- [x] Frontend: API hooks for academic structurents and faculty

## Phase 4: User Management
- [x] Backend: CRUD APIs for students and faculty
- [x] Backend: CSV bulk import for students
- [x] Backend: Admin reset password
- [x] Frontend: Admin Students page, Faculty page, Student profile page

## Phase 5: Student Groups
- [x] Backend: APIs to create student groups
- [x] Backend: CSV group import
- [x] Frontend: Faculty Student Group UIs page

## Phase 6: Question Bank
- [x] Backend: Question CRUD, versioning, test cases
- [x] Backend: Topic/Tag taxonomy
- [x] Frontend: Rich text editor for questions
- [x] Frontend: Faculty UI to manage test cases editor

## Phase 7: Test Management
- [x] Backend: Test CRUD, assignments, status state machine
- [x] Backend: Test window (start/end times, strict enforcement)
- [x] Frontend: Test builder UI (selecting questions from bank)
- [x] Frontend: Faculty dashboard for active tests APIs (unlock, start, questions, save, run, submit, warning)

## Phase 8: Code Execution Engine
- [x] Backend Core: OS-level sandbox user (sandboxuser)
- [x] Backend Core: Process timeouts and memory limits (ulimit)
- [x] Backend Core: Support for C, C++, Java, Python

## Phase 9: Student Exam Module
- [x] Backend: Student test APIs (unlock, start, questions, save, run, submit, warning)
- [x] Frontend: Student Dashboard, My Tests
- [x] Frontend: Exam Screen (split-pane, timer, warnings)

## Phase 10: Live Monitoring & Analytics
- [/] Backend: Socket.IO setup (optional for Phase 10, skipping for now to keep it simple, rely on REST)
- [ ] Backend: Reports API (student scores, metrics)
- [ ] Frontend: Faculty report view

## Phase 11 — Results & Reports
- [ ] Backend: Auto-generate results, rank calculation, export (Excel/PDF)
- [ ] Frontend: Student result page, Faculty results page, Admin dashboard charts

## Phase 12 — Deployment
- [ ] Server configuration (Nginx, PM2, SSL)
- [ ] Pre-Launch checklist
