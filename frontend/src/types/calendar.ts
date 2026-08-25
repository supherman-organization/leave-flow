import type { LeaveRequest } from './leave';

export interface Holiday {
    _id: string;
    date: string;
    name: string;
}

export interface CalendarResponse {
    month: string;          // "AAAA-MM"
    leaves: LeaveRequest[];
    holidays: Holiday[];
}