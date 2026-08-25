import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendar } from '../services/calendarService';
import { getApiError } from '../services/api';
import type { CalendarResponse } from '../types/calendar';
import type { LeaveType } from '../types/leave';
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS } from '../lib/constants';
import { userName } from '../lib/format';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Renvoie une clé "AAAA-MM-JJ" locale (sans décalage UTC)
function dayKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function GlobalCalendar() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0-11
    const [team, setTeam] = useState('');
    const [data, setData] = useState<CalendarResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const monthParam = `${year}-${String(month + 1).padStart(2, '0')}`;

    const load = useCallback(() => {
        setLoading(true);
        getCalendar(monthParam, team || undefined)
        .then(setData)
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setLoading(false));
    }, [monthParam, team]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, [load]);

    // Liste des équipes présentes dans les résultats (pour le filtre)
    const teams = useMemo(() => {
        const set = new Set<string>();
        data?.leaves.forEach((l) => {
        if (typeof l.user !== 'string' && l.user.team) set.add(l.user.team);
        });
        return Array.from(set).sort();
    }, [data]);

    // Index congés par jour + fériés par jour
    const { leavesByDay, holidaysByDay } = useMemo(() => {
        const leavesByDay = new Map<string, CalendarResponse['leaves']>();
        const holidaysByDay = new Map<string, string>();
        if (data) {
        data.leaves.forEach((l) => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            const cur = new Date(start);
            while (cur <= end) {
            const k = dayKey(cur);
            if (!leavesByDay.has(k)) leavesByDay.set(k, []);
            leavesByDay.get(k)!.push(l);
            cur.setDate(cur.getDate() + 1);
            }
        });
        data.holidays.forEach((h) => {
            holidaysByDay.set(dayKey(new Date(h.date)), h.name);
        });
        }
        return { leavesByDay, holidaysByDay };
    }, [data]);

  // Construction de la grille (semaines lundi→dimanche)
    const weeks = useMemo(() => {
        const first = new Date(year, month, 1);
        const startOffset = (first.getDay() + 6) % 7; // 0 si lundi
        const gridStart = new Date(year, month, 1 - startOffset);
        const days: Date[] = [];
        for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        days.push(d);
        }
        // 6 semaines de 7 jours
        return Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));
    }, [year, month]);

    function prevMonth() {
        if (month === 0) { setMonth(11); setYear(year - 1); }
        else setMonth(month - 1);
    }
    function nextMonth() {
        if (month === 11) { setMonth(0); setYear(year + 1); }
        else setMonth(month + 1);
    }

    const usedTypes = useMemo(() => {
        const set = new Set<LeaveType>();
        data?.leaves.forEach((l) => set.add(l.type));
        return Array.from(set);
    }, [data]);

    return (
        <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-slate-800">Calendrier Global</h1>
            <p className="text-sm text-slate-500">Vue d'ensemble des absences de l'équipe.</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
            <button onClick={prevMonth} className="rounded p-1 text-slate-500 hover:bg-slate-100"><ChevronLeft size={18} /></button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-slate-700">
                {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="rounded p-1 text-slate-500 hover:bg-slate-100"><ChevronRight size={18} /></button>
            </div>
        </div>

        {/* Filtre équipe + légende */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Équipe :</span>
            <select value={team} onChange={(e) => setTeam(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500">
                <option value="">Toutes les équipes</option>
                {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            </div>
            <div className="flex flex-wrap gap-3">
            {usedTypes.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${LEAVE_TYPE_COLORS[t]}`} />
                {LEAVE_TYPE_LABELS[t]}
                </span>
            ))}
            </div>
        </div>

        {/* Grille */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            {loading ? (
            <p className="p-5 text-sm text-slate-400">Chargement…</p>
            ) : (
            <>
                <div className="grid grid-cols-7 border-b border-slate-100 pb-2 text-center text-xs font-medium uppercase text-slate-400">
                {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7">
                {weeks.flat().map((d, i) => {
                    const inMonth = d.getMonth() === month;
                    const k = dayKey(d);
                    const dayLeaves = leavesByDay.get(k) ?? [];
                    const holiday = holidaysByDay.get(k);
                    const isToday = dayKey(d) === dayKey(today);
                    return (
                    <div key={i}
                        className={`min-h-[92px] border border-slate-50 p-1.5 ${inMonth ? '' : 'bg-slate-50/50'}`}>
                        <div className="flex items-center justify-between">
                        <span className={`text-xs ${inMonth ? 'text-slate-600' : 'text-slate-300'} ${isToday ? 'flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 font-semibold text-white' : ''}`}>
                            {d.getDate()}
                        </span>
                        {holiday && <span className="text-[10px] font-medium text-red-400" title={holiday}>Férié</span>}
                        </div>
                        <div className="mt-1 space-y-0.5">
                        {dayLeaves.slice(0, 3).map((l) => (
                            <div key={l._id}
                            className={`truncate rounded px-1 py-0.5 text-[10px] text-white ${LEAVE_TYPE_COLORS[l.type]}`}
                            title={`${userName(l.user)} · ${LEAVE_TYPE_LABELS[l.type]}`}>
                            {userName(l.user)}
                            </div>
                        ))}
                        {dayLeaves.length > 3 && (
                            <div className="text-[10px] text-slate-400">+{dayLeaves.length - 3}</div>
                        )}
                        </div>
                    </div>
                    );
                })}
                </div>
            </>
            )}
        </div>
        </div>
    );
}