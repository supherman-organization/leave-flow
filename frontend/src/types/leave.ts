import type { UserSummary } from './user';

export type LeaveType = 'cp' | 'rtt' | 'unpaid' | 'sick' | 'training';
export type LeaveStatus = 'pending' | 'approved' | 'refused' | 'cancelled';
export type DayPeriod = 'morning' | 'afternoon';

export interface LeaveRequest {
    _id: string;
    user: UserSummary | string;  
    type: LeaveType;
    startDate: string;            
    endDate: string;
    startPeriod: DayPeriod;
    endPeriod: DayPeriod;
    days: number;
    comment?: string;
    managerComment?: string;
    justificatif?: string;
    status: LeaveStatus;
    reviewedBy?: UserSummary | string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}