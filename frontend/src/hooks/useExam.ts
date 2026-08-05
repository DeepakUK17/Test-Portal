import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
type Language = 'c' | 'cpp' | 'java' | 'python';

export const useMyTests = () => {
  return useQuery({
    queryKey: ['my-tests'],
    queryFn: async () => {
      const res = await api.get('/exam/my-tests');
      return res.data.data;
    }
  });
};

export const useStartTest = () => {
  return useMutation({
    mutationFn: async (testId: string) => {
      const res = await api.post(`/exam/${testId}/start`);
      return res.data.data;
    }
  });
};

export const useTestQuestions = (attemptId: string) => {
  return useQuery({
    queryKey: ['exam-questions', attemptId],
    queryFn: async () => {
      const res = await api.get(`/exam/attempts/${attemptId}/questions`);
      return res.data.data;
    },
    enabled: !!attemptId,
    refetchOnWindowFocus: false, // Don't refetch on focus during exam
  });
};

export const useSaveCode = () => {
  return useMutation({
    mutationFn: async ({ attemptId, questionId, code, language }: { attemptId: string; questionId: string; code: string; language: string }) => {
      await api.put(`/exam/attempts/${attemptId}/questions/${questionId}/save`, { code, language });
    }
  });
};

export const useRunCode = () => {
  return useMutation({
    mutationFn: async ({ attemptId, questionId, code, language, customInput }: { attemptId: string; questionId: string; code: string; language: Language; customInput?: string }) => {
      const res = await api.post(`/exam/attempts/${attemptId}/questions/${questionId}/run`, { code, language, customInput });
      return res.data.data;
    }
  });
};

export const useSubmitCode = () => {
  return useMutation({
    mutationFn: async ({ attemptId, questionId, code, language }: { attemptId: string; questionId: string; code: string; language: Language }) => {
      const res = await api.post(`/exam/attempts/${attemptId}/questions/${questionId}/submit`, { code, language });
      return res.data.data;
    }
  });
};

export const useSubmitTest = () => {
  return useMutation({
    mutationFn: async (attemptId: string) => {
      await api.post(`/exam/attempts/${attemptId}/submit`);
    }
  });
};

export const useLogWarning = () => {
  return useMutation({
    mutationFn: async ({ attemptId, type }: { attemptId: string; type: string }) => {
      const res = await api.post(`/exam/attempts/${attemptId}/warning`, { type });
      return res.data;
    }
  });
};
