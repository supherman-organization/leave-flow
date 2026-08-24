import type { LeaveRequest } from './leave';
import type { LeaveBalance } from './balance';
import type { Role } from './user';
export interface DashboardResponse {
  role: Role;
  balance: LeaveBalance;
  myPendingCount: number;
  recentRequests: LeaveRequest[];
  upcomingLeaves: LeaveRequest[];
  pendingToReview?: number;     // manager/hr uniquement
}