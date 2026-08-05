import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, CheckCircle2, XCircle, Clock, Database, Laptop, Globe, Info } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useState } from 'react';

export const StudentResult = () => {
    const { attemptId } = useParams();
    const [activeTab, setActiveTab] = useState<'summary' | 'sections'>('sections');

    const { data: result, isLoading } = useQuery({
        queryKey: ['student-result', attemptId],
        queryFn: async () => {
            const res = await api.get(`/exam/results/${attemptId}`);
            return res.data.data;
        }
    });

    if (isLoading) return <div className="p-8 text-center flex items-center justify-center h-screen bg-gray-50">Loading detailed result analysis...</div>;
    if (!result) return <div className="p-8 text-center text-red-500 h-screen flex items-center justify-center">Result not found or not available yet.</div>;

    const student = result.student;
    const test = result.test;
    
    // Group submissions by question to get the latest submission for each
    const latestSubmissionsMap = new Map();
    if (result.Submissions) {
        result.Submissions.forEach((sub: any) => {
            if (!latestSubmissionsMap.has(sub.questionId)) {
                latestSubmissionsMap.set(sub.questionId, sub);
            }
        });
    }
    const submissions = Array.from(latestSubmissionsMap.values());

    // Calculate totals
    const totalMarksObtained = submissions.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
    const maxMarks = test.maximumMarks;

    return (
        <div className="min-h-screen bg-gray-50 text-sm">
            <header className="bg-[#1a0e14] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-1 rounded">
                        <span className="text-black font-bold text-lg px-2">KP</span>
                    </div>
                    <span className="font-semibold tracking-wide">TEST PORTAL EXAM</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-gray-800 px-3 py-1 rounded text-xs">Attempt 1 of {test.maxAttempts}</span>
                    <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
                        Developed by Deepak UK (24BTAD013)
                    </a>
                    <Link to="/student/dashboard">
                        <Button variant="outline" size="sm" className="text-black bg-white hover:bg-gray-200">Back to Dashboard</Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Meta Information Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6 text-xs text-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 mb-6 pb-6 border-b">
                        <div>
                            <span className="block text-gray-400 font-medium mb-1">Student</span>
                            <span className="font-bold text-gray-900">{student?.fullName || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 font-medium mb-1">Email Id / Roll No</span>
                            <span className="font-bold text-gray-900">{student?.rollNumber || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 font-medium mb-1">Test</span>
                            <span className="font-bold text-gray-900">{test?.title}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 font-medium mb-1">Status</span>
                            <span className={`font-bold ${result.status === 'AUTO_SUBMITTED' ? 'text-red-600' : 'text-green-600'}`}>
                                {result.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500"/> IP Address: {result.ipAddress || '127.0.0.1'}</div>
                        <div className="flex items-center gap-2"><Info className="w-4 h-4 text-orange-500"/> Tab Switches: {result.warningCount || 0}</div>
                        <div className="flex items-center gap-2"><Laptop className="w-4 h-4 text-gray-500"/> OS Used: {result.device || 'Windows'}</div>
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-green-500"/> Browser: {result.browser || 'Chrome'}</div>
                        
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500"/> Test Duration: {test.durationMinutes} mins</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500"/> Start Time: {new Date(result.startedAt).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-500"/> Submit Time: {new Date(result.submittedAt || Date.now()).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><Info className="w-4 h-4 text-yellow-500"/> Marks: <strong className="text-gray-900">{totalMarksObtained} / {maxMarks}</strong></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b mb-6">
                    <button 
                        className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        Summary
                    </button>
                    <button 
                        className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'sections' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        onClick={() => setActiveTab('sections')}
                    >
                        Sections / Questions
                    </button>
                </div>

                {activeTab === 'summary' && (
                    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Total Score</h2>
                        <div className="text-6xl font-black text-blue-600 mb-2">{totalMarksObtained}</div>
                        <p className="text-gray-500 mb-8">out of {maxMarks}</p>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Switch to the <strong>Sections / Questions</strong> tab to see a detailed breakdown of your code, test case results, compilation messages, and memory usage.
                        </p>
                    </div>
                )}

                {activeTab === 'sections' && (
                    <div className="space-y-12">
                        {result.test?.Questions?.map((tq: any, index: number) => {
                            const q = tq.question;
                            const sub = submissions.find((s: any) => s.questionId === q.id);
                            const pd = q.ProgrammingDetails;
                            
                            return (
                                <div key={q.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b font-medium text-gray-800">
                                        Question No: {index + 1}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold mb-4">{q.title}</h3>
                                        
                                        {/* Problem Statement */}
                                        <div className="mb-6 space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 border-b pb-1 mb-2">Problem Statement</h4>
                                                <div className="text-gray-700 whitespace-pre-wrap">{q.description}</div>
                                            </div>
                                            {pd && (
                                                <>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 border-b pb-1 mb-2">Input format</h4>
                                                        <div className="text-gray-700 whitespace-pre-wrap">{pd.inputFormat}</div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 border-b pb-1 mb-2">Output format</h4>
                                                        <div className="text-gray-700 whitespace-pre-wrap">{pd.outputFormat}</div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 border-b pb-1 mb-2">Code constraints</h4>
                                                        <div className="text-gray-700 whitespace-pre-wrap">{pd.constraints}</div>
                                                    </div>
                                                    
                                                    {/* Sample Cases */}
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 border-b pb-1 mb-2">Sample test cases</h4>
                                                        <div className="grid grid-cols-2 gap-8 mt-4">
                                                            <div>
                                                                <strong className="block mb-2 text-gray-800">Input 1:</strong>
                                                                <pre className="bg-gray-50 text-gray-700 border p-3 rounded text-xs">{pd.sampleInput || q.TestCases?.[0]?.input || 'N/A'}</pre>
                                                            </div>
                                                            <div>
                                                                <strong className="block mb-2 text-gray-800">Output 1:</strong>
                                                                <pre className="bg-gray-50 text-gray-700 border p-3 rounded text-xs">{pd.sampleOutput || q.TestCases?.[0]?.expectedOutput || 'N/A'}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Code Viewer */}
                                        <div className="border rounded-md overflow-hidden bg-[#1e1e1e] mb-6">
                                            <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center text-white text-xs">
                                                <span>Fill your code here</span>
                                                <span className="capitalize">{sub?.language || 'N/A'}</span>
                                            </div>
                                            <div className="h-[400px]">
                                                <Editor
                                                    height="100%"
                                                    language={sub?.language === 'c' || sub?.language === 'cpp' ? 'cpp' : (sub?.language || 'plaintext')}
                                                    theme="vs-dark"
                                                    value={sub?.sourceCode || '// No code submitted'}
                                                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, padding: { top: 16 } }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metrics Bar */}
                                        <div className="flex flex-wrap gap-4 py-4 border-b border-t mb-6 text-xs items-center bg-gray-50 px-4">
                                            <div className="flex gap-2 items-center">
                                                <span className="text-gray-500">Status</span>
                                                <strong className={!sub ? 'text-gray-600' : (sub.compilerStatus === 'ACCEPTED' ? 'text-green-600' : 'text-red-600')}>
                                                    {!sub ? 'Not Attempted' : (sub.compilerStatus === 'ACCEPTED' ? 'Correct' : 'Wrong Answer')}
                                                </strong>
                                            </div>
                                            <div className="w-px h-4 bg-gray-300"></div>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-gray-500">Mark obtained</span>
                                                <strong>{sub?.score || 0} / {q.marks}</strong>
                                            </div>
                                            <div className="w-px h-4 bg-gray-300"></div>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-gray-500">Level</span>
                                                <strong className="capitalize">{q.difficulty.toLowerCase()}</strong>
                                            </div>
                                            <div className="w-px h-4 bg-gray-300"></div>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-gray-500">Subject</span>
                                                <strong className="capitalize">{sub?.language || 'N/A'}</strong>
                                            </div>
                                        </div>

                                        {/* Test Cases Table */}
                                        <div>
                                            <h4 className="font-bold mb-4">Result</h4>
                                            <p className="text-green-600 font-medium mb-4 text-sm flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {sub?.TestCaseResults?.filter((t: any) => t.status === 'ACCEPTED').length || 0}/{sub?.TestCaseResults?.length || q.TestCases?.length || 0} Testcases Passed
                                            </p>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-t border-gray-200 bg-gray-50 text-gray-700">
                                                            <th className="py-4 px-4 font-bold">Test Case</th>
                                                            <th className="py-4 px-4 font-bold">Result</th>
                                                            <th className="py-4 px-4 font-bold">Status</th>
                                                            <th className="py-4 px-4 font-bold">Time(Ms)</th>
                                                            <th className="py-4 px-4 font-bold">Space Comp...</th>
                                                            <th className="py-4 px-4 font-bold">Message</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {!sub ? (
                                                            <tr>
                                                                <td colSpan={6} className="py-4 px-4 text-center text-gray-500">No test cases executed (question not attempted)</td>
                                                            </tr>
                                                        ) : sub.TestCaseResults?.map((tcr: any, i: number) => (
                                                            <tr key={tcr.testCaseId} className="border-b">
                                                                <td className="py-4 px-4">{i + 1}</td>
                                                                <td className="py-4 px-4">
                                                                    {tcr.status === 'ACCEPTED' ? (
                                                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={`py-4 px-4 font-medium ${tcr.status === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {tcr.status}
                                                                </td>
                                                                <td className="py-4 px-4">{tcr.executionTimeMs} Ms</td>
                                                                <td className="py-4 px-4">{tcr.memoryUsedBytes || 0}</td>
                                                                <td className="py-4 px-4 text-gray-600">{tcr.error || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {submissions.length === 0 && (
                            <div className="text-center py-12 bg-white rounded border text-gray-500">
                                No questions were attempted.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
