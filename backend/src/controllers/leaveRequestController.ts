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
    res.json(await service.listMyRequests(req.user!.id, {
      page, limit,
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
    }));
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

export async function listAllController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    res.json(await service.listAllRequests(req.user!, {
      page, limit,
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      employee: req.query.employee as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    }));
  } catch (err) { next(err); }
}

export async function approveController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.approveRequest(req.params.id, req.user!));
  } catch (err) { next(err); }
}

export async function refuseController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.refuseRequest(req.params.id, req.user!, req.body.managerComment));
  } catch (err) { next(err); }
}

export async function overrideController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.overrideStatus(req.params.id, req.body.status, req.body.managerComment));
  } catch (err) { next(err); }
}