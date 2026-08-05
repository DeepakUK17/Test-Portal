import { Request, Response } from 'express';
import { UsersService } from './users.service';

export class UsersController {
    // --- Students ---
    static async createStudent(req: Request, res: Response) {
        try {
            const result = await UsersService.createStudent(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getStudents(req: Request, res: Response) {
        try {
            const departmentId = req.query.departmentId as string | undefined;
            const result = await UsersService.getStudents(departmentId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateStudent(req: Request, res: Response) {
        try {
            await UsersService.updateStudent(req.params.id as string, req.body);
            res.json({ success: true, message: 'Student updated successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async bulkImportStudents(req: Request, res: Response) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No CSV file uploaded' });
                return;
            }
            const result = await UsersService.bulkImportStudents(req.file.path);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async bulkDeleteStudents(req: Request, res: Response) {
        try {
            const count = await UsersService.bulkDeleteStudents(req.body.userIds);
            res.json({ success: true, message: `Successfully deleted ${count} students.` });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async bulkPromoteStudents(req: Request, res: Response) {
        try {
            const result = await UsersService.bulkPromoteStudents(req.body.userIds);
            res.json({ success: true, data: result, message: `Successfully promoted ${result.promoted} students.` });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // --- Faculty ---
    static async createFaculty(req: Request, res: Response) {
        try {
            const result = await UsersService.createFaculty(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getFaculty(req: Request, res: Response) {
        try {
            const result = await UsersService.getFaculty();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateFaculty(req: Request, res: Response) {
        try {
            await UsersService.updateFaculty(req.params.id as string, req.body);
            res.json({ success: true, message: 'Faculty updated successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // --- Admin Operations ---
    static async resetPassword(req: Request, res: Response) {
        try {
            await UsersService.resetPassword(req.body.userId);
            res.json({ success: true, message: 'Password reset successfully. User must set up password on next login.' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async updateUserStatus(req: Request, res: Response) {
        try {
            await UsersService.updateUserStatus(req.params.id as string, req.body.accountStatus);
            res.json({ success: true, message: `User status updated to ${req.body.accountStatus}` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            await UsersService.deleteUser(req.params.id as string);
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}



