export type DayPeriod = 'morning' | 'afternoon';

export function countLeaveDays(
    start: Date,
    end: Date,
    startPeriod: DayPeriod,
    endPeriod: DayPeriod
): number {
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(0, 0, 0, 0);
    if (e < s) return 0;

    let weekdays = 0;
    const cur = new Date(s);
    while (cur <= e) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) weekdays++;
        cur.setDate(cur.getDate() + 1);
    }
    if (weekdays === 0) return 0;

    let days = weekdays;
    const startIsWeekday = s.getDay() !== 0 && s.getDay() !== 6;
    const endIsWeekday = e.getDay() !== 0 && e.getDay() !== 6;
    if (startIsWeekday && startPeriod === 'afternoon') days -= 0.5;
    if (endIsWeekday && endPeriod === 'morning') days -= 0.5;

    return days;
}