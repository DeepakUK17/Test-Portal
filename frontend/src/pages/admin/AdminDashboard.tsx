import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Building2, Users, LogOut, ArrowRight, BookOpen, School } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const AdminDashboard = () => {
    const logout = useAuthStore(state => state.logout);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Test Portal Admin</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors hidden sm:block">
                                Developed by Deepak UK (24BTAD013)
                            </a>
                            <button
                                onClick={logout}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Welcome to the Admin Control Panel
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Manage the foundational academic structure of your institution and oversee user accounts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Academic Structure Card */}
                    <Link to="/admin/academic" className="group block h-full">
                        <Card className="h-full border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-indigo-50/30">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <School className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Academic Structure</h2>
                                <p className="text-gray-600 mb-6 flex-1">
                                    Define the core architecture of your institution. Create and manage Departments, Study Years, Semesters, Sections, and Subjects.
                                </p>
                                <div className="flex items-center text-indigo-600 font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                                    Manage Structure <ArrowRight className="w-5 h-5 ml-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* User Management Card */}
                    <Link to="/admin/users" className="group block h-full">
                        <Card className="h-full border-2 border-transparent hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">User Management</h2>
                                <p className="text-gray-600 mb-6 flex-1">
                                    Onboard and manage Students and Faculty. Bulk import users from CSV files, reset passwords, and suspend accounts if necessary.
                                </p>
                                <div className="flex items-center text-emerald-600 font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                                    Manage Users <ArrowRight className="w-5 h-5 ml-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                
                {/* Information Section */}
                <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        Understanding the Academic Structure
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                                Departments
                            </h4>
                            <p className="text-sm text-gray-600">The root of the structure (e.g., Computer Science, Mechanical). All students and faculty belong to a department.</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                                Study Years
                            </h4>
                            <p className="text-sm text-gray-600">The academic year of the student (e.g., Year 1, Year 2). Used to group students into their current progression.</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
                                Semesters
                            </h4>
                            <p className="text-sm text-gray-600">Typically 1 through 8. Used to further divide a study year and assign specific subjects taught in that period.</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">4</span>
                                Sections
                            </h4>
                            <p className="text-sm text-gray-600">Specific class groups (e.g., Section A, Section B). Students are placed into sections, and Faculty assign tests to specific sections.</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">5</span>
                                Subjects
                            </h4>
                            <p className="text-sm text-gray-600">The courses being taught (e.g., Data Structures). Question bank problems and exams are categorized by Subject.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
