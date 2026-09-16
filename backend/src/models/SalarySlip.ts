import { Schema, model, Document, Types } from 'mongoose';

export interface ISalarySlip extends Document {
  uploadedBy: Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  data: Buffer;
}

const salarySlipSchema = new Schema<ISalarySlip>(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

export const SalarySlip = model<ISalarySlip>('SalarySlip', salarySlipSchema);
