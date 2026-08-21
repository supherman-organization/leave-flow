import { isValidObjectId, Types } from 'mongoose';
import { LeaveRequest, LeaveType, DayPeriod } from '../models/LeaveRequest';
import { User } from '../models/User';
import { LeaveBalance } from '../models/LeaveBalance';
import { countLeaveDays } from '../utils/dateHelpers';
import { ApiError } from '../utils/ApiError';

type Requester = { id: string; role: string };

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
  if (overlap) throw new ApiError(409, 'Cette periode chevauche une demande existante');
  return LeaveRequest.create({ ...input, user: userId, days, status: 'pending' });
}

interface ListParams { page: number; limit: number; status?: string; type?: string; }

export async function listMyRequests(userId: string, { page, limit, status, type }: ListParams) {
  const filter: Record<string, unknown> = { user: userId };
  if (status) filter.status = status;
  if (type) filter.type = type;
  const total = await LeaveRequest.countDocuments(filter);
  const data = await LeaveRequest.find(filter)
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRequestById(id: string, requester: Requester) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const request = await LeaveRequest.findById(id)
    .populate('user', 'firstName lastName email team')
    .populate('reviewedBy', 'firstName lastName');
  if (!request) throw new ApiError(404, 'Demande introuvable');
  const ownerId = (request.user as unknown as { _id: { toString(): string } })._id.toString();
  const privileged = requester.role === 'hr' || requester.role === 'manager';
  if (ownerId !== requester.id && !privileged) throw new ApiError(403, 'Acces refuse a cette demande');
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

interface ListAllParams {
  page: number; limit: number;
  status?: string; type?: string; employee?: string; from?: string; to?: string;
}

export async function listAllRequests(requester: Requester, params: ListAllParams) {
  const { page, limit, status, type, employee, from, to } = params;
  const filter: Record<string, any> = {};

  if (requester.role === 'manager') {
    const team = await User.find({ manager: requester.id }).select('_id');
    const teamIds = team.map((u) => u._id);
    if (employee) {
      const inTeam = teamIds.some((id) => id.toString() === employee);
      if (!inTeam) return { data: [], total: 0, page, limit, totalPages: 0 };
      filter.user = employee;
    } else {
      filter.user = { $in: teamIds };
    }
  } else if (employee) {
    filter.user = employee;
  }

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (from || to) {
    filter.startDate = {};
    if (from) filter.startDate.$gte = new Date(from);
    if (to) filter.startDate.$lte = new Date(to);
  }

  const total = await LeaveRequest.countDocuments(filter);
  const data = await LeaveRequest.find(filter)
    .populate('user', 'firstName lastName email team')
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

function ensureTeam(requester: Requester, request: { user: any }) {
  if (requester.role === 'manager') {
    const managerId = request.user.manager?.toString();
    if (managerId !== requester.id) {
      throw new ApiError(403, "Cette demande n'appartient pas a votre equipe");
    }
  }
}

async function deductBalance(userId: Types.ObjectId, type: LeaveType, year: number, days: number) {
  if (type !== 'cp' && type !== 'rtt') return; // sans solde / maladie / formation : pas de decompte
  const balance = await LeaveBalance.findOne({ user: userId, year });
  if (!balance) throw new ApiError(400, `Aucun solde de conges pour l'annee ${year}`);
  const current = balance[type] as number;
  if (current < days) throw new ApiError(400, 'Solde insuffisant pour valider cette demande');
  (balance as any)[type] = current - days;
  await balance.save();
}

export async function approveRequest(id: string, requester: Requester) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const request = await LeaveRequest.findById(id).populate('user', 'manager firstName lastName');
  if (!request) throw new ApiError(404, 'Demande introuvable');
  if (request.status !== 'pending') throw new ApiError(400, 'Seule une demande en attente peut etre traitee');
  ensureTeam(requester, request as any);

  const year = new Date(request.startDate).getFullYear();
  await deductBalance((request.user as any)._id, request.type, year, request.days);

  request.status = 'approved';
  request.reviewedBy = requester.id as any;
  request.reviewedAt = new Date();
  await request.save();
  return request;
}

export async function refuseRequest(id: string, requester: Requester, managerComment: string) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const request = await LeaveRequest.findById(id).populate('user', 'manager firstName lastName');
  if (!request) throw new ApiError(404, 'Demande introuvable');
  if (request.status !== 'pending') throw new ApiError(400, 'Seule une demande en attente peut etre traitee');
  ensureTeam(requester, request as any);

  request.status = 'refused';
  request.managerComment = managerComment;
  request.reviewedBy = requester.id as any;
  request.reviewedAt = new Date();
  await request.save();
  return request;
}

export async function overrideStatus(id: string, status: string, managerComment?: string) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const request = await LeaveRequest.findById(id);
  if (!request) throw new ApiError(404, 'Demande introuvable');
  request.status = status as any;
  if (managerComment !== undefined) request.managerComment = managerComment;
  request.reviewedAt = new Date();
  await request.save();
  return request;
}