import { format, parseISO } from 'date-fns';
import type{ UserSummary } from '../types/user';

import { fr } from 'date-fns/locale';

export function formatDate(iso: string): string {
     return format(parseISO(iso), 'dd MMM yyyy', { locale: fr });
}

export function formatRange(startIso: string, endIso: string): string {
    const s = formatDate(startIso);
    const e = formatDate(endIso);
    return s === e ? s : `${s} — ${e}`;
}

export function formatDays(days: number): string {
     return `${days} ${days <= 1 ? 'jour' : 'jours'}`;
}

export function userName(user: UserSummary | string): string {
    if (typeof user === 'string') return '—';
    return `${user.firstName} ${user.lastName}`;
}