import { Request, Response } from 'express';
import { QuestionsService } from './questions.service';

export class QuestionsController {
    static async createQuestion(req: Request, res: Response) {
        try {
            if (!req.user?.userId) throw new Error('User not authenticated');
            const result = await QuestionsService.createQuestion(req.body, req.user.userId);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getQuestions(req: Request, res: Response) {
        try {
            const result = await QuestionsService.getQuestions();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getQuestionById(req: Request, res: Response) {
        try {
            const result = await QuestionsService.getQuestionById(req.params.id as string);
            if (!result) return res.status(404).json({ success: false, message: 'Question not found' });
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateQuestion(req: Request, res: Response) {
        try {
            const result = await QuestionsService.updateQuestion(req.params.id as string, req.body);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async deleteQuestion(req: Request, res: Response) {
        try {
            const questionType = req.query.questionType as string | undefined;
            await QuestionsService.deleteQuestion(req.params.id as string);
            res.json({ success: true, message: 'Question deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}



