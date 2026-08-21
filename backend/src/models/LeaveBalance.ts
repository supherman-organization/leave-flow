import mongoose, { Schema, Types } from 'mongoose';

export interface ILeaveBalance {
  user: Types.ObjectId;
  year: number;
  cp: number;   // congés payés restants
  rtt: number;  // RTT restants
}

const leaveBalanceSchema = new Schema<ILeaveBalance>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  cp: { type: Number, default: 25 },
  rtt: { type: Number, default: 12 },
});

leaveBalanceSchema.index({ user: 1, year: 1 }, { unique: true });

export const LeaveBalance = mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);