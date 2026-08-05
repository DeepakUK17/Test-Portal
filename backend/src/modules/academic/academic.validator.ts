import { z } from 'zod';

export const createDepartmentSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Department name is required'),
        code: z.string().min(1, 'Department code is required').toUpperCase(),
    }),
});

export const updateDepartmentSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        code: z.string().min(1).toUpperCase().optional(),
    }),
    params: z.object({ id: z.string().uuid() }),
});

export const createStudyYearSchema = z.object({
    body: z.object({
        year: z.number().int().min(1, 'Study year must be at least 1').max(5, 'Study year must be at most 5'),
    }),
});

export const createSemesterSchema = z.object({
    body: z.object({
        number: z.number().int().min(1, 'Semester number must be at least 1').max(10, 'Semester number must be at most 10'),
    }),
});

export const createSectionSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Section name is required (e.g. A, B, C)'),
        departmentId: z.string().uuid('Valid department ID is required'),
        studyYearId: z.string().uuid('Valid study year ID is required'),
        semesterId: z.string().uuid('Valid semester ID is required'),
    }),
});

export const createSubjectSchema = z.object({
    body: z.object({
        code: z.string().min(1, 'Subject code is required').toUpperCase(),
        name: z.string().min(1, 'Subject name is required'),
        credits: z.number().int().min(1, 'Credits must be at least 1'),
        semesterId: z.string().uuid('Valid semester ID is required'),
        departmentId: z.string().uuid('Valid department ID is required'),
    }),
});
