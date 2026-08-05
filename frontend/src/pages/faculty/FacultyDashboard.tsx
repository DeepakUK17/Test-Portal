import { Link } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, BarChart2, ArrowRight, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useTests } from '../../hooks/useTests';
import { useGroups } from '../../hooks/useGroups';
import { useQuestions } from '../../hooks/useQuestions';

const navCards = [
  {
    to: '/faculty/groups',
    icon: Users,
    color: 'blue',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderHover: 'hover:border-blue-500',
    gradientFrom: 'from-white',
    gradientTo: 'to-blue-50/30',
    textColor: 'text-blue-600',
    label: 'Student Groups',
    desc: 'Create custom student groups for targeted test assignments. Assign remedial, advanced, or any custom batch directly.',
    action: 'Manage Groups',
  },
  {
    to: '/faculty/questions',
    icon: BookOpen,
    color: 'purple',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderHover: 'hover:border-purple-500',
    gradientFrom: 'from-white',
    gradientTo: 'to-purple-50/30',
    textColor: 'text-purple-600',
    label: 'Question Bank',
    desc: 'Create and manage coding problems, MCQs, and test cases. Organize questions by difficulty and topic.',
    action: 'Manage Questions',
  },
  {
    to: '/faculty/tests',
    icon: ClipboardList,
    color: 'emerald',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderHover: 'hover:border-emerald-500',
    gradientFrom: 'from-white',
    gradientTo: 'to-emerald-50/30',
    textColor: 'text-emerald-600',
    label: 'Test Management',
    desc: 'Create tests, assign them to sections or groups, and manage the full test lifecycle from draft to completion.',
    action: 'Manage Tests',
  },
  {
    to: '/faculty/reports',
    icon: BarChart2,
    color: 'amber',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderHover: 'hover:border-amber-500',
    gradientFrom: 'from-white',
    gradientTo: 'to-amber-50/30',
    textColor: 'text-amber-600',
    label: 'Reports & Analytics',
    desc: 'View student performance, test completion rates, and detailed per-question analytics.',
    action: 'View Reports',
  },
];

export const FacultyDashboard = () => {
  const { data: tests } = useTests();
  const { data: groups } = useGroups();
  const { data: questions } = useQuestions();

  const activeTests = tests?.filter((t: any) => t.status === 'ACTIVE' || t.status === 'PUBLISHED').length ?? 0;
  const totalGroups = groups?.length ?? 0;
  const totalQuestions = questions?.length ?? 0;
  const draftTests = tests?.filter((t: any) => t.status === 'DRAFT').length ?? 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Faculty Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">KAHE Coding Assessment Platform</p>
          </div>
        </div>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl">
          Manage your student groups, build your question bank, and conduct assessments — all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Active Tests', value: activeTests, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Student Groups', value: totalGroups, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Questions', value: totalQuestions, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Draft Tests', value: draftTests, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
            <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navCards.map(({ to, icon: Icon, iconBg, iconColor, borderHover, gradientFrom, gradientTo, textColor, label, desc, action }) => (
          <Link key={to} to={to} className="group block h-full">
            <Card className={`h-full border-2 border-transparent ${borderHover} hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
              <CardContent className="p-8 flex flex-col h-full">
                <div className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{label}</h2>
                <p className="text-gray-500 text-sm flex-1 leading-relaxed mb-5">{desc}</p>
                <div className={`flex items-center gap-2 ${textColor} font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200`}>
                  {action} <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Tests */}
      {tests && tests.length > 0 && (
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900">Recent Tests</h3>
            <Link to="/faculty/tests" className="text-sm text-blue-600 font-medium hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {tests.slice(0, 4).map((test: any) => (
              <div key={test.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{test.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{test.subject?.name || 'No subject'} · {test.durationMinutes} mins</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  test.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                  test.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                  test.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-600'
                }`}>{test.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
