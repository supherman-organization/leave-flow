import { LeaveRequest } from '../models/LeaveRequest';
import { LeaveBalance } from '../models/LeaveBalance';
import { User } from '../models/User';

type Requester = { id: string; role: string };

export async function getDashboard(requester: Requester) {
  const year = new Date().getFullYear();
  const now = new Date();

  const balance = await LeaveBalance.findOne({ user: requester.id, year });
  const myPendingCount = await LeaveRequest.countDocuments({ user: requester.id, status: 'pending' });
  const recentRequests = await LeaveRequest.find({ user: requester.id })
    .sort({ createdAt: -1 }).limit(5);
  const upcomingLeaves = await LeaveRequest.find({
    user: requester.id, status: 'approved', endDate: { $gte: now },
  }).sort({ startDate: 1 }).limit(5);

  const result: Record<string, unknown> = {
    role: requester.role,
    balance: balance ? { cp: balance.cp, rtt: balance.rtt, year } : { cp: 0, rtt: 0, year },
    myPendingCount,
    recentRequests,
    upcomingLeaves,
  };

  // Info supplementaire pour les valideurs
  if (requester.role === 'manager' || requester.role === 'hr') {
    const reviewFilter: Record<string, unknown> = { status: 'pending' };
    if (requester.role === 'manager') {
      const team = await User.find({ manager: requester.id }).select('_id');
      reviewFilter.user = { $in: team.map((u) => u._id) };
    }
    result.pendingToReview = await LeaveRequest.countDocuments(reviewFilter);
  }

  return result;
}