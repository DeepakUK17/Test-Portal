import { z } from 'zod';

export const createStudentSchema = z.object({
    body: z.object({
        email: z.string().email().endsWith('@kahedu.edu.in'),
        rollNumber: z.string().min(1),
        name: z.string().min(1),
        departmentId: z.string().uuid(),
        studyYearId: z.string().uuid(),
        semesterId: z.string().uuid(),
        sectionId: z.string().uuid().optional(),
    }),
});

export const createFacultySchema = z.object({
    body: z.object({
        email: z.string().email().endsWith('@kahedu.edu.in'),
        employeeId: z.string().min(1),
        name: z.string().min(1),
        departmentId: z.string().uuid(),
    }),
});

export const updateStudentSchema = z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
        email: z.string().email().endsWith('@kahedu.edu.in').optional(),
        rollNumber: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        departmentId: z.string().uuid().optional(),
        studyYearId: z.string().uuid().optional(),
        semesterId: z.string().uuid().optional(),
        sectionId: z.string().uuid().optional(),
    }),
});

export const bulkActionSchema = z.object({
    body: z.object({
        userIds: z.array(z.string().uuid()).min(1, "At least one user must be selected")
    })
});

export const updateFacultySchema = z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
        email: z.string().email().endsWith('@kahedu.edu.in').optional(),
        employeeId: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        departmentId: z.string().uuid().optional(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        userId: z.string().uuid(),
    }),
});

export const updateUserStatusSchema = z.object({
    body: z.object({
        accountStatus: z.enum(['ACTIVE', 'LOCKED', 'SUSPENDED']),
    }),
    params: z.object({ id: z.string().uuid() }),
});
