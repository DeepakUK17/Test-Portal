import prisma from '../../config/db';

export class AcademicService {
    // --- Departments ---
    static async createDepartment(data: { name: string; code: string }) {
        return prisma.department.create({ data });
    }

    static async getDepartments() {
        return prisma.department.findMany({
            include: {
                _count: {
                    select: { Students: true, Faculty: true }
                }
            }
        });
    }

    static async updateDepartment(id: string, data: { name?: string; code?: string }) {
        return prisma.department.update({ where: { id }, data });
    }

    static async deleteDepartment(id: string) {
        return prisma.department.delete({ where: { id } });
    }

    // --- Study Years ---
    static async createStudyYear(data: { year: number }) {
        return prisma.studyYear.create({ data: { yearNumber: data.year } });
    }

    static async getStudyYears() {
        return prisma.studyYear.findMany({ orderBy: { yearNumber: 'asc' } });
    }

    // --- Semesters ---
    static async createSemester(data: { number: number }) {
        return prisma.semester.create({ data });
    }

    static async getSemesters() {
        return prisma.semester.findMany({ orderBy: { number: 'asc' } });
    }

    // --- Sections ---
    static async createSection(data: { name: string; departmentId: string; studyYearId: string; semesterId: string }) {
        return prisma.section.create({ 
            data: { 
                name: data.name,
                departmentId: data.departmentId,
                studyYearId: data.studyYearId,
                semesterId: data.semesterId
            } 
        });
    }

    static async getSections(filters?: { departmentId?: string; studyYearId?: string; semesterId?: string }) {
        return prisma.section.findMany({
            where: filters ?? {},
            include: {
                department: true,
                studyYear: true,
                semester: true,
                _count: { select: { Students: true } }
            },
            orderBy: [{ name: 'asc' }]
        });
    }

    static async deleteSection(id: string) {
        return prisma.section.delete({ where: { id } });
    }

    // --- Subjects ---
    static async createSubject(data: { code: string; name: string; credits: number; semesterId: string; departmentId: string }) {
        return prisma.subject.create({ data });
    }

    static async getSubjects(filters?: { departmentId?: string; semesterId?: string }) {
        return prisma.subject.findMany({
            where: filters ?? {},
            include: {
                department: true,
                semester: true
            },
            orderBy: { name: 'asc' }
        });
    }

    static async updateSubject(id: string, data: { code?: string; name?: string; credits?: number }) {
        return prisma.subject.update({ where: { id }, data });
    }

    static async deleteSubject(id: string) {
        return prisma.subject.delete({ where: { id } });
    }
}
