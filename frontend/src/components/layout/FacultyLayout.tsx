import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users, BookOpen, ClipboardList, BarChart2, LogOut, GraduationCap, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { href: '/faculty/dashboard', label: 'Dashboard', icon: Home },
  { href: '/faculty/groups', label: 'Student Groups', icon: Users },
  { href: '/faculty/questions', label: 'Question Bank', icon: BookOpen },
  { href: '/faculty/tests', label: 'Manage Tests', icon: ClipboardList },
  { href: '/faculty/reports', label: 'Reports', icon: BarChart2 },
];

export const FacultyLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-center">
          <img src="/logo.png" alt="KAHE Logo" className="h-12 w-auto object-contain" />
        </div>

        {/* Nav Role Badge */}
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Faculty Panel</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-gray-400')} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout and Branding */}
        <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-center text-[10px] text-gray-400 hover:text-blue-500 transition-colors mt-2">
            Developed by Deepak UK (24BTAD013)
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};
