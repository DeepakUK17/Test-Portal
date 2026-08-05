import { Router } from 'express';
import { QuestionsController } from './questions.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { createQuestionSchema, updateQuestionSchema } from './questions.validator';

const router = Router();

router.use(authenticate);

// Everyone can view questions (or restrict to faculty/admin if needed, but usually tests fetch questions anyway)
router.get('/', QuestionsController.getQuestions);
router.get('/:id', QuestionsController.getQuestionById);

// Only Admin/Faculty can modify questions
router.use(authorize(['ADMIN', 'FACULTY']));
router.post('/', validate(createQuestionSchema), QuestionsController.createQuestion);
router.put('/:id', validate(updateQuestionSchema), QuestionsController.updateQuestion);
router.delete('/:id', QuestionsController.deleteQuestion);

export default router;
