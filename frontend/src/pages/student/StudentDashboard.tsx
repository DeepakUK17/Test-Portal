import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyTests, useStartTest } from '../../hooks/useExam';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';

export const StudentDashboard = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const { data: tests, isLoading } = useMyTests();
    const startMutation = useStartTest();

    // Password modal state
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<{id: string, title: string, passwordHash: string} | null>(null);
    const [passwordInput, setPasswordInput] = useState('');

    const handleStartTest = (testId: string, testTitle: string, passwordHash?: string | null) => {
        if (passwordHash) {
            setSelectedTest({ id: testId, title: testTitle, passwordHash });
            setPasswordInput('');
            setPasswordModalOpen(true);
            return;
        }
        
        startTestFlow(testId, testTitle);
    };

    const startTestFlow = (testId: string, testTitle: string) => {
        toast(`Start "${testTitle}"?`, {
            description: 'Your timer will begin immediately once you start.',
            action: {
                label: 'Start Now',
                onClick: () => startMutation.mutate(testId, {
                    onSuccess: (attempt) => navigate(`/exam/${attempt.id}`),
                    onError: () => toast.error('Failed to start the test. Please try again.')
                })
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        });
    };

    const handlePasswordSubmit = () => {
        if (passwordInput !== selectedTest?.passwordHash) {
            toast.error('Incorrect password');
            return;
        }
        setPasswordModalOpen(false);
        startTestFlow(selectedTest!.id, selectedTest!.title);
    };

    const handleResumeTest = (attemptId: string) => {
        navigate(`/exam/${attemptId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                    <div className="flex items-center gap-6">
                        <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors hidden sm:block">
                            Developed by Deepak UK (24BTAD013)
                        </a>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800">My Tests</h2>
                    <p className="text-gray-600">Tests assigned to your section or group.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? <div>Loading...</div> : tests?.map((test: any) => {
                        const attempt = test.StudentSessions?.[0];
                        const isCompleted = attempt && (attempt.status === 'SUBMITTED' || attempt.status === 'AUTO_SUBMITTED');
                        const isInProgress = attempt && attempt.status === 'RUNNING';
                        
                        // Time window logic
                        const now = new Date();
                        const hasTimeWindow = test.startTime && test.endTime;
                        const startTime = hasTimeWindow ? new Date(test.startTime) : null;
                        const endTime = hasTimeWindow ? new Date(test.endTime) : null;
                        
                        const isTimeWindowOpen = hasTimeWindow ? (now >= startTime! && now <= endTime!) : true;
                        
                        // A test is available if it is explicitly RUNNING, or if it is PUBLISHED and the time window is open.
                        const isAvailableToStart = test.status === 'RUNNING' || (test.status === 'PUBLISHED' && isTimeWindowOpen);
                        const attemptCount = test.StudentSessions?.length || 0;
                        const maxAttempts = test.maxAttempts || 1;
                        const maxAttemptsReached = attemptCount >= maxAttempts && !isInProgress;

                        return (
                            <Card key={test.id} className={isCompleted ? 'opacity-75' : ''}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{test.title}</CardTitle>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            isCompleted ? 'bg-gray-100 text-gray-800' :
                                            isInProgress ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                            isAvailableToStart ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : isAvailableToStart ? 'Available' : 'Upcoming/Closed'}
                                        </span>
                                    </div>
                                    <CardDescription>{test.subject?.name}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                                        <p><span className="font-medium">Duration:</span> {test.duration} mins</p>
                                        <p><span className="font-medium">Attempts:</span> {attemptCount} / {maxAttempts}</p>
                                        <p><span className="font-medium">Start:</span> {startTime ? startTime.toLocaleString() : 'Flexible'}</p>
                                        <p><span className="font-medium">End:</span> {endTime ? endTime.toLocaleString() : 'Flexible'}</p>
                                    </div>
                                    
                                    {isCompleted && attemptCount >= maxAttempts ? (
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate(`/student/result/${attempt.id}`)}>View Result</Button>
                                    ) : isCompleted && attemptCount < maxAttempts ? (
                                        <div className="flex gap-2">
                                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate(`/student/result/${attempt.id}`)}>View Result</Button>
                                            {isAvailableToStart && (
                                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStartTest(test.id, test.title, test.passwordHash)} disabled={startMutation.isPending}>
                                                    Retake
                                                </Button>
                                            )}
                                        </div>
                                    ) : isInProgress ? (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleResumeTest(attempt.id)}>Resume Test</Button>
                                    ) : maxAttemptsReached ? (
                                        <Button className="w-full bg-gray-400 text-white" disabled>Max Attempts Reached</Button>
                                    ) : isAvailableToStart ? (
                                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStartTest(test.id, test.title, test.passwordHash)} disabled={startMutation.isPending}>
                                            {startMutation.isPending ? 'Starting...' : 'Start Test'}
                                        </Button>
                                    ) : (
                                        <Button className="w-full" variant="outline" disabled>Not Available</Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                    {tests?.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border">
                            <p className="text-gray-500">No tests assigned to you at the moment.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Password Modal */}
            <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Test Password Required">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Please enter the password to start <strong>{selectedTest?.title}</strong>.
                    </p>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter password..."
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
                        <Button onClick={handlePasswordSubmit}>Continue</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
