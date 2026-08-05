import { Request, Response } from 'express';
import { GroupsService } from './groups.service';

export class GroupsController {
    static async createGroup(req: Request, res: Response) {
        try {
            const sectionId = req.query.sectionId as string | undefined;
            const departmentId = req.query.departmentId as string | undefined;
            if (!req.user?.userId) throw new Error('User not authenticated');
            const result = await GroupsService.createGroup(req.body, req.user.userId);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getGroups(req: Request, res: Response) {
        try {
            const result = await GroupsService.getGroups();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getGroupById(req: Request, res: Response) {
        try {
            const result = await GroupsService.getGroupById(req.params.id as string);
            if (!result) return res.status(404).json({ success: false, message: 'Group not found' });
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async addStudents(req: Request, res: Response) {
        try {
            const result = await GroupsService.addStudentsToGroup(req.params.id as string, req.body.studentIds);
            res.json({ success: true, message: `Added ${result.count} students to group` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async removeStudent(req: Request, res: Response) {
        try {
            await GroupsService.removeStudentFromGroup(req.params.id as string, req.params.studentId as string);
            res.json({ success: true, message: 'Student removed from group' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}



