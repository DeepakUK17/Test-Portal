import { useState } from 'react';
import { useTests, useCreateTest, useUpdateTest, useUpdateTestStatus, useDeleteTest } from '../../hooks/useTests';
import { useQuestions } from '../../hooks/useQuestions';
import { useGroups } from '../../hooks/useGroups';
import { useSubjects, useSections } from '../../hooks/useAcademic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { ClipboardList, Plus, ArrowLeft, CheckSquare, Clock, Users, BookOpen } from 'lucide-react';

const statusConfig: Record<string, { className: string; label: string }> = {
    DRAFT:     { className: 'bg-gray-100 text-gray-600',    label: 'Draft' },
    PUBLISHED: { className: 'bg-blue-100 text-blue-700',    label: 'Published' },
    RUNNING:    { className: 'bg-green-100 text-green-700 animate-pulse', label: 'Running' },
    COMPLETED: { className: 'bg-red-100 text-red-600',      label: 'Completed' },
    ARCHIVED:  { className: 'bg-gray-100 text-gray-400',    label: 'Archived' },
};

const TestForm = ({ onSubmit, onCancel, initialData }: any) => {
    const { data: subjects } = useSubjects();
    const { data: groups } = useGroups();
    const { data: sections } = useSections();
    const { data: questions } = useQuestions();

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    
    // Format dates for datetime-local input
    const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const [startTime, setStartTime] = useState(formatDateForInput(initialData?.startTime));
    const [endTime, setEndTime] = useState(formatDateForInput(initialData?.endTime));
    const [durationMinutes, setDurationMinutes] = useState(initialData?.duration || initialData?.durationMinutes || 60);
    const [warningCount, setWarningCount] = useState(initialData?.warningCount ?? 3);
    const [autoSubmitOnWarning, setAutoSubmitOnWarning] = useState(initialData?.autoSubmitOnWarning ?? true);
    const [subjectId, setSubjectId] = useState(initialData?.subjectId || '');
    const [assignmentType, setAssignmentType] = useState<'SECTION' | 'GROUP'>(initialData?.groupId ? 'GROUP' : 'SECTION');
    const [sectionId, setSectionId] = useState(initialData?.sectionId || '');
    const [groupId, setGroupId] = useState(initialData?.groupId || '');
    const [password, setPassword] = useState(initialData?.passwordHash || '');
    const [maxAttempts, setMaxAttempts] = useState(initialData?.maxAttempts || 1);
    const [allowedLanguages, setAllowedLanguages] = useState<string[]>(initialData?.allowedLanguages || ['c', 'cpp', 'java', 'python', 'javascript']);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>(
        initialData?.Questions?.map((q: any) => q.questionId) || []
    );

    const toggleLanguage = (lang: string) => {
        setAllowedLanguages(prev => 
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return toast.error('Test title is required');
        if (!subjectId) return toast.error('Please select a subject');
        if (assignmentType === 'SECTION' && !sectionId) return toast.error('Please select a section');
        if (assignmentType === 'GROUP' && !groupId) return toast.error('Please select a group');
        if (selectedQuestions.length === 0) return toast.error('Select at least one question');
        if (startTime && endTime && new Date(endTime) <= new Date(startTime)) return toast.error('End time must be after start time');

        onSubmit({
            title, description,
            startTime: startTime ? new Date(startTime).toISOString() : undefined,
            endTime: endTime ? new Date(endTime).toISOString() : undefined,
            durationMinutes, warningCount, autoSubmitOnWarning, subjectId,
            ...(assignmentType === 'SECTION' ? { sectionId } : { groupId }),
            password: password ? password : undefined,
            maxAttempts,
            allowedLanguages,
            questions: selectedQuestions
        });
    };

    const toggleQuestion = (qId: string) => {
        setSelectedQuestions(prev =>
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-5">
                    <h3 className="font-semibold text-base text-gray-900 border-b pb-2">Basic Info</h3>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Test Title</label>
                        <Input placeholder="e.g. Unit 1 — Arrays & Strings" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                        <textarea
                            className="flex w-full min-h-[80px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add any instructions or notes for students..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Start Time <span className="text-gray-400 font-normal">(optional)</span></label>
                            <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">End Time <span className="text-gray-400 font-normal">(optional)</span></label>
                            <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                            <Input type="number" min="1" value={durationMinutes} onChange={e => setDurationMinutes(parseInt(e.target.value))} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Max Warnings</label>
                            <Input type="number" min="0" value={warningCount} onChange={e => setWarningCount(parseInt(e.target.value))} required />
                        </div>
                    </div>
                    <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={autoSubmitOnWarning} onChange={e => setAutoSubmitOnWarning(e.target.checked)} className="rounded" />
                        Auto-submit when max warnings reached
                    </label>
                </div>

                {/* Target Audience & Security */}
                <div className="space-y-5">
                    <h3 className="font-semibold text-base text-gray-900 border-b pb-2">Security & Access</h3>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Test Password <span className="text-gray-400 font-normal">(optional)</span></label>
                        <Input type="text" placeholder="Leave blank for no password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Max Attempts (Retries)</label>
                        <Input type="number" min="1" value={maxAttempts} onChange={e => setMaxAttempts(parseInt(e.target.value))} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Allowed Languages</label>
                        <div className="flex flex-wrap gap-3">
                            {['c', 'cpp', 'java', 'python', 'javascript'].map(lang => (
                                <label key={lang} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${allowedLanguages.includes(lang) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                    <input type="checkbox" className="sr-only" checked={allowedLanguages.includes(lang)} onChange={() => toggleLanguage(lang)} />
                                    {allowedLanguages.includes(lang) && <CheckSquare className="w-4 h-4 text-blue-600" />}
                                    <span className="capitalize">{lang === 'cpp' ? 'C++' : lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <h3 className="font-semibold text-base text-gray-900 border-b pb-2 mt-6">Target Audience</h3>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <select
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={subjectId}
                            onChange={e => setSubjectId(e.target.value)}
                        >
                            <option value="">Select Subject...</option>
                            {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Assign To</label>
                        <div className="flex gap-3">
                            {(['SECTION', 'GROUP'] as const).map(type => (
                                <label key={type} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${assignmentType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                    <input type="radio" name="assignmentType" className="sr-only" checked={assignmentType === type} onChange={() => setAssignmentType(type)} />
                                    {type === 'SECTION' ? 'Entire Section' : 'Custom Group'}
                                </label>
                            ))}
                        </div>
                        {assignmentType === 'SECTION' ? (
                            <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={sectionId} onChange={e => setSectionId(e.target.value)}>
                                <option value="">Select Section...</option>
                                {sections?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        ) : (
                            <select className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={groupId} onChange={e => setGroupId(e.target.value)}>
                                <option value="">Select Group...</option>
                                {groups?.map((g: any) => <option key={g.id} value={g.id}>{g.name} ({g.department?.code})</option>)}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Question Selection */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-base text-gray-900">Select Questions</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{selectedQuestions.length} selected</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50">
                    {questions?.map((q: any) => {
                        const isSelected = selectedQuestions.includes(q.id);
                        const diffColor = q.difficulty === 'EASY' ? 'text-green-600' : q.difficulty === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600';
                        return (
                            <button
                                key={q.id}
                                type="button"
                                onClick={() => toggleQuestion(q.id)}
                                className={`text-left p-3 rounded-xl border-2 transition-all duration-150 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-medium text-sm text-gray-900 line-clamp-1">{q.title}</span>
                                    <span className={`text-xs font-semibold shrink-0 ${diffColor}`}>{q.difficulty}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{q.description}</p>
                                {isSelected && <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Selected</div>}
                            </button>
                        );
                    })}
                    {(!questions || questions.length === 0) && (
                        <p className="col-span-2 text-sm text-gray-400 text-center py-8">No questions in the Question Bank. Create some first.</p>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{initialData ? 'Update Test' : 'Create Test'}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
};

export const TestManagement = () => {
    const { data: tests, isLoading } = useTests();
    const createMutation = useCreateTest();
    const updateMutation = useUpdateTest();
    const statusMutation = useUpdateTestStatus();
    const deleteMutation = useDeleteTest();

    const [isCreating, setIsCreating] = useState(false);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);

    const testToEdit = tests?.find((t: any) => t.id === editingTestId);

    const handleCreate = (data: any) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast.success('Test created successfully!');
                setIsCreating(false);
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create test')
        });
    };

    const handleUpdate = (data: any) => {
        if (!editingTestId) return;
        updateMutation.mutate({ id: editingTestId, data }, {
            onSuccess: () => {
                toast.success('Test updated successfully!');
                setEditingTestId(null);
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update test')
        });
    };

    const handleStatusChange = (id: string, status: string, label: string) => {
        statusMutation.mutate({ id, status } as any, {
            onSuccess: () => toast.success(`Test ${label.toLowerCase()} successfully`),
            onError: () => toast.error(`Failed to ${label.toLowerCase()} test`)
        });
    };

    const handleEndTest = (id: string) => {
        toast('End this test immediately?', {
            description: 'All active student sessions will be force-submitted.',
            action: {
                label: 'End Now',
                onClick: () => handleStatusChange(id, 'COMPLETED', 'ended')
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        });
    };

    const handleDeleteTest = (id: string) => {
        if (!confirm('Are you sure you want to delete this test? This will soft-delete the test and archive it.')) return;
        deleteMutation.mutate(id, {
            onSuccess: () => toast.success('Test deleted successfully'),
            onError: () => toast.error('Failed to delete test')
        });
    };

    if (isCreating || editingTestId) {
        return (
            <div className="p-6 md:p-10 max-w-6xl mx-auto">
                <button onClick={() => { setIsCreating(false); setEditingTestId(null); }} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Tests
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{editingTestId ? 'Edit Test' : 'Create New Test'}</h1>
                <Card>
                    <CardContent className="pt-6">
                        <TestForm 
                            onSubmit={editingTestId ? handleUpdate : handleCreate} 
                            onCancel={() => { setIsCreating(false); setEditingTestId(null); }}
                            initialData={testToEdit}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Test Management</h1>
                    <p className="text-gray-500 mt-1.5">Create tests, assign them to students, and control the lifecycle.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Plus className="w-4 h-4" /> Create Test
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : tests?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium">No tests yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first test to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tests?.map((test: any) => {
                        const status = statusConfig[test.status] ?? statusConfig.DRAFT;
                        return (
                            <div key={test.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{test.subject?.name}</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{test.groupId ? `Group: ${test.group?.name || 'N/A'}` : `Section: ${test.section?.name || 'N/A'}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{test.duration} mins</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <span>{test._count?.Questions ?? 0} questions</span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {test.startTime && <span>{new Date(test.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
                                    {(test.status === 'DRAFT' || test.status === 'PUBLISHED') && (
                                        <Button size="sm" variant="outline" onClick={() => setEditingTestId(test.id)}>
                                            Edit Test
                                        </Button>
                                    )}
                                    {test.status === 'DRAFT' && (
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(test.id, 'PUBLISHED', 'Published')}>
                                            Publish
                                        </Button>
                                    )}
                                    {test.status === 'PUBLISHED' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(test.id, 'RUNNING', 'Started')}>
                                            Start Test Now
                                        </Button>
                                    )}
                                    {test.status === 'RUNNING' && (
                                        <Button size="sm" variant="destructive" onClick={() => handleEndTest(test.id)}>
                                            End Test
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => handleDeleteTest(test.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
