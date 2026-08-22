import { Router } from 'express';
import { getProfileController, changePasswordController } from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { changePasswordSchema } from '../validators/profileValidator';

const router = Router();
router.use(authenticate);
router.get('/', getProfileController);
router.patch('/password', validate(changePasswordSchema), changePasswordController);

export default router;