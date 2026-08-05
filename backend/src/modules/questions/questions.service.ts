import prisma from '../../config/db';
import { Difficulty, QuestionType } from '@prisma/client';

export class QuestionsService {
    static async createQuestion(data: {
        title: string;
        description: string;
        difficulty: Difficulty;
        questionType?: QuestionType;
        marks?: number;
        timeLimit?: number;
        testCases?: Array<{ input: string; expectedOutput: string; visibility?: string; isHidden?: boolean; weightage?: number }>;
        templates?: Array<{ language: string; headerCode?: string; bodyCode?: string; footerCode?: string; isTemplate: boolean }>;
    }, createdById: string) {
        // Generate a simple slug from title
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        const createData: any = {
            title: data.title,
            slug,
            description: data.description,
            difficulty: data.difficulty,
            questionType: data.questionType || 'PROGRAMMING',
            marks: data.marks || 10,
            timeLimit: data.timeLimit || 120,
            createdBy: createdById,
        };
        if (data.testCases && data.testCases.length > 0) {
            createData.TestCases = {
                create: data.testCases.map((tc: any, i: number) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    visibility: tc.visibility || (tc.isHidden ? 'HIDDEN' : 'SAMPLE'),
                    weightage: tc.weightage || 10,
                    executionOrder: i + 1
                }))
            };
        }
        if (data.templates && data.templates.length > 0) {
            createData.Languages = {
                create: data.templates.map((tpl: any) => ({
                    language: tpl.language.toUpperCase(),
                    isTemplate: tpl.isTemplate || false,
                    headerCode: tpl.headerCode || null,
                    bodyCode: tpl.bodyCode || null,
                    footerCode: tpl.footerCode || null
                }))
            };
        }
        return prisma.question.create({
            data: createData,
            include: { TestCases: true }
        });
    }

    static async getQuestions() {
        return prisma.question.findMany({
            where: { deletedAt: null },
            include: {
                _count: { select: { TestCases: true, Submissions: true } },
                Languages: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getQuestionById(id: string) {
        return prisma.question.findUnique({
            where: { id },
            include: {
                TestCases: true,
                Languages: true
            }
        });
    }

    static async updateQuestion(id: string, data: any) {
        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.difficulty) updateData.difficulty = data.difficulty;
        if (data.marks) updateData.marks = data.marks;
        if (data.timeLimit) updateData.timeLimit = data.timeLimit;

        if (data.testCases) {
            updateData.TestCases = {
                deleteMany: {},
                create: data.testCases.map((tc: any, i: number) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    visibility: tc.visibility || (tc.isHidden ? 'HIDDEN' : 'SAMPLE'),
                    weightage: tc.weightage || 10,
                    executionOrder: i + 1
                }))
            };
        }

        if (data.templates) {
            updateData.Languages = {
                deleteMany: {},
                create: data.templates.map((tpl: any) => ({
                    language: tpl.language.toUpperCase(),
                    isTemplate: tpl.isTemplate || false,
                    headerCode: tpl.headerCode || null,
                    bodyCode: tpl.bodyCode || null,
                    footerCode: tpl.footerCode || null
                }))
            };
        }

        return prisma.question.update({
            where: { id },
            data: updateData
        });
    }

    static async deleteQuestion(id: string) {
        // Soft delete
        return prisma.question.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
