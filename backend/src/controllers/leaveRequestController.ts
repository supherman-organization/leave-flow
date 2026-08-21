import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as service from '../services/leaveRequestService';

export async function createController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const request = await service.createLeaveRequest(req.user!.id, {
      ...req.body,
      justificatif: req.file?.filename,
    });
    res.status(201).json(request);
  } catch (err) { next(err); }
}

export async function listMineController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    res.json(await service.listMyRequests(req.user!.id, { page, limit, status, type }));
  } catch (err) { next(err); }
}

export async function getOneController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.getRequestById(req.params.id, req.user!));
  } catch (err) { next(err); }
}

export async function cancelController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.cancelRequest(req.params.id, req.user!.id));
  } catch (err) { next(err); }
}