import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, Download } from 'lucide-react';
import { toast } from 'sonner';

export const TestReport = () => {
    const { id } = useParams();

    const { data: results, isLoading } = useQuery({
        queryKey: ['test-results', id],
        queryFn: async () => {
            const res = await api.get(`/reports/tests/${id}/results`);
            return res.data.data;
        }
    });

    const resetWarnings = async (sessionId: string) => {
        if (!confirm('Are you sure you want to reset warnings for this attempt? This will let the student resume the test.')) return;
        try {
            await api.post(`/reports/sessions/${sessionId}/reset-warnings`);
            toast.success('Warnings reset successfully');
            // Normally we'd invalidate queries here, but a reload is fine for now
            window.location.reload();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reset warnings');
        }
    };

    if (isLoading) return <div className="p-8">Loading test report...</div>;

    const exportToCSV = () => {
        if (!results || results.length === 0) return;
        
        const headers = ['Roll Number', 'Name', 'Score', 'Status', 'Started At', 'Completed At'];
        const csvContent = [
            headers.join(','),
            ...results.map((r: any) => [
                r.student.rollNumber,
                r.student.fullName,
                r.score,
                r.status,
                new Date(r.startedAt).toLocaleString(),
                r.completedAt ? new Date(r.completedAt).toLocaleString() : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `test_report_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/faculty/reports">
                        <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Detailed Test Report</h1>
                </div>
                <Button onClick={exportToCSV} disabled={!results || results.length === 0}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Performances</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table headers={['Rank', 'Roll No', 'Name', 'Status', 'Warnings', 'Score', 'Actions']}>
                            {results?.map((result: any, index: number) => (
                                <tr key={result.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{result.student.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{result.student.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded text-xs ${result.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : result.status === 'AUTO_SUBMITTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {result.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${result.warningCount >= 3 ? 'bg-red-100 text-red-700' : result.warningCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {result.warningCount || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{result.score || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {(result.status === 'AUTO_SUBMITTED' || result.warningCount > 0) && (
                                            <Button size="sm" variant="outline" onClick={() => resetWarnings(result.id)}>
                                                Reset Warnings
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {results?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No submissions yet for this test.
                                    </td>
                                </tr>
                            )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
