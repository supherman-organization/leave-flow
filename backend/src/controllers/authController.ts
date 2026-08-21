import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../middlewares/auth';

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function setPasswordController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.setInitialPassword(req.user!.id, req.body.newPassword);
    res.json({ message: 'Mot de passe défini avec succès' });
  } catch (err) {
    next(err);
  }
}