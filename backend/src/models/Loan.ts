import { Schema, model, Document, Types } from 'mongoose';

export enum EmploymentMode {
  SALARIED = 'Salaried',
  SELF_EMPLOYED = 'Self-Employed',
  UNEMPLOYED = 'Unemployed',
}

export enum LoanStatus {
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export interface ILoan extends Document {
  applicant: Types.ObjectId;
  
  // Personal & BRE Info
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  brePassed: boolean;
  breRejectionReason?: string;

  // Documents
  salarySlipUrl?: string;

  // Terms & Interest Math
  principalAmount: number;
  tenureDays: number;
  interestRate: number; // Fixed 12% p.a.
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;

  // Status Lifecycle
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    fullName: { type: String, required: true },
    pan: { type: String, required: true, uppercase: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: { 
      type: String, 
      enum: Object.values(EmploymentMode), 
      required: true 
    },
    brePassed: { type: Boolean, required: true, default: false },
    breRejectionReason: { type: String },

    salarySlipUrl: { type: String },

    principalAmount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true, default: 12 },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },

    status: { 
      type: String, 
      enum: Object.values(LoanStatus), 
      default: LoanStatus.APPLIED 
    },
    rejectionReason: { type: String },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = model<ILoan>('Loan', loanSchema);