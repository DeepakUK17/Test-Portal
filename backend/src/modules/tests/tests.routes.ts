import { Router } from 'express';
import { TestsController } from './tests.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { createTestSchema, updateTestStatusSchema, updateTestSchema } from './tests.validator';

const router = Router();

router.use(authenticate);

// Faculty and Admin can manage tests
router.use(authorize(['ADMIN', 'FACULTY']));
router.get('/', TestsController.getTests);
router.post('/', validate(createTestSchema), TestsController.createTest);
router.get('/:id', TestsController.getTestById);
router.put('/:id', validate(updateTestSchema), TestsController.updateTest);
router.patch('/:id/status', validate(updateTestStatusSchema), TestsController.updateTestStatus);
router.delete('/:id', TestsController.deleteTest);

export default router;
