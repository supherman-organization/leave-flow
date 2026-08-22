import { LeaveRequest } from '../models/LeaveRequest';
import { Holiday } from '../models/Holiday';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';

export async function getCalendar(month?: string, team?: string) {
  const now = new Date();
  let year = now.getFullYear();
  let m = now.getMonth(); // 0-based

  if (month) {
    const [y, mm] = month.split('-');
    year = Number(y);
    m = Number(mm) - 1;
    if (Number.isNaN(year) || Number.isNaN(m) || m < 0 || m > 11) {
      throw new ApiError(400, 'Mois invalide (format attendu : AAAA-MM)');
    }
  }

  const start = new Date(Date.UTC(year, m, 1));
  const end = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59));

  const filter: Record<string, unknown> = {
    status: 'approved',
    startDate: { $lte: end },
    endDate: { $gte: start },
  };
  if (team) {
    const members = await User.find({ team }).select('_id');
    filter.user = { $in: members.map((u) => u._id) };
  }

  const leaves = await LeaveRequest.find(filter)
    .populate('user', 'firstName lastName team')
    .sort({ startDate: 1 });

  const holidays = await Holiday.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 });

  return { month: `${year}-${String(m + 1).padStart(2, '0')}`, leaves, holidays };
}