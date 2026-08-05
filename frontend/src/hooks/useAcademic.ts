import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// --- Types ---
export interface Department {
  id: string;
  name: string;
  code: string;
  _count?: { students: number; faculty: number; sections: number; subjects: number };
}

export interface StudyYear {
  id: string;
  yearNumber: number;
}

export interface Semester {
  id: string;
  number: number;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
  studyYearId: string;
  semesterId: string;
  department?: Department;
  studyYear?: StudyYear;
  semester?: Semester;
  _count?: { Students: number };
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  departmentId: string;
  semesterId: string;
  department?: Department;
  semester?: Semester;
}

// --- Hooks ---

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/academic/departments');
      return res.data.data as Department[];
    }
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code: string }) => {
      await api.post('/academic/departments', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/academic/departments/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  });
};

export const useStudyYears = () => {
  return useQuery({
    queryKey: ['study-years'],
    queryFn: async () => {
      const res = await api.get('/academic/study-years');
      return res.data.data as StudyYear[];
    }
  });
};

export const useCreateStudyYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { yearNumber: number }) => {
      // Backend validator expects 'year', but DB field is 'yearNumber'
      await api.post('/academic/study-years', { year: data.yearNumber });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-years'] })
  });
};

export const useSemesters = () => {
  return useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await api.get('/academic/semesters');
      return res.data.data as Semester[];
    }
  });
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { number: number }) => {
      await api.post('/academic/semesters', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['semesters'] })
  });
};

export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const res = await api.get('/academic/sections');
      return res.data.data as Section[];
    }
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; departmentId: string; studyYearId: string; semesterId: string }) => {
      await api.post('/academic/sections', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/academic/sections/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });
};

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await api.get('/academic/subjects');
      return res.data.data as Subject[];
    }
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { code: string; name: string; credits: number; departmentId: string; semesterId: string }) => {
      await api.post('/academic/subjects', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] })
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/academic/subjects/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] })
  });
};
