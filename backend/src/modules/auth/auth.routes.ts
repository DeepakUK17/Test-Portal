import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema, setupPasswordSchema } from './auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/setup-password', validate(setupPasswordSchema), AuthController.setupPassword);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);

export default router;
