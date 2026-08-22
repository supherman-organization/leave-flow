import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as service from '../services/profileService';

export async function getProfileController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.getProfile(req.user!.id));
  } catch (err) { next(err); }
}

export async function changePasswordController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Mot de passe mis a jour' });
  } catch (err) { next(err); }
}