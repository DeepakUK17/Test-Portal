import { useState } from 'react';
import { useGroups, useCreateGroup, useGroup, useAddStudentsToGroup, useRemoveStudentFromGroup } from '../../hooks/useGroups';
import { useDepartments } from '../../hooks/useAcademic';
import { useStudents } from '../../hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { Users, UserPlus, ArrowLeft, Trash2 } from 'lucide-react';

const GroupDetails = ({ groupId, onBack }: { groupId: string; onBack: () => void }) => {
    const { data: group, isLoading } = useGroup(groupId);
    const { data: students } = useStudents();
    const addMutation = useAddStudentsToGroup();
    const removeMutation = useRemoveStudentFromGroup();

    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-sm animate-pulse">Loading group details...</div>
        </div>
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) return;
        addMutation.mutate({ groupId, studentIds: selectedStudentIds }, {
            onSuccess: () => {
                toast.success(`${selectedStudentIds.length} student(s) added to group`);
                setSelectedStudentIds([]);
                setSearchQuery('');
            },
            onError: () => toast.error('Failed to add students')
        });
    };

    const handleRemove = (studentId: string, name: string) => {
        toast(`Remove ${name} from this group?`, {
            action: {
                label: 'Remove',
                onClick: () => removeMutation.mutate(
                    { groupId, studentId },
                    {
                        onSuccess: () => toast.success(`${name} removed from group`),
                        onError: () => toast.error('Failed to remove student')
                    }
                )
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        });
    };

    // Members from backend have studentId (Student table PK)
    const memberIds = group?.Members?.map((m: any) => m.studentId) ?? [];
    // availableStudents compares Student.id (not user.id)
    const availableStudents = students?.filter((s: any) => s.Student && !memberIds.includes(s.Student.id)) || [];
    
    const filteredStudents = availableStudents.filter((s: any) => 
        s.Student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.Student?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filteredStudents.map((s: any) => s.Student.id));
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </button>

            {/* Group Header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-xl p-3">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{group?.groupName}</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Department: <span className="font-medium text-gray-700">{group?.department?.name || 'Not specified'}</span>
                            {group?.description && <span className="ml-3 text-gray-400">· {group?.description}</span>}
                        </p>
                    </div>
                    <div className="ml-auto bg-blue-50 text-blue-700 font-bold rounded-xl px-4 py-2 text-lg">
                        {group?.Members?.length ?? 0}
                        <span className="text-xs font-medium ml-1">members</span>
                    </div>
                </div>
            </div>

            {/* Add Student */}
            <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" /> Add Students to Group
                    </CardTitle>
                    <CardDescription>Select one or more students to add to this group</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="flex flex-col gap-4">
                        <Input 
                            placeholder="Search students by name or roll number..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        {availableStudents?.length > 0 && (
                            <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-medium text-gray-700">{selectedStudentIds.length} selected</span>
                                <button type="button" onClick={handleSelectAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    {selectedStudentIds.length === filteredStudents?.length && filteredStudents?.length > 0 ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                        )}

                        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-white p-2 divide-y divide-gray-100">
                            {filteredStudents?.map((s: any) => (
                                <label key={s.Student.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        checked={selectedStudentIds.includes(s.Student.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedStudentIds(prev => [...prev, s.Student.id]);
                                            } else {
                                                setSelectedStudentIds(prev => prev.filter(id => id !== s.Student.id));
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{s.Student?.fullName}</span>
                                        <span className="text-xs text-gray-500">{s.Student?.rollNumber}</span>
                                    </div>
                                </label>
                            ))}
                            {availableStudents?.length === 0 && (
                                <p className="text-sm text-gray-400 p-4 text-center">All students are already in this group.</p>
                            )}
                            {availableStudents?.length > 0 && filteredStudents?.length === 0 && (
                                <p className="text-sm text-gray-400 p-4 text-center">No students match your search.</p>
                            )}
                        </div>
                        <Button type="submit" disabled={addMutation.isPending || selectedStudentIds.length === 0} className="bg-blue-600 hover:bg-blue-700">
                            {addMutation.isPending ? 'Adding...' : `Add Selected Students (${selectedStudentIds.length})`}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Group Members ({group?.Members?.length ?? 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {(group?.Members?.length ?? 0) === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No students in this group yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {group?.Members?.map((member: any) => (
                                <div key={member.studentId} className="py-3 flex justify-between items-center group/row">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{member.student?.fullName || member.student?.user?.email}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{member.student?.rollNumber} · {member.student?.department?.code}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(member.studentId, member.student?.fullName || 'Student')}
                                        className="opacity-0 group-hover/row:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all"
                                        title="Remove from group"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export const GroupManagement = () => {
    const { data: groups, isLoading } = useGroups();
    const { data: departments } = useDepartments();
    const createMutation = useCreateGroup();

    const [name, setName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [description, setDescription] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, departmentId, description }, {
            onSuccess: () => {
                toast.success('Group created successfully');
                setName('');
                setDepartmentId('');
                setDescription('');
            },
            onError: () => toast.error('Failed to create group')
        });
    };

    if (selectedGroupId) {
        return <GroupDetails groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />;
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Groups</h1>
                <p className="text-gray-500 mt-1.5">Create and manage targeted student groups for assessments.</p>
            </div>

            {/* Create Group Form */}
            <Card className="border-t-4 border-t-blue-500 shadow-sm">
                <CardHeader>
                    <CardTitle>Create New Group</CardTitle>
                    <CardDescription>Groups allow you to assign tests to specific sets of students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Group Name</label>
                            <Input placeholder="e.g. Remedial Batch, Advanced Section" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={departmentId}
                                onChange={e => setDepartmentId(e.target.value)}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments?.map((d: any) => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                            <Input placeholder="e.g. Students needing extra practice" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Group'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Groups Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : groups?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Users className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium">No groups yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first student group above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groups?.map((group: any) => (
                        <button
                            key={group.id}
                            onClick={() => setSelectedGroupId(group.id)}
                            className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="bg-blue-50 rounded-xl p-2.5 group-hover:scale-105 transition-transform">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                                    {group._count?.Members ?? 0} members
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-1">{group.groupName}</h3>
                            <p className="text-sm text-gray-500">{group.department?.name}</p>
                            {group.description && (
                                <p className="text-xs text-gray-400 mt-2 line-clamp-1">{group.description}</p>
                            )}
                            <div className="mt-4 text-xs font-medium text-blue-600 group-hover:underline">
                                View details →
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
