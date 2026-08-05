import { Request, Response } from 'express';
import { AcademicService } from './academic.service';

export class AcademicController {
    // --- Departments ---
    static async createDepartment(req: Request, res: Response) {
        try {
            const result = await AcademicService.createDepartment(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Department already exists' });
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getDepartments(req: Request, res: Response) {
        try {
            const result = await AcademicService.getDepartments();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateDepartment(req: Request, res: Response) {
        try {
            const result = await AcademicService.updateDepartment(req.params.id as string, req.body);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async deleteDepartment(req: Request, res: Response) {
        try {
            await AcademicService.deleteDepartment(req.params.id as string);
            res.json({ success: true, message: 'Department deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: 'Cannot delete department: dependencies exist' });
        }
    }

    // --- Study Years ---
    static async createStudyYear(req: Request, res: Response) {
        try {
            const result = await AcademicService.createStudyYear(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Study year already exists' });
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getStudyYears(req: Request, res: Response) {
        try {
            const result = await AcademicService.getStudyYears();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // --- Semesters ---
    static async createSemester(req: Request, res: Response) {
        try {
            const result = await AcademicService.createSemester(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Semester already exists' });
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getSemesters(req: Request, res: Response) {
        try {
            const result = await AcademicService.getSemesters();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // --- Sections ---
    static async createSection(req: Request, res: Response) {
        try {
            const result = await AcademicService.createSection(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Section already exists for this config' });
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getSections(req: Request, res: Response) {
        try {
            const result = await AcademicService.getSections(req.query);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteSection(req: Request, res: Response) {
        try {
            await AcademicService.deleteSection(req.params.id as string);
            res.json({ success: true, message: 'Section deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: 'Cannot delete section: dependencies exist' });
        }
    }

    // --- Subjects ---
    static async createSubject(req: Request, res: Response) {
        try {
            const result = await AcademicService.createSubject(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Subject code already exists' });
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getSubjects(req: Request, res: Response) {
        try {
            const result = await AcademicService.getSubjects(req.query);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateSubject(req: Request, res: Response) {
        try {
            const result = await AcademicService.updateSubject(req.params.id as string, req.body);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async deleteSubject(req: Request, res: Response) {
        try {
            await AcademicService.deleteSubject(req.params.id as string);
            res.json({ success: true, message: 'Subject deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: 'Cannot delete subject: dependencies exist' });
        }
    }
}



