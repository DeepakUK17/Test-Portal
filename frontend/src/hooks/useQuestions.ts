import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useQuestions = () => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const res = await api.get('/questions');
      return res.data.data;
    }
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const res = await api.get(`/questions/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post('/questions', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] })
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await api.put(`/questions/${id}`, data);
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['questions'] });
        queryClient.invalidateQueries({ queryKey: ['questions', variables.id] });
    }
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/questions/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] })
  });
};
