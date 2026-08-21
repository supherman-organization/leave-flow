import { isValidObjectId } from 'mongoose';
import { LeaveRequest, LeaveType, DayPeriod } from '../models/LeaveRequest';
import { countLeaveDays } from '../utils/dateHelpers';
import { ApiError } from '../utils/ApiError';

interface CreateInput {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  startPeriod: DayPeriod;
  endPeriod: DayPeriod;
  comment?: string;
  justificatif?: string;
}

export async function createLeaveRequest(userId: string, input: CreateInput) {
  const { startDate, endDate, startPeriod, endPeriod } = input;

  if (endDate < startDate) {
    throw new ApiError(400, 'La date de fin est anterieure a la date de debut');
  }

  const days = countLeaveDays(startDate, endDate, startPeriod, endPeriod);
  if (days <= 0) {
    throw new ApiError(400, 'La duree demandee est nulle (week-end ou demi-journees incoherentes)');
  }

  const overlap = await LeaveRequest.findOne({
    user: userId,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
  if (overlap) {
    throw new ApiError(409, 'Cette periode chevauche une demande existante');
  }

  return LeaveRequest.create({ ...input, user: userId, days, status: 'pending' });
}

interface ListParams {
  page: number;
  limit: number;
  status?: string;
  type?: string;
}

export async function listMyRequests(userId: string, { page, limit, status, type }: ListParams) {
  const filter: Record<string, unknown> = { user: userId };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const total = await LeaveRequest.countDocuments(filter);
  const data = await LeaveRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRequestById(id: string, requester: { id: string; role: string }) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const request = await LeaveRequest.findById(id)
    .populate('user', 'firstName lastName email team')
    .populate('reviewedBy', 'firstName lastName');
  if (!request) throw new ApiError(404, 'Demande introuvable');

  const ownerId = (request.user as unknown as { _id: { toString(): string } })._id.toString();
  const privileged = requester.role === 'hr' || requester.role === 'manager';
  if (ownerId !== requester.id && !privileged) {
    throw new ApiError(403, 'Acces refuse a cette demande');
  }
  return request;
}

export async function cancelRequest(id: string, userId: string) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const request = await LeaveRequest.findById(id);
  if (!request) throw new ApiError(404, 'Demande introuvable');
  if (request.user.toString() !== userId) {
    throw new ApiError(403, 'Vous ne pouvez annuler que vos propres demandes');
  }
  if (request.status !== 'pending') {
    throw new ApiError(400, 'Seule une demande en attente peut etre annulee');
  }
  request.status = 'cancelled';
  await request.save();
  return request;
}