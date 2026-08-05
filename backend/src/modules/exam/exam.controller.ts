import { Request, Response } from 'express';
import { ExamService } from './exam.service';

export class ExamController {
    static async getMyTests(req: Request, res: Response) {
        try {
            const result = await ExamService.getMyTests(req.user!.userId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async startTest(req: Request, res: Response) {
        try {
            const result = await ExamService.startTest(req.params.testId as string, req.user!.userId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getTestQuestions(req: Request, res: Response) {
        try {
            const result = await ExamService.getTestQuestions(req.params.attemptId as string, req.user!.userId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(403).json({ success: false, message: error.message });
        }
    }

    static async saveCode(req: Request, res: Response) {
        try {
            await ExamService.saveCode(req.params.attemptId as string, req.params.questionId as string, req.body.code, req.body.language);
            res.json({ success: true, message: 'Saved' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async runCode(req: Request, res: Response) {
        try {
            const result = await ExamService.runCode(req.params.attemptId as string, req.params.questionId as string, req.body.code, req.body.language, req.body.customInput);
            res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('RunCode Error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async submitCode(req: Request, res: Response) {
        try {
            const result = await ExamService.submitCode(req.params.attemptId as string, req.params.questionId as string, req.body.code, req.body.language);
            res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('SubmitCode Error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async logWarning(req: Request, res: Response) {
        try {
            const result = await ExamService.logWarning(req.params.attemptId as string, req.body.type);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async submitTest(req: Request, res: Response) {
        try {
            await ExamService.submitTest(req.params.attemptId as string);
            res.json({ success: true, message: 'Test submitted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getResult(req: Request, res: Response) {
        try {
            const result = await ExamService.getResult(req.params.attemptId as string, req.user!.userId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}



