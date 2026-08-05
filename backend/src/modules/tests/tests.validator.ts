import { z } from 'zod';

export const createTestSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
        durationMinutes: z.number().int().min(1),
        warningCount: z.number().int().min(0).default(3),
        autoSubmitOnWarning: z.boolean().default(true),
        subjectId: z.string().uuid(),
        groupId: z.string().uuid().optional(),
        sectionId: z.string().uuid().optional(),
        password: z.string().optional(),
        allowedLanguages: z.array(z.string()).optional(),
        maxAttempts: z.number().int().min(1).default(1),
        questions: z.array(z.string().uuid()).min(1, 'At least one question is required')
    }).refine(data => {
        // Must assign to either a group or a section
        return !!data.groupId || !!data.sectionId;
    }, { message: "Test must be assigned to either a group or a section", path: ["groupId"] }),
});

export const updateTestStatusSchema = z.object({
    body: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED', 'RUNNING', 'COMPLETED']),
    }),
    params: z.object({ id: z.string().uuid() }),
});

export const updateTestSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
        durationMinutes: z.number().int().min(1).optional(),
        warningCount: z.number().int().min(0).optional(),
        autoSubmitOnWarning: z.boolean().optional(),
        subjectId: z.string().uuid().optional(),
        groupId: z.string().uuid().optional(),
        sectionId: z.string().uuid().optional(),
        password: z.string().optional(),
        allowedLanguages: z.array(z.string()).optional(),
        maxAttempts: z.number().int().min(1).optional(),
        questions: z.array(z.string().uuid()).min(1, 'At least one question is required').optional()
    }).refine(data => {
        // If neither is provided in update, we assume they remain unchanged
        if (data.groupId === undefined && data.sectionId === undefined) return true;
        // If one is provided, it must be the only one, or they can provide both but only one is truthy
        return !!data.groupId || !!data.sectionId;
    }, { message: "Test must be assigned to either a group or a section", path: ["groupId"] }),
    params: z.object({ id: z.string().uuid() }),
});
