import { useState } from 'react';
import { useQuestions, useCreateQuestion, useDeleteQuestion, useQuestion, useUpdateQuestion } from '../../hooks/useQuestions';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { BookOpen, Plus, ArrowLeft, Trash2, Eye, Code2, Edit2 } from 'lucide-react';

const difficultyConfig: Record<string, { label: string; className: string }> = {
    EASY: { label: 'Easy', className: 'bg-green-100 text-green-700' },
    MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
    HARD: { label: 'Hard', className: 'bg-red-100 text-red-700' },
};

const QuestionForm = ({ onSubmit, onCancel, initialData }: any) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'EASY');
    const [testCases, setTestCases] = useState(initialData?.testCases || [{ input: '', expectedOutput: '', isHidden: false, marks: 10 }]);
    const [templates, setTemplates] = useState<Array<{ language: string; isTemplate: boolean; headerCode: string; bodyCode: string; footerCode: string }>>(() => {
        const defaultTemplates = [
            { language: 'c', isTemplate: false, headerCode: '', bodyCode: '', footerCode: '' },
            { language: 'cpp', isTemplate: false, headerCode: '', bodyCode: '', footerCode: '' },
            { language: 'java', isTemplate: false, headerCode: '', bodyCode: '', footerCode: '' },
            { language: 'python', isTemplate: false, headerCode: '', bodyCode: '', footerCode: '' },
            { language: 'javascript', isTemplate: false, headerCode: '', bodyCode: '', footerCode: '' },
        ];
        if (initialData?.templates) {
            return defaultTemplates.map(dt => {
                const existing = initialData.templates.find((t: any) => t.language === dt.language);
                return existing ? existing : dt;
            });
        }
        return defaultTemplates;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return toast.error('Title is required');
        if (!description.trim()) return toast.error('Problem statement is required');
        const activeTemplates = templates.filter(t => t.isTemplate || t.headerCode || t.bodyCode || t.footerCode);
        onSubmit({ title, description, difficulty, testCases, templates: activeTemplates });
    };

    const addTestCase = () => setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false, marks: 10 }]);
    const updateTestCase = (index: number, field: string, value: any) => {
        const newCases = [...testCases];
        newCases[index] = { ...newCases[index], [field]: value };
        setTestCases(newCases);
    };
    const removeTestCase = (index: number) => setTestCases(testCases.filter((_: any, i: number) => i !== index));

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Question Title</label>
                    <Input placeholder="e.g. Two Sum, Fibonacci Series..." value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                        className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                    >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Problem Statement</label>
                <textarea
                    className="flex min-h-[140px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="Describe the problem clearly. Include input/output format, constraints, and examples..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Test Cases</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{testCases.length} test case(s) defined</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                        <Plus className="w-4 h-4 mr-1" /> Add Test Case
                    </Button>
                </div>

                <div className="space-y-4">
                    {testCases.map((tc: any, index: number) => (
                        <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50 relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Test Case {index + 1}</span>
                                {testCases.length > 1 && (
                                    <button type="button" onClick={() => removeTestCase(index)} className="text-red-400 hover:text-red-600 text-xs font-medium">
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Input</label>
                                    <textarea
                                        className="w-full text-sm border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                                        rows={3}
                                        value={tc.input}
                                        onChange={e => updateTestCase(index, 'input', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Expected Output</label>
                                    <textarea
                                        className="w-full text-sm border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                                        rows={3}
                                        value={tc.expectedOutput}
                                        onChange={e => updateTestCase(index, 'expectedOutput', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-3">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(index, 'isHidden', e.target.checked)} className="rounded" />
                                    Hidden from students
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    Marks:
                                    <input type="number" className="border rounded-lg w-16 p-1 text-sm text-center focus:ring-2 focus:ring-blue-500" value={tc.marks} onChange={e => updateTestCase(index, 'marks', parseInt(e.target.value))} required min={1} />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-6">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Language Templates & Boilerplate</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Optional. Provide locked headers, editable body, and locked footers for specific languages.</p>
                </div>
                <div className="space-y-4">
                    {templates.map((tpl, idx) => (
                        <div key={tpl.language} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                            <label className="flex items-center gap-2 font-semibold text-gray-800 uppercase cursor-pointer mb-2">
                                <input 
                                    type="checkbox" 
                                    className="rounded" 
                                    checked={tpl.isTemplate} 
                                    onChange={e => {
                                        const newTpl = [...templates];
                                        newTpl[idx].isTemplate = e.target.checked;
                                        setTemplates(newTpl);
                                    }} 
                                />
                                Enable Template for {tpl.language}
                            </label>
                            
                            {tpl.isTemplate && (
                                <div className="grid grid-cols-1 gap-3 mt-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Locked Header (Invisible to student but prepended during execution)</label>
                                        <textarea 
                                            className="w-full text-xs font-mono border rounded p-2 bg-gray-50 focus:ring-1 focus:ring-blue-500" 
                                            rows={2} 
                                            placeholder="e.g. import java.util.*; class Solution {" 
                                            value={tpl.headerCode} 
                                            onChange={e => {
                                                const newTpl = [...templates];
                                                newTpl[idx].headerCode = e.target.value;
                                                setTemplates(newTpl);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Default Body (Editable by student, appears in editor)</label>
                                        <textarea 
                                            className="w-full text-xs font-mono border rounded p-2 bg-white focus:ring-1 focus:ring-blue-500" 
                                            rows={4} 
                                            placeholder="e.g. public static int solve(int a, int b) {\n    // Write your code here\n}" 
                                            value={tpl.bodyCode} 
                                            onChange={e => {
                                                const newTpl = [...templates];
                                                newTpl[idx].bodyCode = e.target.value;
                                                setTemplates(newTpl);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Locked Footer (Invisible to student but appended during execution)</label>
                                        <textarea 
                                            className="w-full text-xs font-mono border rounded p-2 bg-gray-50 focus:ring-1 focus:ring-blue-500" 
                                            rows={2} 
                                            placeholder="e.g. }" 
                                            value={tpl.footerCode} 
                                            onChange={e => {
                                                const newTpl = [...templates];
                                                newTpl[idx].footerCode = e.target.value;
                                                setTemplates(newTpl);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save Question</Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
};

const QuestionDetails = ({ id, onBack }: { id: string; onBack: () => void }) => {
    const { data: q, isLoading } = useQuestion(id);

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-sm animate-pulse">Loading question...</div>
        </div>
    );

    const diff = difficultyConfig[q?.difficulty ?? 'EASY'];

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Question Bank
            </button>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{q?.title}</h1>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${diff.className}`}>{diff.label}</span>
                        </div>
                        <p className="text-sm text-gray-400">Version v{q?.version}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-600 rounded-xl px-3 py-1.5 text-sm font-medium">
                        {q?.TestCases?.length ?? 0} Test Cases
                    </span>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="w-4 h-4 text-purple-600" /> Problem Statement</CardTitle></CardHeader>
                <CardContent>
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 leading-relaxed">{q?.description}</pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Test Cases ({q?.TestCases?.length ?? 0})</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {q?.TestCases?.map((tc: any) => (
                            <div key={tc.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                                        Input {tc.isHidden && <span className="text-amber-500 ml-1">(Hidden)</span>}
                                    </h4>
                                    <pre className="text-sm bg-white p-2 rounded-lg border border-gray-100 font-mono">{tc.input}</pre>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                                        Expected Output <span className="text-gray-300 ml-1">({tc.marks} marks)</span>
                                    </h4>
                                    <pre className="text-sm bg-white p-2 rounded-lg border border-gray-100 font-mono">{tc.expectedOutput}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const EditQuestion = ({ id, onCancel, onUpdate }: { id: string, onCancel: () => void, onUpdate: (data: any) => void }) => {
    const { data: q, isLoading } = useQuestion(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400 text-sm animate-pulse">Loading question details...</div>
            </div>
        );
    }

    // Format test cases and templates for editing
    const formattedQuestion = {
        ...q,
        testCases: q?.TestCases?.map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.visibility === 'HIDDEN',
            marks: tc.weightage
        })) || [],
        templates: q?.Languages?.map((l: any) => ({
            language: l.language.toLowerCase(),
            isTemplate: l.isTemplate,
            headerCode: l.headerCode || '',
            bodyCode: l.bodyCode || '',
            footerCode: l.footerCode || ''
        })) || []
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <button onClick={onCancel} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Question Bank
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Edit Question</h1>
            <Card>
                <CardContent className="pt-6">
                    <QuestionForm 
                        onSubmit={onUpdate} 
                        onCancel={onCancel} 
                        initialData={formattedQuestion}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export const QuestionBank = () => {
    const { data: questions, isLoading } = useQuestions();
    const createMutation = useCreateQuestion();
    const updateMutation = useUpdateQuestion();
    const deleteMutation = useDeleteQuestion();

    const [isCreating, setIsCreating] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [viewingQuestionId, setViewingQuestionId] = useState<string | null>(null);

    const handleCreate = (data: any) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast.success('Question created successfully');
                setIsCreating(false);
            },
            onError: () => toast.error('Failed to create question')
        });
    };

    const handleUpdate = (data: any) => {
        if (!editingQuestionId) return;
        updateMutation.mutate({ id: editingQuestionId, data }, {
            onSuccess: () => {
                toast.success('Question updated successfully');
                setEditingQuestionId(null);
            },
            onError: () => toast.error('Failed to update question')
        });
    };

    const handleDelete = (id: string, title: string) => {
        toast(`Delete "${title}"?`, {
            description: 'This action cannot be undone.',
            action: {
                label: 'Delete',
                onClick: () => deleteMutation.mutate(id, {
                    onSuccess: () => toast.success('Question deleted'),
                    onError: () => toast.error('Failed to delete question')
                })
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        });
    };

    if (isCreating) {
        return (
            <div className="p-6 md:p-10 max-w-4xl mx-auto">
                <button onClick={() => setIsCreating(false)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Question Bank
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Create New Question</h1>
                <Card>
                    <CardContent className="pt-6">
                        <QuestionForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (editingQuestionId) {
        return <EditQuestion id={editingQuestionId} onCancel={() => setEditingQuestionId(null)} onUpdate={handleUpdate} />;
    }

    if (viewingQuestionId) {
        return <QuestionDetails id={viewingQuestionId} onBack={() => setViewingQuestionId(null)} />;
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Question Bank</h1>
                    <p className="text-gray-500 mt-1.5">Manage coding problems, test cases, and difficulty levels.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
                    <Plus className="w-4 h-4" /> Create Question
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : questions?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium">No questions yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first question to build your question bank.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {questions?.map((q: any) => {
                        const diff = difficultyConfig[q.difficulty] ?? difficultyConfig.EASY;
                        return (
                            <div key={q.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{q.title}</h3>
                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${diff.className}`}>{diff.label}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{q.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{q._count?.testCases ?? 0} test cases · v{q.version}</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-50 p-3 flex gap-2 bg-gray-50/50">
                                    <Button size="sm" variant="outline" onClick={() => setViewingQuestionId(q.id)} className="flex-1 gap-1.5">
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </Button>
                                    <button
                                        onClick={() => setEditingQuestionId(q.id)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit question"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id, q.title)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete question"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
