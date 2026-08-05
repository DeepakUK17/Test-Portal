import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents, useFaculty, useBulkImportStudents, useResetPassword, useUpdateUserStatus, useCreateStudent, useCreateFaculty, useUpdateStudent, useUpdateFaculty, useDeleteUser, useBulkDeleteStudents, useBulkPromoteStudents } from '../../hooks/useUsers';
import { useDepartments, useStudyYears, useSemesters, useSections } from '../../hooks/useAcademic';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const StudentsTab = () => {
    const { data: students, isLoading } = useStudents();
    const bulkImportMutation = useBulkImportStudents();
    const resetPasswordMutation = useResetPassword();
    const updateStatusMutation = useUpdateUserStatus();

    const createStudentMutation = useCreateStudent();
    const updateStudentMutation = useUpdateStudent();
    const deleteUserMutation = useDeleteUser();
    const bulkDeleteMutation = useBulkDeleteStudents();
    const bulkPromoteMutation = useBulkPromoteStudents();
    
    const { data: departments } = useDepartments();
    const { data: studyYears } = useStudyYears();
    const { data: semesters } = useSemesters();
    const { data: sections } = useSections();

    const [formMode, setFormMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const [filterDept, setFilterDept] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '', email: '', rollNumber: '', departmentId: '', studyYearId: '', semesterId: '', sectionId: ''
    });

    const resetForm = () => {
        setFormMode('NONE');
        setEditingUserId(null);
        setFormData({ name: '', email: '', rollNumber: '', departmentId: '', studyYearId: '', semesterId: '', sectionId: '' });
    };

    const handleEditClick = (user: any) => {
        setFormData({
            name: user.Student?.fullName || '',
            email: user.email,
            rollNumber: user.Student?.rollNumber || '',
            departmentId: user.Student?.departmentId || '',
            studyYearId: user.Student?.studyYearId || '',
            semesterId: user.Student?.semesterId || '',
            sectionId: user.Student?.sectionId || ''
        });
        setEditingUserId(user.id);
        setFormMode('EDIT');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            bulkImportMutation.mutate(e.target.files[0], {
                onSuccess: (res) => toast.success(`Successfully imported ${res.data.successCount} students. Errors: ${res.data.errors.length}`)
            });
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload: any = { ...formData };
        if (!payload.sectionId) delete payload.sectionId;

        if (formMode === 'ADD') {
            createStudentMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success('Student added successfully!');
                    resetForm();
                },
                onError: (err: any) => {
                    const data = err.response?.data;
                    if (data?.errors) {
                        toast.error(`Validation Failed:\n${data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n')}`);
                    } else {
                        toast.error(data?.message || 'Error adding student');
                    }
                }
            });
        } else if (formMode === 'EDIT' && editingUserId) {
            updateStudentMutation.mutate({ id: editingUserId, data: payload }, {
                onSuccess: () => {
                    toast.success('Student updated successfully!');
                    resetForm();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || 'Error updating student')
            });
        }
    };

    const filteredStudents = students?.filter((s: any) => {
        if (filterDept && s.Student?.departmentId !== filterDept) return false;
        if (filterYear && s.Student?.studyYearId !== filterYear) return false;
        return true;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked && filteredStudents) {
            setSelectedIds(filteredStudents.map((s: any) => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        toast(`Delete ${selectedIds.length} student(s)?`, {
            description: 'This cannot be undone.',
            action: {
                label: 'Delete All',
                onClick: () => bulkDeleteMutation.mutate(selectedIds, {
                    onSuccess: (res: any) => { toast.success(res.message || 'Students deleted'); setSelectedIds([]); },
                    onError: () => toast.error('Failed to delete students')
                })
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        });
    };

    const handleBulkPromote = () => {
        if (selectedIds.length === 0) return;
        toast(`Promote ${selectedIds.length} student(s) to next year?`, {
            description: 'Their Study Year will be updated automatically.',
            action: {
                label: 'Promote',
                onClick: () => bulkPromoteMutation.mutate(selectedIds, {
                    onSuccess: (res: any) => { toast.success(res.message || 'Students promoted'); setSelectedIds([]); },
                    onError: () => toast.error('Failed to promote students')
                })
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        });
    };

    if (isLoading) return <div className="text-gray-500">Loading students...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Import Students (CSV)</CardTitle>
                        <CardDescription>Format: email, name, rollNumber, departmentCode, year, semester, section</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input type="file" accept=".csv" onChange={handleFileUpload} disabled={bulkImportMutation.isPending} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {bulkImportMutation.isPending && <span className="ml-4 text-sm text-gray-500">Importing...</span>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add Single Student</CardTitle>
                        <CardDescription>Manually create a new student account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setFormMode(formMode === 'ADD' ? 'NONE' : 'ADD')} variant="outline">
                            {formMode === 'ADD' ? 'Cancel' : 'Add Student Manually'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {formMode !== 'NONE' && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{formMode === 'ADD' ? 'New Student Details' : 'Edit Student Details'}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={resetForm}>Close</Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required placeholder="Full Name" className="p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            <input required type="email" placeholder="Email (@kahedu.edu.in)" className="p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input required placeholder="Roll Number" className="p-2 border rounded" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                            <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
                                <option value="">Select Department</option>
                                {departments?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                            </select>
                            
                            <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.studyYearId} onChange={e => setFormData({...formData, studyYearId: e.target.value})}>
                                <option value="">Select Study Year</option>
                                {studyYears?.map(y => <option key={y.id} value={y.id}>Year {y.yearNumber}</option>)}
                            </select>

                            <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.semesterId} onChange={e => setFormData({...formData, semesterId: e.target.value})}>
                                <option value="">Select Semester</option>
                                {semesters?.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
                            </select>

                            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})}>
                                <option value="">Select Section (Optional)</option>
                                {sections?.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                            </select>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                                    {createStudentMutation.isPending || updateStudentMutation.isPending ? 'Saving...' : 'Save Student'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="bg-white rounded-md border p-4 mb-4 flex flex-col sm:flex-row gap-4 items-end justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 font-medium">Filter Department</label>
                        <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500" value={filterDept} onChange={e => { setFilterDept(e.target.value); setSelectedIds([]); }}>
                            <option value="">All Departments</option>
                            {departments?.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 font-medium">Filter Year</label>
                        <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500" value={filterYear} onChange={e => { setFilterYear(e.target.value); setSelectedIds([]); }}>
                            <option value="">All Years</option>
                            {studyYears?.map(y => <option key={y.id} value={y.id}>Year {y.yearNumber}</option>)}
                        </select>
                    </div>
                </div>
                {selectedIds.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkPromote} disabled={bulkPromoteMutation.isPending}>
                            Promote Selected ({selectedIds.length})
                        </Button>
                        <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
                            Delete Selected ({selectedIds.length})
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-md border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3"><input type="checkbox" onChange={handleSelectAll} checked={filteredStudents?.length > 0 && selectedIds.length === filteredStudents.length} /></th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Roll No</th>
                            <th className="px-4 py-3 font-medium">Class</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredStudents?.map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelectRow(user.id)} /></td>
                                <td className="px-4 py-3">{user.Student?.fullName}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.Student?.rollNumber}</td>
                                <td className="px-4 py-3">{user.Student?.department?.code} {user.Student?.section?.name ? `- ${user.Student?.section?.name}` : ''}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.accountStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3 space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditClick(user)}>Edit</Button>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        toast('Reset password for this user?', {
                                            action: { label: 'Reset', onClick: () => resetPasswordMutation.mutate(user.id) },
                                            cancel: { label: 'Cancel', onClick: () => {} }
                                        });
                                    }}>Reset PW</Button>
                                    
                                    {user.accountStatus === 'ACTIVE' ? (
                                        <Button size="sm" variant="destructive" onClick={() => {
                                            toast('Suspend this user?', {
                                                action: { label: 'Suspend', onClick: () => updateStatusMutation.mutate({ id: user.id, accountStatus: 'SUSPENDED' }) },
                                                cancel: { label: 'Cancel', onClick: () => {} }
                                            });
                                        }}>Suspend</Button>
                                    ) : (
                                        <Button size="sm" variant="default" onClick={() => updateStatusMutation.mutate({ id: user.id, accountStatus: 'ACTIVE' })}>Activate</Button>
                                    )}
                                    <Button size="sm" variant="destructive" onClick={() => {
                                        toast('Delete this user? This cannot be undone.', {
                                            action: { label: 'Delete', onClick: () => deleteUserMutation.mutate(user.id) },
                                            cancel: { label: 'Cancel', onClick: () => {} }
                                        });
                                    }}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FacultyTab = () => {
    const { data: faculty, isLoading } = useFaculty();
    const { data: departments } = useDepartments();
    const resetPasswordMutation = useResetPassword();
    const createFacultyMutation = useCreateFaculty();
    const updateFacultyMutation = useUpdateFaculty();
    const deleteUserMutation = useDeleteUser();
    
    const [formMode, setFormMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', employeeId: '', departmentId: '' });

    const resetForm = () => {
        setFormMode('NONE');
        setEditingUserId(null);
        setFormData({ name: '', email: '', employeeId: '', departmentId: '' });
    };

    const handleEditClick = (user: any) => {
        setFormData({
            name: user.Faculty?.name || '',
            email: user.email,
            employeeId: user.Faculty?.facultyCode || '',
            departmentId: user.Faculty?.departmentId || ''
        });
        setEditingUserId(user.id);
        setFormMode('EDIT');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formMode === 'ADD') {
            createFacultyMutation.mutate(formData, {
                onSuccess: () => {
                    toast.success('Faculty added successfully!');
                    resetForm();
                },
                onError: (err: any) => {
                    const data = err.response?.data;
                    if (data?.errors) {
                        toast.error(`Validation Failed:\n${data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n')}`);
                    } else {
                        toast.error(data?.message || 'Error adding faculty');
                    }
                }
            });
        } else if (formMode === 'EDIT' && editingUserId) {
            updateFacultyMutation.mutate({ id: editingUserId, data: formData }, {
                onSuccess: () => {
                    toast.success('Faculty updated successfully!');
                    resetForm();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || 'Error updating faculty')
            });
        }
    };

    if (isLoading) return <div className="text-gray-500">Loading faculty...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Single Faculty</CardTitle>
                    <CardDescription>Manually create a new faculty account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setFormMode(formMode === 'ADD' ? 'NONE' : 'ADD')} variant="outline">
                        {formMode === 'ADD' ? 'Cancel' : 'Add Faculty Manually'}
                    </Button>
                </CardContent>
            </Card>

            {formMode !== 'NONE' && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{formMode === 'ADD' ? 'New Faculty Details' : 'Edit Faculty Details'}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={resetForm}>Close</Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required placeholder="Full Name" className="p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            <input required type="email" placeholder="Email (@kahedu.edu.in)" className="p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input required placeholder="Employee ID" className="p-2 border rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                            <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
                                <option value="">Select Department</option>
                                {departments?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                            </select>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={createFacultyMutation.isPending || updateFacultyMutation.isPending}>
                                    {createFacultyMutation.isPending || updateFacultyMutation.isPending ? 'Saving...' : 'Save Faculty'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="bg-white rounded-md border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Emp ID</th>
                            <th className="px-4 py-3 font-medium">Department</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {faculty?.map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{user.Faculty?.name}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.Faculty?.facultyCode}</td>
                                <td className="px-4 py-3">{user.Faculty?.department?.code}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.accountStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3 space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditClick(user)}>Edit</Button>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        toast('Reset password for this faculty?', {
                                            action: { label: 'Reset', onClick: () => resetPasswordMutation.mutate(user.id) },
                                            cancel: { label: 'Cancel', onClick: () => {} }
                                        });
                                    }}>Reset PW</Button>
                                    <Button size="sm" variant="destructive" onClick={() => {
                                        toast('Delete this faculty? This cannot be undone.', {
                                            action: { label: 'Delete', onClick: () => deleteUserMutation.mutate(user.id) },
                                            cancel: { label: 'Cancel', onClick: () => {} }
                                        });
                                    }}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const UserManagement = () => {
    const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-4 pl-0 text-blue-600 hover:text-blue-800 hover:bg-transparent">
                &larr; Back to Dashboard
            </Button>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-2">Manage students, faculty, bulk imports, and account statuses.</p>
                </div>
            </div>

            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8 w-fit">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`w-32 rounded-lg py-2.5 text-sm font-medium leading-5 ${activeTab === 'students' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'}`}
                >
                    Students
                </button>
                <button
                    onClick={() => setActiveTab('faculty')}
                    className={`w-32 rounded-lg py-2.5 text-sm font-medium leading-5 ${activeTab === 'faculty' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'}`}
                >
                    Faculty
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'students' && <StudentsTab />}
                {activeTab === 'faculty' && <FacultyTab />}
            </div>
            
            <div className="mt-12 text-center pb-8">
                <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">
                    Developed by Deepak UK (24BTAD013)
                </a>
            </div>
        </div>
    );
};
