import { Router } from 'express';
import { ExamController } from './exam.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

// Only students can access exam routes
router.use(authenticate);
router.use(authorize(['STUDENT']));

router.get('/my-tests', ExamController.getMyTests);
router.post('/:testId/start', ExamController.startTest);
router.get('/attempts/:attemptId/questions', ExamController.getTestQuestions);
router.put('/attempts/:attemptId/questions/:questionId/save', ExamController.saveCode);
router.post('/attempts/:attemptId/questions/:questionId/run', ExamController.runCode);
router.post('/attempts/:attemptId/questions/:questionId/submit', ExamController.submitCode);
router.post('/attempts/:attemptId/warning', ExamController.logWarning);
router.post('/attempts/:attemptId/submit', ExamController.submitTest);
router.get('/results/:attemptId', ExamController.getResult);

export default router;
