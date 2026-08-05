import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { BarChart2, ClipboardList, BookOpen, Users, ExternalLink } from 'lucide-react';

const statusConfig: Record<string, { className: string; label: string }> = {
    DRAFT:     { className: 'bg-gray-100 text-gray-600',  label: 'Draft' },
    PUBLISHED: { className: 'bg-blue-100 text-blue-700',  label: 'Published' },
    ACTIVE:    { className: 'bg-green-100 text-green-700', label: 'Active' },
    COMPLETED: { className: 'bg-red-100 text-red-600',    label: 'Completed' },
};

export const ReportsDashboard = () => {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['reports-stats'],
        queryFn: async () => {
            const res = await api.get('/reports/dashboard');
            return res.data.data;
        }
    });

    const { data: tests, isLoading: testsLoading } = useQuery({
        queryKey: ['reports-tests'],
        queryFn: async () => {
            const res = await api.get('/reports/tests');
            return res.data.data;
        }
    });

    const isLoading = statsLoading || testsLoading;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h1>
                <p className="text-gray-500 mt-1.5">Overview of platform metrics and test performance.</p>
            </div>

            {/* Stats */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Tests', value: stats?.totalTests ?? 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Active Tests', value: stats?.activeTests ?? 0, icon: BarChart2, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Total Questions', value: stats?.totalQuestions ?? 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Recent Attempts', value: stats?.recentAttempts?.length ?? 0, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-4 h-4 ${color}`} />
                                <span className="text-xs font-medium text-gray-500">{label}</span>
                            </div>
                            <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Test Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        Test Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : tests?.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No tests found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide pr-6">Test Name</th>
                                        <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide pr-6">Status</th>
                                        <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide pr-6">Duration</th>
                                        <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide pr-6">Attempts</th>
                                        <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tests?.map((test: any) => {
                                        const status = statusConfig[test.status] ?? statusConfig.DRAFT;
                                        return (
                                            <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3.5 font-medium text-gray-900 pr-6">{test.title}</td>
                                                <td className="py-3.5 pr-6">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
                                                </td>
                                                <td className="py-3.5 text-gray-500 pr-6">{test.duration} mins</td>
                                                <td className="py-3.5 text-gray-500 pr-6">{test.totalAttempts}</td>
                                                <td className="py-3.5">
                                                    <Link to={`/faculty/reports/${test.id}`}>
                                                        <Button variant="outline" size="sm" className="gap-1.5">
                                                            <ExternalLink className="w-3.5 h-3.5" /> View
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
