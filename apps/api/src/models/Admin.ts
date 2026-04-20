// apps/api/src/models/Admin.ts
import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
}, {
  timestamps: true,
});

export default model<IAdmin>('Admin', adminSchema);