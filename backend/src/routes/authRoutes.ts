import { Router } from 'express';
import { loginController, setPasswordController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { loginSchema, setPasswordSchema } from '../validators/authValidator';

const router = Router();

router.post('/login', validate(loginSchema), loginController);
router.post('/set-password', authenticate, validate(setPasswordSchema), setPasswordController);

export default router;