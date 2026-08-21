import { Router } from 'express';
import * as controller from '../controllers/leaveRequestController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { upload } from '../middlewares/upload';
import { createLeaveSchema, refuseSchema, overrideStatusSchema } from '../validators/leaveRequestValidator';

const router = Router();
router.use(authenticate);

// Employe
router.post('/', upload.single('justificatif'), validate(createLeaveSchema), controller.createController);
router.get('/mine', controller.listMineController);

// Manager / RH
router.get('/', requireRole('manager', 'hr'), controller.listAllController);
router.patch('/:id/approve', requireRole('manager', 'hr'), controller.approveController);
router.patch('/:id/refuse', requireRole('manager', 'hr'), validate(refuseSchema), controller.refuseController);
router.patch('/:id/status', requireRole('hr'), validate(overrideStatusSchema), controller.overrideController);

// Detail + annulation
router.get('/:id', controller.getOneController);
router.patch('/:id/cancel', controller.cancelController);

export default router;