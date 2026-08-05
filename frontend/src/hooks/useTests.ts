import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useTests = (status?: string) => {
  return useQuery({
    queryKey: ['tests', status],
    queryFn: async () => {
      const url = status ? `/tests?status=${status}` : '/tests';
      const res = await api.get(url);
      return res.data.data;
    }
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: ['tests', id],
    queryFn: async () => {
      const res = await api.get(`/tests/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post('/tests', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] })
  });
};

export const useUpdateTestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/tests/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        queryClient.invalidateQueries({ queryKey: ['tests', variables.id] });
    }
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/tests/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        queryClient.invalidateQueries({ queryKey: ['tests', variables.id] });
    }
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tests/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] })
  });
};
