import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorize(['FACULTY', 'ADMIN']));

router.get('/dashboard', ReportsController.getDashboardStats);
router.get('/tests', ReportsController.getTestOverview);
router.get('/tests/:testId/results', ReportsController.getTestResults);
router.post('/sessions/:sessionId/reset-warnings', ReportsController.resetWarnings);

export default router;
