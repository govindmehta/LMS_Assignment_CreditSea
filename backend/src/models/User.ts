import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  BORROWER = 'Borrower',
  ADMIN = 'Admin',
  SALES = 'Sales',
  SANCTION = 'Sanction',
  DISBURSEMENT = 'Disbursement',
  COLLECTION = 'Collection',
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.BORROWER 
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);