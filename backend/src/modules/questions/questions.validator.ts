import { z } from 'zod';

export const createQuestionSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
        topics: z.array(z.string()).optional(),
        testCases: z.array(z.object({
            input: z.string(),
            expectedOutput: z.string(),
            isHidden: z.boolean().default(false),
            marks: z.number().int().min(1).default(10)
        })).min(1, 'At least one test case is required'),
        templates: z.array(z.object({
            language: z.string(),
            isTemplate: z.boolean().default(false),
            headerCode: z.string().optional(),
            bodyCode: z.string().optional(),
            footerCode: z.string().optional()
        })).optional()
    }),
});

export const updateQuestionSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        topics: z.array(z.string()).optional(),
        testCases: z.array(z.object({
            id: z.string().uuid().optional(), // If provided, update. If not, create new.
            input: z.string(),
            expectedOutput: z.string(),
            isHidden: z.boolean().default(false),
            marks: z.number().int().min(1).default(10)
        })).optional(),
        templates: z.array(z.object({
            language: z.string(),
            isTemplate: z.boolean().default(false),
            headerCode: z.string().optional(),
            bodyCode: z.string().optional(),
            footerCode: z.string().optional()
        })).optional()
    }),
    params: z.object({ id: z.string().uuid() }),
});
