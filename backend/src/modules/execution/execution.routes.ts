import { Router } from 'express';
import { ExecutionController } from './execution.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Endpoint for manual code execution (e.g. "Run Code" button in exam workspace)
router.post('/run', authenticate, ExecutionController.runCode);

export default router;
