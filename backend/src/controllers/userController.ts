import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export async function listUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    res.json(await userService.listUsers({ page, limit, search, role }));
  } catch (err) { next(err); }
}

export async function getUserController(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.getUserById(req.params.id));
  } catch (err) { next(err); }
}

export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await userService.createUser(req.body));
  } catch (err) { next(err); }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.updateUser(req.params.id, req.body));
  } catch (err) { next(err); }
}

export async function setStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.setUserStatus(req.params.id, req.body.isActive));
  } catch (err) { next(err); }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.resetUserPassword(req.params.id));
  } catch (err) { next(err); }
}