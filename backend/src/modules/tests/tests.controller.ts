import { Request, Response } from 'express';
import { TestsService } from './tests.service';
import { TestStatus } from '@prisma/client';

export class TestsController {
    static async createTest(req: Request, res: Response) {
        try {
            if (!req.user?.userId) throw new Error('User not authenticated');
            const result = await TestsService.createTest(req.body, req.user.userId);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getTests(req: Request, res: Response) {
        try {
            // Optional filters
            const filters: any = {};
            const status = req.query.status as string | undefined;
            if (status) filters.status = status as TestStatus;
            
            // If faculty, only show their tests (for now, or we can let them see all department tests)
            if (req.user?.role === 'FACULTY') {
                filters.createdBy = req.user.userId;
            }

            const result = await TestsService.getTests(filters);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTestById(req: Request, res: Response) {
        try {
            const result = await TestsService.getTestById(req.params.id as string);
            if (!result) return res.status(404).json({ success: false, message: 'Test not found' });
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateTestStatus(req: Request, res: Response) {
        try {
            const result = await TestsService.updateTestStatus(req.params.id as string, req.body.status);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async updateTest(req: Request, res: Response) {
        try {
            const result = await TestsService.updateTest(req.params.id as string, req.body);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async deleteTest(req: Request, res: Response) {
        try {
            await TestsService.deleteTest(req.params.id as string);
            res.json({ success: true, message: 'Test deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}


