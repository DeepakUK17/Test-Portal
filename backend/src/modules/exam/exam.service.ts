import prisma from '../../config/db';
import { ExecutionService, Language } from '../execution/execution.service';

export class ExamService {
    static async getMyTests(studentId: string) {
        // Find the student record
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: { GroupMemberships: true }
        });

        if (!student) throw new Error('Student profile not found');

        const groupIds = student.GroupMemberships.map(g => g.groupId);

        // Find tests assigned to this student via TestAssignment
        return prisma.test.findMany({
            where: {
                status: { in: ['PUBLISHED', 'RUNNING', 'COMPLETED'] },
                OR: [
                    // New schema: direct relationships on the Test model
                    { groupId: { in: groupIds } },
                    ...(student.sectionId ? [{ sectionId: student.sectionId }] : []),
                    // Fallback for old schema: TestAssignment table
                    {
                        Assignments: {
                            some: {
                                OR: [
                                    { studentId: student.id },
                                    { groupId: { in: groupIds } },
                                    ...(student.sectionId ? [{ sectionId: student.sectionId }] : [])
                                ]
                            }
                        }
                    }
                ]
            },
            include: {
                StudentSessions: {
                    where: { studentId: student.id }
                }
            },
            orderBy: { startTime: 'asc' }
        });
    }

    static async startTest(testId: string, userId: string) {
        // Find student record from user ID
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new Error('Student not found');

        const test = await prisma.test.findUnique({ where: { id: testId } });
        if (!test || (test.status !== 'PUBLISHED' && test.status !== 'RUNNING')) {
            throw new Error('Test is not available');
        }

        // Check existing sessions
        const existingSessions = await prisma.studentTest.findMany({
            where: { testId, studentId: student.id },
            orderBy: { startedAt: 'desc' }
        });

        let session = existingSessions.length > 0 ? existingSessions[0] : null;

        if (session && (session.status === 'SUBMITTED' || session.status === 'AUTO_SUBMITTED')) {
            if (existingSessions.length >= test.maxAttempts) {
                throw new Error(`Maximum attempts (${test.maxAttempts}) reached for this test`);
            }
            // Allow new attempt
            session = null;
        }

        if (!session) {
            session = await prisma.studentTest.create({
                data: {
                    testId,
                    studentId: student.id,
                    status: 'RUNNING',
                    startedAt: new Date()
                }
            });
        }

        return session;
    }

    static async getTestQuestions(sessionId: string, userId: string) {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new Error('Student not found');

        const session = await prisma.studentTest.findUnique({ where: { id: sessionId } });
        if (!session || session.studentId !== student.id) throw new Error('Invalid session');

        // Return the test questions with allowed languages
        const testQuestions = await prisma.testQuestion.findMany({
            where: { testId: session.testId },
            include: {
                question: {
                    include: {
                        TestCases: {
                            where: { visibility: 'SAMPLE' }
                        },
                        Languages: true // Include templates
                    }
                }
            },
            orderBy: { displayOrder: 'asc' }
        });
        
        const test = await prisma.test.findUnique({ where: { id: session.testId }});
        return {
            allowedLanguages: test?.allowedLanguages || ["c", "cpp", "java", "python", "javascript"],
            questions: testQuestions,
            session,
            test
        };
    }

    static async saveCode(sessionId: string, questionId: string, code: string, language: string) {
        // Code state saved via submission records
        return { saved: true };
    }

    static async runCode(sessionId: string, questionId: string, code: string, language: Language, customInput?: string) {
        const prismaLanguage = language.toUpperCase() as any;
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { 
                TestCases: { where: { visibility: 'SAMPLE' } },
                Languages: { where: { language: prismaLanguage } }
            }
        });

        if (!question) throw new Error('Question not found');
        
        // Inject header and footer if template exists
        let executionCode = code;
        const template = question.Languages[0];
        if (template) {
            const header = template.headerCode ? template.headerCode + '\n' : '';
            const footer = template.footerCode ? '\n' + template.footerCode : '';
            executionCode = header + code + footer;
        }

        const results = [];
        
        // Handle custom input execution
        if (customInput !== undefined) {
            const execResults = await ExecutionService.executeCode(language, executionCode, [customInput]);
            const execResult = execResults[0]!;
            results.push({
                testCaseId: 'custom',
                input: customInput,
                expectedOutput: 'N/A (Custom Input)',
                actualOutput: execResult.output,
                success: execResult.success,
                error: execResult.error
            });
            return results;
        }

        const inputs = question.TestCases.map(tc => tc.input);
        const execResults = await ExecutionService.executeCode(language, executionCode, inputs);

        for (let i = 0; i < question.TestCases.length; i++) {
            const tc = question.TestCases[i]!;
            const execResult = execResults[i]!;
            results.push({
                testCaseId: tc.id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput: execResult.output,
                success: execResult.success && execResult.output.trim() === tc.expectedOutput.trim(),
                error: execResult.error
            });
        }

        return results;
    }

    static async submitCode(sessionId: string, questionId: string, code: string, language: Language) {
        const prismaLanguage = language.toUpperCase() as any;
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { 
                TestCases: true, // Fetch ALL test cases including hidden
                Languages: { where: { language: prismaLanguage } }
            }
        });

        if (!question) throw new Error('Question not found');
        
        let executionCode = code;
        const template = question.Languages[0];
        if (template) {
            const header = template.headerCode ? template.headerCode + '\n' : '';
            const footer = template.footerCode ? '\n' + template.footerCode : '';
            executionCode = header + code + footer;
        }

        let passed = 0;
        let total = question.TestCases.length;
        let testCaseResults = [];

        const inputs = question.TestCases.map(tc => tc.input);
        const execResults = await ExecutionService.executeCode(language, executionCode, inputs);

        for (let i = 0; i < question.TestCases.length; i++) {
            const tc = question.TestCases[i]!;
            const execResult = execResults[i]!;
            const isSuccess = execResult.success && execResult.output.trim() === tc.expectedOutput.trim();
            if (isSuccess) passed++;

            testCaseResults.push({
                testCaseId: tc.id,
                status: isSuccess ? 'ACCEPTED' : (execResult.error ? 'RUNTIME_ERROR' : 'WRONG_ANSWER'),
                executionTime: 0.1, // Mock metric
                memory: 10.0, // Mock metric
                actualOutput: execResult.output
            });
        }

        // Calculate score
        const score = total > 0 ? Math.round((passed / total) * question.marks) : 0;

        // Save submission
        const submission = await prisma.submission.create({
            data: {
                studentTestId: sessionId,
                questionId,
                language: language.toUpperCase() as any,
                sourceCode: code, // Save student's raw code
                compilerStatus: passed === total ? 'ACCEPTED' : 'WRONG_ANSWER',
                score,
                submissionType: 'FINAL',
                TestCaseResults: {
                    create: testCaseResults.map(tcr => ({
                        testCaseId: tcr.testCaseId,
                        status: tcr.status as any,
                        executionTime: tcr.executionTime,
                        memory: tcr.memory,
                        actualOutput: tcr.actualOutput
                    }))
                }
            }
        });

        return {
            submissionId: submission.id,
            passed,
            total,
            score,
            status: passed === total ? 'ACCEPTED' : 'WRONG_ANSWER'
        };
    }

    static async logWarning(sessionId: string, type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'MULTIPLE_FACES' | 'NO_FACE') {
        const session = await prisma.studentTest.findUnique({
            where: { id: sessionId },
            include: { test: true }
        });

        if (!session) throw new Error('Session not found');

        const updatedSession = await prisma.studentTest.update({
            where: { id: sessionId },
            data: { warningCount: { increment: 1 } }
        });

        if (session.test.autoSubmitOnWarning && updatedSession.warningCount >= session.test.warningCount) {
            await prisma.studentTest.update({
                where: { id: sessionId },
                data: { status: 'AUTO_SUBMITTED', submittedAt: new Date() }
            });
            return { submitted: true, reason: 'Max warnings reached' };
        }

        return { submitted: false, warnings: updatedSession.warningCount, maxWarnings: session.test.warningCount };
    }

    static async submitTest(sessionId: string) {
        return prisma.studentTest.update({
            where: { id: sessionId },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date()
            }
        });
    }

    static async getResult(sessionId: string, userId: string) {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new Error('Student not found');

        const session = await prisma.studentTest.findUnique({
            where: { id: sessionId },
            include: {
                test: {
                    include: {
                        Questions: {
                            include: {
                                question: {
                                    include: {
                                        ProgrammingDetails: true,
                                        TestCases: true
                                    }
                                }
                            },
                            orderBy: { displayOrder: 'asc' }
                        }
                    }
                },
                student: true,
                Submissions: {
                    include: {
                        question: {
                            include: {
                                ProgrammingDetails: true,
                                TestCases: true
                            }
                        },
                        TestCaseResults: {
                            include: {
                                testCase: true
                            }
                        }
                    },
                    orderBy: {
                        submittedAt: 'desc'
                    }
                }
            }
        });

        if (!session || session.studentId !== student.id) {
            throw new Error('Session not found');
        }

        if (session.status !== 'SUBMITTED' && session.status !== 'AUTO_SUBMITTED') {
            throw new Error('Test not submitted yet');
        }

        return session;
    }
}
