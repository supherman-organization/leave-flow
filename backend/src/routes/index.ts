import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import leaveRequestRoutes from './leaveRequestRoutes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leave-requests', leaveRequestRoutes);

export default router;