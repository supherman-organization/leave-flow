import { isValidObjectId } from 'mongoose';
import { User, Role } from '../models/User';
import { LeaveBalance } from '../models/LeaveBalance';
import { hashPassword, generateTempPassword } from '../utils/password';
import { ApiError } from '../utils/ApiError';

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

export async function listUsers({ page, limit, search, role }: ListParams) {
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const data = await User.find(filter)
    .select('-password')
    .populate('manager', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(id: string) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const user = await User.findById(id)
    .select('-password')
    .populate('manager', 'firstName lastName email');
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}

async function ensureManagerExists(managerId?: string | null) {
  if (!managerId) return;
  if (!isValidObjectId(managerId)) throw new ApiError(400, 'Manager invalide');
  const manager = await User.findById(managerId);
  if (!manager) throw new ApiError(400, 'Manager introuvable');
}

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  manager?: string;
  team?: string;
}) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Un compte existe deja avec cet email');

  await ensureManagerExists(input.manager);

  const tempPassword = generateTempPassword();
  const user = await User.create({
    ...input,
    password: await hashPassword(tempPassword),
    mustSetPassword: true,
    isActive: true,
  });

  await LeaveBalance.create({ user: user._id, year: new Date().getFullYear() });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      manager: user.manager,
      team: user.team,
      isActive: user.isActive,
    },
    temporaryPassword: tempPassword,
  };
}

export async function updateUser(id: string, updates: Record<string, unknown>) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  if ('manager' in updates) await ensureManagerExists(updates.manager as string | null);

  if (updates.email) {
    const dup = await User.findOne({
      email: (updates.email as string).toLowerCase(),
      _id: { $ne: id },
    });
    if (dup) throw new ApiError(409, 'Un compte existe deja avec cet email');
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    .select('-password')
    .populate('manager', 'firstName lastName email');
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}

export async function setUserStatus(id: string, isActive: boolean) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}

export async function resetUserPassword(id: string) {
  if (!isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide');
  const tempPassword = generateTempPassword();
  const user = await User.findByIdAndUpdate(
    id,
    { password: await hashPassword(tempPassword), mustSetPassword: true },
    { new: true }
  ).select('-password');
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return { temporaryPassword: tempPassword };
}