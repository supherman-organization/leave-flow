export type Role = 'employee' | 'manager' | 'hr';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustSetPassword: boolean;
  manager?: UserSummary | string | null;
  team?: string | null;
  loginHistory?: LoginEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSummary {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LoginEntry {
  date: string;
  ip?: string;
  userAgent?: string;
}