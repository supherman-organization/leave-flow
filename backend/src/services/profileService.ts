import { User } from '../models/User';
import { LeaveBalance } from '../models/LeaveBalance';
import { comparePassword, hashPassword } from '../utils/password';
import { ApiError } from '../utils/ApiError';

export async function getProfile(userId: string) {
  const user = await User.findById(userId)
    .select('-password')
    .populate('manager', 'firstName lastName email');
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');

  const year = new Date().getFullYear();
  const balance = await LeaveBalance.findOne({ user: userId, year });

  return {
    user,
    balance: balance ? { cp: balance.cp, rtt: balance.rtt, year } : { cp: 0, rtt: 0, year },
  };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');

  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) throw new ApiError(400, 'Mot de passe actuel incorrect');

  user.password = await hashPassword(newPassword);
  user.mustSetPassword = false;
  await user.save();
}