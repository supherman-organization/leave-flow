import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateTempPassword(): string {
    return 'Tmp-' + randomBytes(6).toString('base64url');
}