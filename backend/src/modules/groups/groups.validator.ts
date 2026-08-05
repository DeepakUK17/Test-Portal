import { z } from 'zod';

export const createGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Group name is required'),
        departmentId: z.string().uuid().optional(),
        description: z.string().optional(),
    }),
});

export const addStudentsToGroupSchema = z.object({
    body: z.object({
        studentIds: z.array(z.string().uuid()).min(1, 'At least one student ID is required'),
    }),
    params: z.object({
        id: z.string().uuid(),
    })
});

export const removeStudentFromGroupSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
        studentId: z.string().uuid(),
    })
});
