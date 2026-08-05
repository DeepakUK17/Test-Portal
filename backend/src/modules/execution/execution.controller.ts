import { Request, Response } from 'express';
import { ExecutionService, Language } from './execution.service';

export class ExecutionController {
    static async runCode(req: Request, res: Response) {
        try {
            const { language, sourceCode, input } = req.body;
            
            if (!language || !sourceCode) {
                res.status(400).json({ success: false, message: 'Language and sourceCode are required' });
                return;
            }

            const result = await ExecutionService.executeCode(language as Language, sourceCode, input || '');
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}


