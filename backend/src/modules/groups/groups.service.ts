import prisma from '../../config/db';

export class GroupsService {
    // createdBy in schema is String (user ID), not a relation
    static async createGroup(data: { name: string; description?: string; departmentId?: string; studyYearId?: string; sectionId?: string }, createdById: string) {
        return prisma.studentGroup.create({
            data: {
                groupName: data.name,
                description: data.description ?? null,
                departmentId: data.departmentId ?? null,
                studyYearId: data.studyYearId ?? null,
                sectionId: data.sectionId ?? null,
                createdBy: createdById,
                type: 'CUSTOM'
            }
        });
    }

    static async getGroups() {
        return prisma.studentGroup.findMany({
            include: {
                department: true,
                studyYear: true,
                section: true,
                _count: { select: { Members: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getGroupById(id: string) {
        return prisma.studentGroup.findUnique({
            where: { id },
            include: {
                Members: {
                    include: {
                        student: {
                            include: { 
                                user: { select: { email: true } },
                                department: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async addStudentsToGroup(groupId: string, studentIds: string[]) {
        const data = studentIds.map(studentId => ({
            groupId,
            studentId
        }));
        return prisma.studentGroupMember.createMany({
            data,
            skipDuplicates: true
        });
    }

    static async removeStudentFromGroup(groupId: string, studentId: string) {
        return prisma.studentGroupMember.delete({
            where: {
                groupId_studentId: { groupId, studentId }
            }
        });
    }

    static async deleteGroup(id: string) {
        // Delete members first
        await prisma.studentGroupMember.deleteMany({ where: { groupId: id } });
        return prisma.studentGroup.delete({ where: { id } });
    }
}
