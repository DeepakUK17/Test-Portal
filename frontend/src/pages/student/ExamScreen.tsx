import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestQuestions, useSaveCode, useRunCode, useSubmitCode, useSubmitTest, useLogWarning } from '../../hooks/useExam';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2 } from 'lucide-react';

import Editor from '@monaco-editor/react';

export const ExamScreen = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    
    const { data: testData, isLoading } = useTestQuestions(attemptId!);
    const questions = testData?.questions;
    const allowedLanguages = testData?.allowedLanguages || ['c', 'cpp', 'java', 'python'];
    const saveMutation = useSaveCode();
    const runMutation = useRunCode();
    const submitCodeMutation = useSubmitCode();
    const submitTestMutation = useSubmitTest();
    const warningMutation = useLogWarning();

    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [codeState, setCodeState] = useState<Record<string, { code: string; language: string }>>({});
    const [runResults, setRunResults] = useState<any>(null);
    const [isCustomInput, setIsCustomInput] = useState(false);
    const [customInputText, setCustomInputText] = useState('');
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [extensionsDetected, setExtensionsDetected] = useState(false);
    const isSubmittingRef = useRef(false);

    // Initialize local state when data loads
    useEffect(() => {
        if (questions && Object.keys(codeState).length === 0) {
            const initial: any = {};
            questions.forEach((q: any) => {
                const defaultLang = allowedLanguages[0] || 'c';
                const defaultTpl = q.question?.Languages?.find((l: any) => l.language.toLowerCase() === defaultLang.toLowerCase());
                initial[q.questionId] = { 
                    code: q.code || defaultTpl?.bodyCode || '', 
                    language: q.language || defaultLang 
                };
            });
            setCodeState(initial);
        }

        if (testData?.session && testData?.test) {
            const startTime = new Date(testData.session.startedAt).getTime();
            const durationMs = testData.test.duration * 60 * 1000;
            const endTime = startTime + durationMs;
            
            const calculateTimeLeft = () => {
                const remaining = endTime - Date.now();
                return remaining > 0 ? remaining : 0;
            };

            setTimeLeft(calculateTimeLeft());

            const timer = setInterval(() => {
                const remaining = calculateTimeLeft();
                setTimeLeft(remaining);
                if (remaining <= 0 && !isSubmittingRef.current) {
                    clearInterval(timer);
                    isSubmittingRef.current = true;
                    toast.error('Time is up! Submitting test automatically.');
                    submitTestMutation.mutate(attemptId!, {
                        onSuccess: () => navigate(`/student/result/${attemptId}`)
                    });
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [questions, testData]);

    // Format time left helper
    const formatTime = (ms: number | null) => {
        if (ms === null) return '--:--';
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Comprehensive Anti-Cheat Proctoring
    useEffect(() => {
        const lastWarningTimeRef = { current: 0 };

        const handleWarning = (type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT') => {
            if (isSubmittingRef.current) return;
            const now = Date.now();
            if (now - lastWarningTimeRef.current < 2000) return; // Throttle warnings to max 1 per 2 seconds
            lastWarningTimeRef.current = now;

            warningMutation.mutate({ attemptId: attemptId!, type }, {
                onSuccess: (res: any) => {
                    if (res.data?.submitted) {
                        toast.error('Test automatically submitted due to maximum warnings reached.');
                        navigate(`/student/result/${attemptId}`);
                    } else if (res.data?.warnings) {
                        toast.error(`Warning ${res.data.warnings} of ${res.data.maxWarnings}: Exam rule violation detected (${type})!`);
                    } else {
                        toast.error(`Warning: Exam rule violation detected (${type})!`);
                    }
                }
            });
        };

        const handleBlur = () => handleWarning('TAB_SWITCH');
        
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                handleWarning('FULLSCREEN_EXIT');
            } else {
                setIsFullscreen(true);
            }
        };

        const preventDevTools = (e: KeyboardEvent) => {
            // Block F5 and Ctrl+R
            if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
                e.preventDefault();
                toast.error('Refreshing the page is not allowed during the exam.');
            }
        };

        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const preventUnload = (e: BeforeUnloadEvent) => {
            if (!isSubmittingRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const preventCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            toast.error('Copy/Paste is strictly prohibited during the exam.');
        };

        // Basic Extension & AdBlocker Detection Heuristics
        const detectExtensions = () => {
            let detectedReason = '';
            
            // Check for common global variables injected by extensions
            // Only enforce React DevTools block in production so developers can test locally
            if (import.meta.env.PROD && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                detectedReason = 'React DevTools detected';
                setExtensionsDetected(true);
            }
            
            // Check for AdBlockers by creating a bait element
            const adBait = document.createElement('div');
            adBait.className = 'ad-banner adsbox doubleclick ad-placement';
            adBait.style.position = 'absolute';
            adBait.style.left = '-9999px';
            adBait.style.height = '10px';
            adBait.style.width = '10px';
            document.body.appendChild(adBait);
            
            setTimeout(() => {
                if (adBait.offsetHeight === 0 || window.getComputedStyle(adBait).display === 'none') {
                    if (!detectedReason) detectedReason = 'AdBlocker or Browser Shield detected';
                    setExtensionsDetected(true);
                }
                // Check for Grammarly or other common injected DOM elements
                if (document.querySelector('grammarly-extension') || document.querySelector('div[id^="grammarly"]')) {
                    if (!detectedReason) detectedReason = 'Grammarly or similar DOM extension detected';
                    setExtensionsDetected(true);
                }
                
                if (detectedReason) {
                    console.log('Extension blocked exam because:', detectedReason);
                    (window as any).__extensionBlockReason = detectedReason;
                }
                
                adBait.remove();
            }, 300);
        };

        detectExtensions();

        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('keydown', preventDevTools);
        window.addEventListener('contextmenu', preventContextMenu);
        window.addEventListener('beforeunload', preventUnload);
        window.addEventListener('copy', preventCopyPaste);
        window.addEventListener('paste', preventCopyPaste);
        window.addEventListener('cut', preventCopyPaste);

        return () => {
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', preventDevTools);
            window.removeEventListener('contextmenu', preventContextMenu);
            window.removeEventListener('beforeunload', preventUnload);
            window.removeEventListener('copy', preventCopyPaste);
            window.removeEventListener('paste', preventCopyPaste);
            window.removeEventListener('cut', preventCopyPaste);
        };
    }, [attemptId, navigate]);

    const enterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            setIsFullscreen(true);
        } catch (err) {
            console.error('Fullscreen API error:', err);
            toast.error('Browser blocked fullscreen, but proceeding in normal mode.');
            setIsFullscreen(true);
        }
    };

    if (isLoading || !questions) return <div className="p-8 text-center">Loading Exam Environment...</div>;

    if (!isFullscreen) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Exam Environment</h2>
                    <p className="text-gray-600">
                        This exam requires a secure, fullscreen environment. Any attempt to exit fullscreen, switch tabs, or open developer tools will be logged as a warning.
                    </p>
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm text-left font-medium">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Do not exit fullscreen.</li>
                            <li>Do not switch tabs or windows.</li>
                            <li>Do not use right-click or keyboard shortcuts.</li>
                        </ul>
                    </div>
                    <Button onClick={enterFullscreen} className="w-full h-12 text-lg">Enter Secure Mode to Start</Button>
                </div>
            </div>
        );
    }

    const activeQuestion = questions[activeQuestionIndex]?.question;
    const activeState = codeState[activeQuestion?.id] || { code: '', language: 'c' };

    const handleCodeChange = (newCode: string) => {
        if (!activeQuestion) return;
        setCodeState({
            ...codeState,
            [activeQuestion.id]: { ...activeState, code: newCode }
        });
    };

    const handleLanguageChange = (newLang: string) => {
        if (!activeQuestion) return;
        const currentCode = activeState.code;
        
        let codeToSet = currentCode;
        const newTpl = activeQuestion.Languages?.find((l: any) => l.language.toLowerCase() === newLang.toLowerCase());
        
        if (!currentCode.trim() && newTpl?.bodyCode) {
            codeToSet = newTpl.bodyCode;
        }

        setCodeState({
            ...codeState,
            [activeQuestion.id]: { ...activeState, language: newLang, code: codeToSet }
        });
    };

    const handleSave = () => {
        if (!activeQuestion) return;
        saveMutation.mutate({
            attemptId: attemptId!,
            questionId: activeQuestion.id,
            code: activeState.code,
            language: activeState.language
        }, {
            onSuccess: () => toast.success('Code saved successfully'),
            onError: () => toast.error('Failed to save code. Please try again.')
        });
    };

    const handleRun = () => {
        if (!activeQuestion) return;
        setRunResults(null);
        runMutation.mutate({
            attemptId: attemptId!,
            questionId: activeQuestion.id,
            code: activeState.code,
            language: activeState.language as any,
            customInput: isCustomInput ? customInputText : undefined
        }, {
            onSuccess: (res) => {
                setRunResults(res);
                setTimeout(() => {
                    document.getElementById('execution-results-panel')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    };

    const handleSubmitCode = () => {
        if (!activeQuestion) return;
        setRunResults(null);
        submitCodeMutation.mutate({
            attemptId: attemptId!,
            questionId: activeQuestion.id,
            code: activeState.code,
            language: activeState.language as any
        }, {
            onSuccess: (res) => {
                toast.success(`Score: ${res.score} | Passed ${res.passed}/${res.total} hidden test cases`);
                setRunResults([
                    { testCaseId: 'final', expectedOutput: 'All Test Cases', actualOutput: `Passed ${res.passed}/${res.total}`, success: res.passed === res.total }
                ]);
            }
        });
    };

    const confirmSubmitTest = () => {
        setShowSubmitConfirm(true);
    };

    const handleActualSubmitTest = () => {
        setShowSubmitConfirm(false);
        isSubmittingRef.current = true;
            if (activeQuestion) {
                saveMutation.mutate({
                    attemptId: attemptId!,
                    questionId: activeQuestion.id,
                    code: activeState.code,
                    language: activeState.language
                }, {
                    onSuccess: () => {
                        submitTestMutation.mutate(attemptId!, {
                            onSuccess: () => {
                                toast.success('Test submitted successfully!');
                                navigate(`/student/result/${attemptId}`);
                            },
                            onError: (err: any) => {
                                toast.error(err.response?.data?.message || 'Failed to submit test');
                                isSubmittingRef.current = false;
                            }
                        });
                    },
                    onError: (err: any) => {
                        toast.error(err.response?.data?.message || 'Failed to save code before submitting');
                        isSubmittingRef.current = false;
                    }
                });
            } else {
                submitTestMutation.mutate(attemptId!, {
                    onSuccess: () => {
                        toast.success('Test submitted successfully!');
                        navigate(`/student/result/${attemptId}`);
                    },
                    onError: (err: any) => {
                        toast.error(err.response?.data?.message || 'Failed to submit test');
                        isSubmittingRef.current = false;
                    }
                });
            }
    };

    if (extensionsDetected) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-t-4 border-red-500 animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Extensions Detected</h2>
                    <p className="text-gray-600 mb-2">
                        Disable all the extensions to access this website. You are currently running an AdBlocker or a browser extension that violates the exam environment rules.
                    </p>
                    <div className="bg-red-50 text-red-800 text-sm p-3 rounded mb-6 text-left font-mono">
                        <strong>Detection Reason:</strong> {(window as any).__extensionBlockReason || 'Browser modified or AdBlocker running'}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Please go to your browser's extension settings, disable them, and then refresh this page. Note: Built-in shields (like Brave Shields or Edge Tracking Prevention) may also trigger this.
                    </p>
                    <Button onClick={() => window.location.reload()} className="w-full">
                        I have disabled them, Refresh
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary fallbackRender={({ error }: { error: any }) => (
            <div className="h-screen flex items-center justify-center bg-red-50 p-8">
                <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Exam Screen Crashed</h2>
                    <p className="text-sm text-gray-700 mb-2">An unexpected error occurred rendering the exam interface:</p>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto text-red-800 border border-red-200">
                        {error.message}
                        {'\n\n'}
                        {error.stack}
                    </pre>
                </div>
            </div>
        )}>
            <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
            <header className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg tracking-wide">TEST PORTAL EXAM</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-gray-800 px-4 py-1.5 rounded-full flex items-center gap-2 border border-gray-700 font-mono text-sm shadow-inner">
                        <span className="text-gray-400">Time Left:</span>
                        <span className={`font-bold ${timeLeft !== null && timeLeft < 300000 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <Button variant="destructive" onClick={confirmSubmitTest} disabled={submitTestMutation.isPending || saveMutation.isPending}>
                        {submitTestMutation.isPending ? 'Submitting...' : 'Finish & Submit Test'}
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/3 bg-white flex flex-col border-r shadow-sm z-0 select-none">
                    <div className="p-4 border-b bg-gray-50 flex gap-2 overflow-x-auto">
                        {questions.map((q: any, i: number) => (
                            <button
                                key={q.questionId}
                                onClick={() => { setRunResults(null); setActiveQuestionIndex(i); }}
                                className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeQuestionIndex === i 
                                    ? 'bg-blue-600 text-white shadow' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                            >
                                Problem {i + 1}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto prose max-w-none">
                        <h2 className="text-2xl font-bold mb-2">{activeQuestion?.title}</h2>
                        <div className="mb-6">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                activeQuestion?.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                activeQuestion?.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>{activeQuestion?.difficulty}</span>
                        </div>
                        <p className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border">{activeQuestion?.description}</p>
                        
                        <h3 className="text-lg font-bold mt-8 mb-4">Sample Test Cases</h3>
                        {activeQuestion?.TestCases?.map((tc: any, i: number) => (
                            <div key={tc.id} className="mb-4">
                                <h4 className="font-semibold text-sm mb-1 text-gray-700">Sample {i + 1}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Input</p>
                                        <pre className="bg-gray-100 p-2 rounded text-sm m-0">{tc.input}</pre>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Output</p>
                                        <pre className="bg-gray-100 p-2 rounded text-sm m-0">{tc.expectedOutput}</pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-[#404040]">
                        <select 
                            className="bg-[#3c3c3c] text-white text-sm px-3 py-1 rounded border-none outline-none cursor-pointer capitalize"
                            value={activeState.language}
                            onChange={e => handleLanguageChange(e.target.value)}
                        >
                            {allowedLanguages.map((lang: string) => (
                                <option key={lang} value={lang.toLowerCase()}>{lang === 'cpp' ? 'C++' : lang}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="bg-[#3c3c3c] text-white border-none hover:bg-[#4c4c4c]" onClick={handleSave} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleRun} disabled={runMutation.isPending || submitCodeMutation.isPending}>
                                {runMutation.isPending ? 'Running...' : 'Run Code'}
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmitCode} disabled={submitCodeMutation.isPending || runMutation.isPending}>
                                {submitCodeMutation.isPending ? 'Submitting...' : 'Submit Code'}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-[400px] relative">
                        <Editor
                            height="100%"
                            language={activeState.language === 'c' || activeState.language === 'cpp' ? 'cpp' : activeState.language}
                            theme="vs-dark"
                            value={activeState.code}
                            onChange={(value) => handleCodeChange(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                contextmenu: false,
                                quickSuggestions: false,
                            }}
                        />
                        {(runMutation.isPending || submitCodeMutation.isPending || saveMutation.isPending) && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="flex flex-col items-center justify-center text-white p-6 bg-[#2d2d2d] rounded-xl shadow-xl border border-[#404040]">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                                    <p className="text-lg font-medium">
                                        {submitCodeMutation.isPending ? 'Submitting Code...' : runMutation.isPending ? 'Executing Code...' : 'Saving Code...'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">Please wait, compiling...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div id="execution-results-panel" className="h-1/3 bg-white border-t flex flex-col">
                        <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm text-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span>Execution Results</span>
                                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer font-normal">
                                    <input type="checkbox" checked={isCustomInput} onChange={e => setIsCustomInput(e.target.checked)} className="rounded" />
                                    Provide Custom Input
                                </label>
                            </div>
                            {runMutation.isPending && <span className="text-blue-600 animate-pulse">Running on server...</span>}
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {!runResults && !runMutation.isPending && !isCustomInput && (
                                <p className="text-gray-500 text-sm italic">Click "Run Code" to compile and test your solution against sample cases.</p>
                            )}

                            {isCustomInput && !runResults && !runMutation.isPending && (
                                <div className="h-full">
                                    <textarea
                                        className="w-full h-full min-h-[100px] border border-gray-200 rounded p-2 text-sm font-mono focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter your custom input here..."
                                        value={customInputText}
                                        onChange={e => setCustomInputText(e.target.value)}
                                    />
                                </div>
                            )}
                            
                            {runResults && (
                                <div className="space-y-4">
                                    {runResults.map((res: any, i: number) => (
                                        <div key={res.testCaseId} className={`p-3 rounded border ${res.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <h4 className={`font-bold text-sm mb-2 ${res.success ? 'text-green-700' : 'text-red-700'}`}>
                                                {res.testCaseId === 'final' ? (res.success ? '✅ All Test Cases Passed' : '❌ Some Test Cases Failed') : (res.success ? `✅ Sample ${i + 1} Passed` : `❌ Sample ${i + 1} Failed`)}
                                            </h4>
                                            {res.error ? (
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold text-red-800 mb-1">Error:</p>
                                                    <pre className="text-xs bg-red-100 p-2 rounded text-red-900 whitespace-pre-wrap">{res.error}</pre>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-600 mb-1">Expected Output:</p>
                                                        <pre className="text-xs bg-white p-2 rounded border">{res.expectedOutput}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-600 mb-1">Your Output:</p>
                                                        <pre className="text-xs bg-white p-2 rounded border">{res.actualOutput || '(Empty)'}</pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {submitTestMutation.isPending && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
                        <Loader2 className="w-16 h-16 animate-spin text-white mb-4" />
                        <h2 className="text-2xl font-bold text-white">Submitting your test...</h2>
                        <p className="text-gray-300 mt-2">Please do not close this window.</p>
                    </div>
                )}

                {showSubmitConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h2>
                            <p className="text-gray-600 mb-6">Are you sure you want to finish and submit the test? Once submitted, you cannot return to change your answers.</p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} className="px-6">Cancel</Button>
                                <Button variant="destructive" onClick={handleActualSubmitTest} className="px-6">Yes, Submit</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </ErrorBoundary>
    );
};
