import prisma from '../../config/db';
import { TestStatus } from '@prisma/client';

export class TestsService {
    static async createTest(data: any, createdById: string) {
        return prisma.$transaction(async (tx) => {
            const test = await tx.test.create({
                data: {
                    title: data.title,
                    description: data.description || null,
                    duration: data.duration || data.durationMinutes || 60,
                    startTime: data.startTime ? new Date(data.startTime) : null,
                    endTime: data.endTime ? new Date(data.endTime) : null,
                    passwordHash: data.password || null,
                    passingPercentage: data.passingPercentage || 40,
                    maximumMarks: data.maximumMarks || 100,
                    warningCount: data.warningCount !== undefined ? data.warningCount : 3,
                    autoSubmitOnWarning: data.autoSubmitOnWarning !== undefined ? data.autoSubmitOnWarning : true,
                    shuffleQuestions: data.shuffleQuestions || false,
                    shuffleMcq: data.shuffleMcq || false,
                    allowRun: data.allowRun !== undefined ? data.allowRun : true,
                    showResult: data.showResult || false,
                    createdBy: createdById,
                    status: 'DRAFT',
                    subjectId: data.subjectId,
                    groupId: data.groupId || null,
                    sectionId: data.sectionId || null,
                    allowedLanguages: data.allowedLanguages || ["c", "cpp", "java", "python", "javascript"],
                    maxAttempts: data.maxAttempts || 1,
                }
            });

            // Add questions to the test
            if (data.questions && data.questions.length > 0) {
                const testQuestions = data.questions.map((qId: string, index: number) => ({
                    testId: test.id,
                    questionId: qId,
                    displayOrder: index + 1,
                    marks: data.marksPerQuestion || 10
                }));
                await tx.testQuestion.createMany({ data: testQuestions });
            }

            return test;
        });
    }

    static async updateTest(id: string, data: any) {
        return prisma.$transaction(async (tx) => {
            const updateData: any = {};
            if (data.title !== undefined) updateData.title = data.title;
            if (data.description !== undefined) updateData.description = data.description || null;
            if (data.durationMinutes !== undefined || data.duration !== undefined) updateData.duration = data.duration || data.durationMinutes;
            if (data.startTime !== undefined) updateData.startTime = data.startTime ? new Date(data.startTime) : null;
            if (data.endTime !== undefined) updateData.endTime = data.endTime ? new Date(data.endTime) : null;
            if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
            if (data.groupId !== undefined) updateData.groupId = data.groupId || null;
            if (data.sectionId !== undefined) updateData.sectionId = data.sectionId || null;
            if (data.password !== undefined) updateData.passwordHash = data.password || null;
            if (data.allowedLanguages !== undefined) updateData.allowedLanguages = data.allowedLanguages;
            if (data.maxAttempts !== undefined) updateData.maxAttempts = data.maxAttempts;
            if (data.warningCount !== undefined) updateData.warningCount = data.warningCount;
            if (data.autoSubmitOnWarning !== undefined) updateData.autoSubmitOnWarning = data.autoSubmitOnWarning;

            const test = await tx.test.update({
                where: { id },
                data: updateData
            });

            // Update questions if provided
            if (data.questions !== undefined) {
                // Delete existing
                await tx.testQuestion.deleteMany({ where: { testId: id } });
                
                // Add new ones
                if (data.questions.length > 0) {
                    const testQuestions = data.questions.map((qId: string, index: number) => ({
                        testId: id,
                        questionId: qId,
                        displayOrder: index + 1,
                        marks: data.marksPerQuestion || 10
                    }));
                    await tx.testQuestion.createMany({ data: testQuestions });
                }
            }

            return test;
        });
    }

    static async getTests(filters?: { createdBy?: string; status?: TestStatus }) {
        return prisma.test.findMany({
            where: { 
                deletedAt: null,
                ...filters
            },
            include: {
                _count: { select: { Questions: true, StudentSessions: true } },
                subject: true,
                group: true,
                section: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getTestById(id: string) {
        return prisma.test.findUnique({
            where: { id },
            include: {
                Questions: {
                    include: { question: true },
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });
    }

    static async updateTestStatus(id: string, status: TestStatus) {
        return prisma.test.update({
            where: { id },
            data: { status }
        });
    }

    static async deleteTest(id: string) {
        return prisma.test.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' }
        });
    }
}
