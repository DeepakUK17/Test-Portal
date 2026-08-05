import prisma from '../../config/db';

export class ReportsService {
    static async getDashboardStats() {
        const totalTests = await prisma.test.count({ where: { deletedAt: null } });
        const totalQuestions = await prisma.question.count({ where: { deletedAt: null } });
        
        const publishedTests = await prisma.test.count({
            where: { status: 'PUBLISHED', deletedAt: null }
        });

        const recentSessions = await prisma.studentTest.findMany({
            take: 5,
            orderBy: { startedAt: 'desc' },
            include: {
                student: { include: { user: true } },
                test: true
            }
        });

        return { totalTests, totalQuestions, publishedTests, recentSessions };
    }

    static async getTestResults(testId: string) {
        return prisma.studentTest.findMany({
            where: { testId, status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
            include: {
                student: { include: { user: true } },
                Submissions: {
                    include: { question: true }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });
    }

    static async getTestOverview() {
        const tests = await prisma.test.findMany({
            where: { deletedAt: null },
            include: {
                StudentSessions: {
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return tests.map(test => ({
            ...test,
            totalAttempts: test.StudentSessions.length
        }));
    }

    static async resetWarnings(sessionId: string) {
        const session = await prisma.studentTest.findUnique({ where: { id: sessionId } });
        if (!session) throw new Error('Session not found');

        const newStatus = session.status === 'AUTO_SUBMITTED' ? 'RUNNING' : session.status;
        
        return prisma.studentTest.update({
            where: { id: sessionId },
            data: { 
                warningCount: 0,
                status: newStatus,
                submittedAt: newStatus === 'RUNNING' ? null : session.submittedAt
            }
        });
    }
}
