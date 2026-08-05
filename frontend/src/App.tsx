import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { FacultyLayout } from './components/layout/FacultyLayout';
import { Login } from './pages/Login';
import { SetupPassword } from './pages/SetupPassword';
import { AcademicManagement } from './pages/admin/AcademicManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { GroupManagement } from './pages/faculty/GroupManagement';
import { QuestionBank } from './pages/faculty/QuestionBank';
import { TestManagement } from './pages/faculty/TestManagement';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExamScreen } from './pages/student/ExamScreen';
import { StudentResult } from './pages/student/StudentResult';
import { ReportsDashboard } from './pages/faculty/ReportsDashboard';
import { TestReport } from './pages/faculty/TestReport';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';

const Unauthorized = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-black text-gray-200 mb-4">403</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">Access Denied</p>
      <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
      <a href="/login" className="text-blue-600 underline text-sm">Go to Login</a>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup-password" element={<SetupPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/academic" element={<AcademicManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>

        {/* Faculty Routes — all wrapped in the FacultyLayout sidebar */}
        <Route element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']} />}>
          <Route
            path="/faculty/dashboard"
            element={<FacultyLayout><FacultyDashboard /></FacultyLayout>}
          />
          <Route
            path="/faculty/groups"
            element={<FacultyLayout><GroupManagement /></FacultyLayout>}
          />
          <Route
            path="/faculty/questions"
            element={<FacultyLayout><QuestionBank /></FacultyLayout>}
          />
          <Route
            path="/faculty/tests"
            element={<FacultyLayout><TestManagement /></FacultyLayout>}
          />
          <Route
            path="/faculty/reports"
            element={<FacultyLayout><ReportsDashboard /></FacultyLayout>}
          />
          <Route
            path="/faculty/reports/:id"
            element={<FacultyLayout><TestReport /></FacultyLayout>}
          />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/exam/:attemptId" element={
            <ErrorBoundary fallbackRender={({ error }: { error: any }) => (
                <div className="h-screen flex items-center justify-center bg-red-50 p-8">
                    <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Exam Screen Route Crashed</h2>
                        <p className="text-sm text-gray-700 mb-2">An unexpected error occurred in the exam hooks or initialization:</p>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto text-red-800 border border-red-200">
                            {error.message}
                            {'\n\n'}
                            {error.stack}
                        </pre>
                    </div>
                </div>
            )}>
              <ExamScreen />
            </ErrorBoundary>
          } />
          <Route path="/student/result/:attemptId" element={<StudentResult />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;
