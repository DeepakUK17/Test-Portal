# KAHE Coding Platform (Test Portal)

The KAHE Coding Platform is an advanced code assessment and examination system built for institutions to manage students, faculty, and programming assessments. It supports high-stakes programming tests, auto-evaluation, strict proctoring, and comprehensive result analytics.

---

## 🌟 Key Features

- **Role-based Access Control:** Dedicated interfaces and routing for Admins, Faculty, and Students.
- **Academic Management:** Comprehensive schema for Departments, Study Years, Semesters, Sections, and Subjects.
- **User Management:** Bulk import/export of Students and Faculty. Group students into Auto or Custom cohorts.
- **Question Bank:** Rich library of Programming questions, MCQs, and debugging challenges.
  - Supports execution in **C, C++, Java, and Python**.
  - Configurable hidden/visible test cases with weightage and timeouts.
- **Strict Examination Engine:**
  - Secure environment with proctoring heuristics (Tab switching, Fullscreen exit monitoring, Window blur).
  - Configurable test strictness (e.g. Auto-submit after 3 warnings).
  - Configurable passing percentages, marks, and question shuffling.
  - Live code execution and immediate grading through isolated workers.
- **Analytics & Reports:** Post-exam leaderboards, performance graphs, and execution analysis.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand (Client State), TanStack React Query (Server State)
- **Editor:** Monaco Editor (VS Code core for browser)
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma ORM
- **Caching & Queues:** Redis, Bull (for async code execution)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **Security:** Helmet, CORS, Express Rate Limit

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v20+)
- **PostgreSQL** (v14+)
- **Redis Server** (v6+)

### 1. Database & Redis Setup
Ensure your PostgreSQL and Redis instances are running.
Create a database in PostgreSQL named `testportal` (or any name of your choice).

### 2. Backend Installation

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/testportal"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_super_secret_jwt_key_here"
```

Initialize the database schema and optionally seed the initial admin account:
```bash
npx prisma db push
# If you have a seed script, run it:
npx prisma db seed
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Installation

Open a new terminal window:
```bash
cd frontend
npm install
```

Start the frontend Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```
├── backend/
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # DB, Redis configurations
│   │   ├── middleware/     # Auth, Role, Validation middlewares
│   │   ├── modules/        # Domain-driven modules (auth, exam, users, etc.)
│   │   ├── utils/          # Helper utilities (JWT, etc.)
│   │   └── app.ts          # Express app entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/         # Static assets (images, icons)
    │   ├── components/     # Reusable UI components and Layouts
    │   ├── hooks/          # Custom React Query hooks
    │   ├── pages/          # Route components (Admin, Faculty, Student)
    │   ├── services/       # Axios API client setup
    │   ├── store/          # Zustand stores (Auth store)
    │   └── utils/          # Utility functions (cn, styling)
    └── package.json
```

---

## 🛡️ Security & Proctoring Notes

- **Anti-Cheat:** The frontend `ExamScreen` binds to the `visibilitychange` and `fullscreenchange` DOM events. If a student leaves the tab, they receive a warning. When the warning threshold (configurable per test) is exceeded, the exam is forcibly submitted.
- **Copy-Paste Block:** The Monaco editor context menu is disabled, and keyboard shortcuts (`Ctrl+C`, `Ctrl+V`, etc.) are actively intercepted to prevent pasting external code.
- **Execution Isolation:** Code execution tasks are pushed to a Redis queue and processed by Bull workers to prevent the main Node.js event loop from being blocked by long-running or infinite-loop submissions.

---

## 👨‍💻 Developed By

**Deepak UK (24BTAD013)**
[deepakuk.me](https://deepakuk.me)
