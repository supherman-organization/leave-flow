import api from './api';
import type { CalendarResponse } from '../types/calendar';

export async function getCalendar(month?: string, team?: string): Promise<CalendarResponse> {
    const { data } = await api.get<CalendarResponse>('/calendar', {
        params: { month: month || undefined, team: team || undefined },
    });
    return data;
}