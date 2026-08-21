import mongoose, { Schema, Document, Types } from 'mongoose';

export type LeaveType = 'cp' | 'rtt' | 'unpaid' | 'sick' | 'training';
export type LeaveStatus = 'pending' | 'approved' | 'refused' | 'cancelled';
export type DayPeriod = 'morning' | 'afternoon';

export interface ILeaveRequest extends Document {
  user: Types.ObjectId;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  startPeriod: DayPeriod;
  endPeriod: DayPeriod;
  days: number;
  comment?: string;
  managerComment?: string;
  justificatif?: string;
  status: LeaveStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['cp', 'rtt', 'unpaid', 'sick', 'training'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startPeriod: { type: String, enum: ['morning', 'afternoon'], default: 'morning' },
    endPeriod: { type: String, enum: ['morning', 'afternoon'], default: 'afternoon' },
    days: { type: Number, required: true },
    comment: { type: String },
    managerComment: { type: String },
    justificatif: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'refused', 'cancelled'], default: 'pending' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ user: 1, status: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);