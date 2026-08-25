import api from './api';
import type { User, Role } from '../types/user';
import type { Paginated } from '../types/api';

export interface ListUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
}

export interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    manager?: string;
    team?: string;
}

export interface CreateUserResponse {
    user: User;
    temporaryPassword: string;
}

export async function listUsers(params: ListUsersParams): Promise<Paginated<User>> {
    const { data } = await api.get<Paginated<User>>('/users', { params });
    return data;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResponse> {
    const { data } = await api.post<CreateUserResponse>('/users', input);
    return data;
}

export async function updateUser(id: string, updates: Partial<CreateUserInput>): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, updates);
    return data;
}

export async function setUserStatus(id: string, isActive: boolean): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}/status`, { isActive });
    return data;
}

export async function resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
    const { data } = await api.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`);
    return data;
}