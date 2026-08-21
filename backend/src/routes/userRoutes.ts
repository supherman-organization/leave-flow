import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { createUserSchema, updateUserSchema, updateStatusSchema } from '../validators/userValidator';

const router = Router();

router.use(authenticate, requireRole('hr'));

router.get('/', userController.listUsersController);
router.get('/:id', userController.getUserController);
router.post('/', validate(createUserSchema), userController.createUserController);
router.put('/:id', validate(updateUserSchema), userController.updateUserController);
router.patch('/:id/status', validate(updateStatusSchema), userController.setStatusController);
router.post('/:id/reset-password', userController.resetPasswordController);

export default router;