// src/controllers/opsController.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { Loan, LoanStatus } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { User, UserRole } from '../models/User.js';

// 1. Sales Module: Registered users who haven't applied yet
export const getSalesLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const appliedUserIds = await Loan.distinct('applicant');
    const leads = await User.find({ role: UserRole.BORROWER, _id: { $nin: appliedUserIds } }).select('-passwordHash');
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Sanction Module: Get APPLIED loans & review (Approve/Reject)
export const getSanctionLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: LoanStatus.APPLIED }).populate('applicant', 'name email');
    res.json(loans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const reviewSanction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'APPROVE' | 'REJECT'

    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== LoanStatus.APPLIED) {
      res.status(400).json({ message: 'Invalid loan or status' });
      return;
    }

    if (action === 'APPROVE') {
      loan.status = LoanStatus.SANCTIONED;
      loan.sanctionedAt = new Date();
    } else {
      loan.status = LoanStatus.REJECTED;
      loan.rejectionReason = rejectionReason || 'Rejected by sanction officer';
    }

    await loan.save();
    res.json(loan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Disbursement Module: Get SANCTIONED loans & release funds
export const getDisbursementLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: LoanStatus.SANCTIONED }).populate('applicant', 'name email');
    res.json(loans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const disburseLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== LoanStatus.SANCTIONED) {
      res.status(400).json({ message: 'Invalid loan status for disbursement' });
      return;
    }

    loan.status = LoanStatus.DISBURSED;
    loan.disbursedAt = new Date();
    await loan.save();
    res.json(loan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Collection Module: Record payment with unique UTR & auto-close check
export const getCollectionLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: LoanStatus.DISBURSED }).populate('applicant', 'name email');
    res.json(loans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User authentication required.' });
      return;
    }

    const { loanId } = req.params;
    const { utr, amount } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== LoanStatus.DISBURSED) {
      res.status(400).json({ message: 'Invalid loan for recording payment' });
      return;
    }

    const existingPayment = await Payment.findOne({ utr });
    if (existingPayment) {
      res.status(400).json({ message: 'UTR number already exists. Duplicate payment rejected.' });
      return;
    }

    const payment = await Payment.create({
      loan: loan._id,
      utr,
      amount: Number(amount),
      recordedBy: userId, // Guaranteed string, avoiding 'undefined'
    });

    loan.totalPaid += Number(amount);
    if (loan.totalPaid >= loan.totalRepayment) {
      loan.status = LoanStatus.CLOSED;
      loan.closedAt = new Date();
    }
    await loan.save();

    res.status(201).json({ payment, updatedLoan: loan });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};