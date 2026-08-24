import api from './api';
import type { LeaveRequest } from '../types/leave';
import type { Paginated } from '../types/api';

export interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export async function createRequest(formData: FormData): Promise<LeaveRequest> {
  const { data } = await api.post<LeaveRequest>('/leave-requests', formData);
  return data;
}

export async function listMine(params: ListParams): Promise<Paginated<LeaveRequest>> {
  const { data } = await api.get<Paginated<LeaveRequest>>('/leave-requests/mine', { params });
  return data;
}

export async function getOne(id: string): Promise<LeaveRequest> {
  const { data } = await api.get<LeaveRequest>(`/leave-requests/${id}`);
  return data;
}

export async function cancelRequest(id: string): Promise<LeaveRequest> {
  const { data } = await api.patch<LeaveRequest>(`/leave-requests/${id}/cancel`);
  return data;
}