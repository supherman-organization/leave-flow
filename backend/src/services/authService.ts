import { User } from '../models/User';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

interface LoginMeta {
  ip?: string;
  userAgent?: string;
}

export async function login(email: string, password: string, meta?: LoginMeta) {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Identifiants invalides');
  }
  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw new ApiError(401, 'Identifiants invalides');
  }

  if (meta) {
    const entry = { date: new Date(), ip: meta.ip, userAgent: meta.userAgent };
    user.loginHistory = [entry, ...(user.loginHistory || [])].slice(0, 5); // on garde les 5 dernieres
    await user.save();
  }

  const token = signToken({ sub: user.id, role: user.role });
  return {
    token,
    mustSetPassword: user.mustSetPassword,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
}

export async function setInitialPassword(userId: string, newPassword: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  user.password = await hashPassword(newPassword);
  user.mustSetPassword = false;
  await user.save();
}