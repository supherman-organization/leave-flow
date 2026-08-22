import mongoose, { Schema } from 'mongoose';

export interface IHoliday {
  date: Date;
  name: string;
}

const holidaySchema = new Schema<IHoliday>({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
});

export const Holiday = mongoose.model<IHoliday>('Holiday', holidaySchema);