import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CalendarDays, Layers, Users, BookOpen, Trash2 } from 'lucide-react';
import { 
  useDepartments, useCreateDepartment, useDeleteDepartment,
  useStudyYears, useCreateStudyYear, 
  useSemesters, useCreateSemester, 
  useSections, useCreateSection, useDeleteSection,
  useSubjects, useCreateSubject, useDeleteSubject 
} from '../../hooks/useAcademic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

const DepartmentsTab = () => {
  const { data: departments, isLoading } = useDepartments();
  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, code }, {
      onSuccess: () => { 
        toast.success('Department added successfully');
        setName(''); setCode(''); 
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add department')
    });
  };

  const handleDelete = (id: string, name: string) => {
    toast(`Delete "${name}" department?`, {
      description: 'This will fail if there are existing students or faculty in this department.',
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(id, {
          onSuccess: () => toast.success('Department deleted'),
          onError: () => toast.error('Cannot delete: department has existing members.')
        })
      },
      cancel: { label: 'Cancel', onClick: () => {} }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading departments...</div>;

  return (
    <div className="space-y-8">
      <Card className="border-t-4 border-t-blue-600 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add New Department</CardTitle>
          <CardDescription>Create a new department in the institution.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Department Name</label>
              <Input placeholder="e.g. Computer Science and Engineering" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="w-full sm:w-48 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Short Code</label>
              <Input placeholder="e.g. CSE" value={code} onChange={e => setCode(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>Add Department</Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.map(dept => (
          <Card key={dept.id} className="relative group hover:shadow-md transition-shadow border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-900">{dept.name}</CardTitle>
                  <CardDescription className="font-semibold text-blue-600 mt-1">{dept.code}</CardDescription>
                </div>
                <button onClick={() => handleDelete(dept.id, dept.name)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1" title="Delete Department">
                  <Trash2 size={18} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{dept._count?.students || 0}</span>
                  <span className="text-xs">Students</span>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{dept._count?.faculty || 0}</span>
                  <span className="text-xs">Faculty</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const StudyYearsTab = () => {
  const { data: studyYears, isLoading } = useStudyYears();
  const createMutation = useCreateStudyYear();
  const [year, setYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ yearNumber: parseInt(year) }, {
      onSuccess: () => { toast.success('Study Year added'); setYear(''); },
      onError: () => toast.error('Failed to add study year')
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8">
      <Card className="border-t-4 border-t-indigo-500 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add Study Year</CardTitle>
          <CardDescription>Add an academic study year (1st Year, 2nd Year, etc).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-64 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Year Number (1-5)</label>
              <Input type="number" placeholder="e.g. 1" value={year} onChange={e => setYear(e.target.value)} min={1} max={5} required />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700" disabled={createMutation.isPending}>Add Year</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {studyYears?.map(sy => (
          <div key={sy.id} className="bg-white border border-indigo-100 shadow-sm rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <span className="block text-3xl font-bold text-indigo-600 mb-1">{sy.yearNumber}</span>
            <span className="text-sm font-medium text-gray-600">Year</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SemestersTab = () => {
  const { data: semesters, isLoading } = useSemesters();
  const createMutation = useCreateSemester();
  const [number, setNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ number: parseInt(number) }, {
      onSuccess: () => { toast.success('Semester added'); setNumber(''); },
      onError: () => toast.error('Failed to add semester')
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8">
      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add Semester</CardTitle>
          <CardDescription>Add an academic semester.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-64 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Semester Number (1-10)</label>
              <Input type="number" placeholder="e.g. 1" value={number} onChange={e => setNumber(e.target.value)} min={1} max={10} required />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700" disabled={createMutation.isPending}>Add Semester</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {semesters?.map(sem => (
          <div key={sem.id} className="bg-white border border-emerald-100 shadow-sm rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <span className="block text-3xl font-bold text-emerald-600 mb-1">{sem.number}</span>
            <span className="text-sm font-medium text-gray-600">Semester</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionsTab = () => {
  const { data: sections, isLoading } = useSections();
  const { data: departments } = useDepartments();
  const { data: studyYears } = useStudyYears();
  const { data: semesters } = useSemesters();
  
  const createMutation = useCreateSection();
  const deleteMutation = useDeleteSection();
  
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [studyYearId, setStudyYearId] = useState('');
  const [semesterId, setSemesterId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, departmentId, studyYearId, semesterId }, {
      onSuccess: () => { toast.success('Section added'); setName(''); },
      onError: () => toast.error('Failed to add section')
    });
  };

  const handleDelete = (id: string, name: string) => {
    toast(`Delete Section ${name}?`, {
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(id, {
          onSuccess: () => toast.success('Section deleted'),
          onError: () => toast.error('Failed to delete section')
        })
      },
      cancel: { label: 'Cancel', onClick: () => {} }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading sections...</div>;

  return (
    <div className="space-y-8">
      <Card className="border-t-4 border-t-amber-500 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Add Class Section</CardTitle>
          <CardDescription>Create a specific class batch or section (e.g., Section A).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Section Name</label>
              <Input placeholder="e.g. A, B, or Batch 1" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
                <option value="">Select Department</option>
                {departments?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Study Year</label>
              <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={studyYearId} onChange={e => setStudyYearId(e.target.value)} required>
                <option value="">Select Study Year</option>
                {studyYears?.map(y => <option key={y.id} value={y.id}>Year {y.yearNumber}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Semester</label>
              <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={semesterId} onChange={e => setSemesterId(e.target.value)} required>
                <option value="">Select Semester</option>
                {semesters?.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700" disabled={createMutation.isPending}>Create Section</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
        ) : sections?.map(sec => (
          <Card key={sec.id} className="relative group hover:shadow-md transition-shadow border-l-4 border-l-amber-400">
            <CardHeader className="pb-3 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">Section {sec.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 space-y-0.5">
                    <p>{sec.department?.code || 'Unknown Dept'} • Year {sec.studyYear?.yearNumber || '?'}</p>
                    <p>Sem {sec.semester?.number || '?'} • {sec._count?.Students ?? 0} students</p>
                  </CardDescription>
                </div>
                <button onClick={() => handleDelete(sec.id, sec.name)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SubjectsTab = () => {
    const { data: subjects, isLoading } = useSubjects();
    const { data: departments } = useDepartments();
    const { data: semesters } = useSemesters();
    
    const createMutation = useCreateSubject();
    const deleteMutation = useDeleteSubject();
    
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [credits, setCredits] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [semesterId, setSemesterId] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createMutation.mutate({ code, name, credits: parseInt(credits), departmentId, semesterId }, {
        onSuccess: () => { 
          toast.success('Subject added');
          setCode(''); setName(''); setCredits(''); 
        },
        onError: () => toast.error('Failed to add subject')
      });
    };

    const handleDelete = (id: string, code: string) => {
      toast(`Delete subject "${code}"?`, {
        action: {
          label: 'Delete',
          onClick: () => deleteMutation.mutate(id, {
            onSuccess: () => toast.success('Subject deleted'),
            onError: () => toast.error('Failed to delete subject')
          })
        },
        cancel: { label: 'Cancel', onClick: () => {} }
      });
    };
  
    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading subjects...</div>;
  
    return (
      <div className="space-y-8">
        <Card className="border-t-4 border-t-purple-600 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Add Academic Subject</CardTitle>
            <CardDescription>Register a new course/subject into the academic curriculum.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Subject Code</label>
                <Input placeholder="e.g. CS101" value={code} onChange={e => setCode(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Subject Name</label>
                <Input placeholder="e.g. Data Structures" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Credits</label>
                <Input type="number" placeholder="e.g. 3" value={credits} onChange={e => setCredits(e.target.value)} required min={1} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
                  <option value="">Select Department</option>
                  {departments?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
  
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Semester</label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={semesterId} onChange={e => setSemesterId(e.target.value)} required>
                  <option value="">Select Semester</option>
                  {semesters?.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
                </select>
              </div>
  
              <div className="md:col-span-2 pt-2">
                <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700" disabled={createMutation.isPending}>Add Subject</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {subjects?.map(sub => (
            <Card key={sub.id} className="relative group hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => handleDelete(sub.id, sub.code)} className="bg-white p-1.5 rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-gray-100">
                  <Trash2 size={14} />
                </button>
              </div>
              <CardHeader className="pb-2 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    {sub.code}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">{sub.credits} Credits</span>
                </div>
                <CardTitle className="text-base leading-tight mt-3">{sub.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="bg-gray-100 px-2 py-1 rounded">{sub.department?.code}</span>
                  <span>•</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Semester {sub.semester?.number}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

export const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'studyYears' | 'semesters' | 'sections' | 'subjects'>('departments');
  const navigate = useNavigate();

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'studyYears', label: 'Study Years', icon: CalendarDays },
    { id: 'semesters', label: 'Semesters', icon: Layers },
    { id: 'sections', label: 'Sections', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-6 pl-0 text-gray-500 hover:text-gray-900 hover:bg-transparent">
        &larr; Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academic Structure</h1>
            <p className="text-gray-500 mt-2">Manage the institution's core academic hierarchy and subjects.</p>
        </div>
      </div>

      <div className="flex space-x-1 rounded-xl bg-white p-1.5 mb-8 w-full overflow-x-auto shadow-sm border border-gray-100">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all
              ${activeTab === id 
                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <Icon size={16} className={activeTab === id ? 'text-blue-600' : 'text-gray-400'} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'studyYears' && <StudyYearsTab />}
        {activeTab === 'semesters' && <SemestersTab />}
        {activeTab === 'sections' && <SectionsTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
      </div>

      <div className="mt-12 text-center pb-8">
        <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">
            Developed by Deepak UK (24BTAD013)
        </a>
      </div>
    </div>
  );
};
