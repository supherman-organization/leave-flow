import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as service from '../services/dashboardService';

export async function getDashboardController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.getDashboard(req.user!));
  } catch (err) { next(err); }
}