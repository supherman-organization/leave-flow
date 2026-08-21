import mongoose, { Schema, Document, Types } from 'mongoose';

export type Role = 'employee' | 'manager' | 'hr';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  mustSetPassword: boolean;
  manager?: Types.ObjectId;
  team?: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager', 'hr'], default: 'employee' },
    isActive: { type: Boolean, default: true },
    mustSetPassword: { type: Boolean, default: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    team: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);