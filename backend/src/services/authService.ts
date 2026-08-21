import { User } from '../models/User';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export async function login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
        throw new ApiError(401, 'Identifiants invalides');
    }
    const ok = await comparePassword(password, user.password);
    if(!ok) {
        throw new ApiError(401, 'Identifiants invalides');
    }
    const token = signToken({ sub: user.id, role: user.role });
    return {
        token,
        mustSetPassword: user.mustSetPassword,
        user: {
            id: user.id,
            firtstName: user.firstName,
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
