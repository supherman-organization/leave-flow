import api from './api';
import  type{ User } from '../types/user';
import type { LeaveBalance } from '../types/balance';

export interface ProfileResponse {
    user: User;
    balance: LeaveBalance;
}

export async function getProfile(): Promise<ProfileResponse> {
    const { data } = await api.get<ProfileResponse>('/profile');
    return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/profile/password', { currentPassword, newPassword });
}