import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  loan: Types.ObjectId;
  utr: string; // Must be unique across all payments
  amount: number;
  paidAt: Date;
  recordedBy: Types.ObjectId;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    utr: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', paymentSchema);