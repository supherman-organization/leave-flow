import { Request, Response, NextFunction } from 'express';
import * as service from '../services/calendarService';

export async function getCalendarController(req: Request, res: Response, next: NextFunction) {
  try {
    const month = req.query.month as string | undefined;
    const team = req.query.team as string | undefined;
    res.json(await service.getCalendar(month, team));
  } catch (err) { next(err); }
}
