// apps/api/src/models/Calculation.ts
import { Schema, model, Document } from 'mongoose';

export interface ICalculation extends Document {
  userId?: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  longitude: number;
  latitude: number;
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  interpretation?: string;
  isFree: boolean;
  createdAt: Date;
}

const calculationSchema = new Schema<ICalculation>({
  userId: {
    type: String,
    index: true,
  },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  hour: { type: Number, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  bazi: {
    year: String,
    month: String,
    day: String,
    hour: String,
  },
  interpretation: String,
  isFree: { type: Boolean, default: false },
}, {
  timestamps: true,
});

calculationSchema.index({ userId: 1, createdAt: -1 });

export default model<ICalculation>('Calculation', calculationSchema);