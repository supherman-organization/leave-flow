import { Router } from 'express';
import { getDashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);
router.get('/', getDashboardController);

export default router;