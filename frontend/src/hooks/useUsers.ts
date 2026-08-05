import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/users/students');
      return res.data.data;
    }
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post('/users/students', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/users/students/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
};

export const useBulkImportStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/users/students/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
};

export const useFaculty = () => {
  return useQuery({
    queryKey: ['faculty'],
    queryFn: async () => {
      const res = await api.get('/users/faculty');
      return res.data.data;
    }
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post('/users/faculty', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty'] })
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/users/faculty/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty'] })
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post('/users/reset-password', { userId });
      return res.data;
    }
  });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, accountStatus }: { id: string; accountStatus: string }) => {
        const res = await api.put(`/users/${id}/status`, { accountStatus });
        return res.data;
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
          queryClient.invalidateQueries({ queryKey: ['faculty'] });
      }
    });
  };

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/users/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['faculty'] });
        }
    });
};

export const useBulkDeleteStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            const res = await api.post('/users/students/bulk-delete', { userIds });
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
    });
};

export const useBulkPromoteStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            const res = await api.post('/users/students/bulk-promote', { userIds });
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
    });
};
