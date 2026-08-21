import { Router } from 'express';
import * as controller from '../controllers/leaveRequestController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { upload } from '../middlewares/upload';
import { createLeaveSchema } from '../validators/leaveRequestValidator';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('justificatif'), validate(createLeaveSchema), controller.createController);
router.get('/mine', controller.listMineController);
router.get('/:id', controller.getOneController);
router.patch('/:id/cancel', controller.cancelController);

export default router;