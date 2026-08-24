import type { LeaveType, LeaveStatus } from '../types/leave';
import type { Role } from '../types/user';

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  cp: 'Congés Payés', 
  rtt: 'RTT', 
  unpaid: 'Sans solde',
  sick: 'Maladie', 
  training: 'Formation',
};

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'En attente', 
  approved: 'Validé',
  refused: 'Refusé', 
  cancelled: 'Annulé',
};

export const STATUS_STYLES: Record<LeaveStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  refused: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employé',
   manager: 'Manager', 
   hr: 'RH',
};