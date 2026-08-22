import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import leaveRequestRoutes from './leaveRequestRoutes';
import dashboardRoutes from './dashboardRoutes';
import calendarRoutes from './calendarRoutes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leave-requests', leaveRequestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/calendar', calendarRoutes);

export default router;