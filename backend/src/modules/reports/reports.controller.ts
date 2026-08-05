import { Request, Response } from 'express';
import { ReportsService } from './reports.service';

export class ReportsController {
    static async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await ReportsService.getDashboardStats();
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTestResults(req: Request, res: Response) {
        try {
            const results = await ReportsService.getTestResults(req.params.testId as string);
            res.json({ success: true, data: results });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTestOverview(req: Request, res: Response) {
        try {
            const overview = await ReportsService.getTestOverview();
            res.json({ success: true, data: overview });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async resetWarnings(req: Request, res: Response) {
        try {
            await ReportsService.resetWarnings(req.params.sessionId as string);
            res.json({ success: true, message: 'Warnings reset successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}



