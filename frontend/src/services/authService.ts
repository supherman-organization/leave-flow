import api from './api';
import  type{ AuthUser } from '../types/user';

export interface LoginResponse {
  token: string;
  mustSetPassword: boolean;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function setPassword(newPassword: string): Promise<void> {
  await api.post('/auth/set-password', { newPassword });
}