import { Router } from 'express';
import { getCalendarController } from '../controllers/calendarController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);
router.get('/', getCalendarController);

export default router;
