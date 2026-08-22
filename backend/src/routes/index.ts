import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import leaveRequestRoutes from './leaveRequestRoutes';
import dashboardRoutes from './dashboardRoutes';
import calendarRoutes from './calendarRoutes';
import profileRoutes from './profileRoutes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leave-requests', leaveRequestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/calendar', calendarRoutes);
router.use('/profile', profileRoutes);

export default router;