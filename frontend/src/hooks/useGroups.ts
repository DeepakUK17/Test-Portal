import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data.data;
    }
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; departmentId: string, description?: string }) => {
      await api.post('/groups', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] })
  });
};

export const useAddStudentsToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, studentIds }: { groupId: string; studentIds: string[] }) => {
      await api.post(`/groups/${groupId}/members`, { studentIds });
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    }
  });
};

export const useRemoveStudentFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, studentId }: { groupId: string; studentId: string }) => {
      await api.delete(`/groups/${groupId}/members/${studentId}`);
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    }
  });
};
