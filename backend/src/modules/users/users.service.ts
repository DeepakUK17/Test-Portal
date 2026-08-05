import prisma from '../../config/db';
import { parse } from 'csv-parse';
import * as fs from 'fs';

export class UsersService {
    // --- Students ---
    static async createStudent(data: {
        email: string; name: string; rollNumber: string; 
        departmentId: string; studyYearId: string; semesterId: string; sectionId?: string;
    }) {
        // Create user and profile in transaction
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    role: 'STUDENT',
                }
            });

            const profile = await tx.student.create({
                data: {
                    userId: user.id,
                    fullName: data.name,
                    rollNumber: data.rollNumber,
                    departmentId: data.departmentId,
                    studyYearId: data.studyYearId,
                    semesterId: data.semesterId,
                    sectionId: data.sectionId || null
                }
            });

            return { user, profile };
        });
    }

    static async getStudents(departmentId?: string) {
        return prisma.user.findMany({
            where: { role: 'STUDENT', deletedAt: null },
            include: {
                Student: {
                    include: { department: true, section: true, studyYear: true, semester: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateStudent(userId: string, data: any) {
        return prisma.$transaction(async (tx) => {
            if (data.email) {
                await tx.user.update({
                    where: { id: userId },
                    data: { email: data.email }
                });
            }

            const profileData: any = {};
            if (data.name) profileData.fullName = data.name;
            if (data.rollNumber) profileData.rollNumber = data.rollNumber;
            if (data.departmentId) profileData.departmentId = data.departmentId;
            if (data.studyYearId) profileData.studyYearId = data.studyYearId;
            if (data.semesterId) profileData.semesterId = data.semesterId;
            if (data.sectionId) profileData.sectionId = data.sectionId;

            if (Object.keys(profileData).length > 0) {
                await tx.student.update({
                    where: { userId },
                    data: profileData
                });
            }
            return { success: true };
        });
    }

    static async bulkImportStudents(filePath: string) {
        const records: any[] = [];
        const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));
        
        for await (const record of parser) {
            records.push(record);
        }

        let successCount = 0;
        let errors = [];

        // For large imports, consider batching. Keeping simple for Phase 4.
        for (const row of records) {
            try {
                // Find IDs by codes (assuming CSV provides code names instead of UUIDs)
                const dept = await prisma.department.findUnique({ where: { code: row.departmentCode } });
                const year = await prisma.studyYear.findFirst({ where: { yearNumber: parseInt(row.year) } });
                const sem = await prisma.semester.findFirst({ where: { number: parseInt(row.semester) } });
                
                if (!dept || !year || !sem) {
                    throw new Error('Invalid department, year, or semester code');
                }

                const section = await prisma.section.findFirst({
                    where: { name: row.section }
                });

                if (!section) {
                    throw new Error(`Section ${row.section} not found for this config`);
                }

                await this.createStudent({
                    email: row.email,
                    name: row.name,
                    rollNumber: row.rollNumber,
                    departmentId: dept.id,
                    studyYearId: year.id,
                    semesterId: sem.id,
                    sectionId: section.id,
                });
                successCount++;
            } catch (err: any) {
                errors.push({ email: row.email, error: err.message });
            }
        }

        // Cleanup file
        fs.unlinkSync(filePath);

        return { successCount, errors };
    }

    static async bulkDeleteStudents(userIds: string[]) {
        const result = await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
                accountStatus: 'DISABLED',
                deletedAt: new Date()
            }
        });
        return result.count;
    }

    static async bulkPromoteStudents(userIds: string[]) {
        const students = await prisma.student.findMany({
            where: { userId: { in: userIds } },
            include: { studyYear: true }
        });

        const allYears = await prisma.studyYear.findMany({
            orderBy: { yearNumber: 'asc' }
        });

        let promotedCount = 0;

        await prisma.$transaction(async (tx) => {
            for (const student of students) {
                const currentYearIndex = allYears.findIndex(y => y.id === student.studyYearId);
                // Promote if there is a next year available
                if (currentYearIndex !== -1 && currentYearIndex + 1 < allYears.length) {
                    const nextYear = allYears[currentYearIndex + 1];
                    if (!nextYear) continue;
                    await tx.student.update({
                        where: { id: student.id },
                        data: { studyYearId: nextYear.id }
                    });
                    promotedCount++;
                }
            }
        });

        return { promoted: promotedCount, total: students.length };
    }

    // --- Faculty ---
    static async createFaculty(data: { email: string; name: string; employeeId: string; departmentId: string }) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    role: 'FACULTY',
                }
            });

            const profile = await tx.faculty.create({
                data: {
                    userId: user.id,
                    name: data.name,
                    facultyCode: data.employeeId,
                    departmentId: data.departmentId,
                }
            });

            return { user, profile };
        });
    }

    static async getFaculty() {
        return prisma.user.findMany({
            where: { role: 'FACULTY', deletedAt: null },
            include: {
                Faculty: {
                    include: { department: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateFaculty(userId: string, data: any) {
        return prisma.$transaction(async (tx) => {
            if (data.email) {
                await tx.user.update({
                    where: { id: userId },
                    data: { email: data.email }
                });
            }

            const profileData: any = {};
            if (data.name) profileData.name = data.name;
            if (data.employeeId) profileData.facultyCode = data.employeeId;
            if (data.departmentId) profileData.departmentId = data.departmentId;

            if (Object.keys(profileData).length > 0) {
                await tx.faculty.update({
                    where: { userId },
                    data: profileData
                });
            }
            return { success: true };
        });
    }

    // --- Admin Operations ---
    static async resetPassword(userId: string) {
        // Resets user's password requirements so they must set it up again
        return prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: null,
                firstLogin: true,
                accountStatus: 'ACTIVE', // Also unlocks account if it was locked
                failedLoginAttempts: 0
            }
        });
    }

    static async updateUserStatus(userId: string, status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED') {
        const mappedStatus = status === 'SUSPENDED' ? 'DISABLED' : status;
        return prisma.user.update({
            where: { id: userId },
            data: { accountStatus: mappedStatus }
        });
    }

    static async deleteUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                accountStatus: 'DISABLED',
                deletedAt: new Date()
            }
        });
    }
}
