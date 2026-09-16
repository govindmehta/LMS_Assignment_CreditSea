// src/controllers/loanController.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { Loan, LoanStatus } from '../models/Loan.js';
import { evaluateBRE } from '../utils/bre.js';
import { calculateLoanDetails } from '../utils/loanMath.js';
import { Payment } from '../models/Payment.js';
import { SalarySlip } from '../models/SalarySlip.js';
import { UserRole } from '../models/User.js';
import { isValidObjectId } from 'mongoose';

export const getMyLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User authentication required.' });
      return;
    }
    const loans = await Loan.find({ applicant: userId }).sort({ createdAt: -1 }).lean();
    const payments = await Payment.find({ loan: { $in: loans.map((loan) => loan._id) } })
      .sort({ paidAt: -1 })
      .lean();
    res.status(200).json({ loans, payments });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: Validate Personal Details via BRE
export const checkEligibility = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const breResult = evaluateBRE(req.body);
    if (!breResult.passed) {
      res.status(400).json({ passed: false, reason: breResult.reason });
      return;
    }
    res.json({ passed: true, message: 'BRE checks passed successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Step 4: Create Loan Application
export const applyForLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User authentication required.' });
      return;
    }

    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode, principalAmount, tenureDays, salarySlipId, salarySlipUrl } = req.body;

    if (salarySlipId) {
      if (!isValidObjectId(salarySlipId) || !await SalarySlip.exists({ _id: salarySlipId, uploadedBy: userId })) {
        res.status(400).json({ message: 'The uploaded salary slip could not be found.' });
        return;
      }
    }

    const existingActiveLoan = await Loan.exists({
      applicant: userId,
      status: { $in: [LoanStatus.APPLIED, LoanStatus.SANCTIONED, LoanStatus.DISBURSED] },
    });
    if (existingActiveLoan) {
      res.status(400).json({ message: 'You already have an active loan application. New applications are unavailable until it is closed or rejected.' });
      return;
    }

    const breResult = evaluateBRE({ dateOfBirth, monthlySalary, pan, employmentMode });
    if (!breResult.passed) {
      res.status(400).json({ message: `BRE Check Failed: ${breResult.reason}` });
      return;
    }

    const math = calculateLoanDetails(Number(principalAmount), Number(tenureDays));

    const loan = await Loan.create({
      applicant: userId, // Guaranteed string, avoiding 'undefined'
      fullName,
      pan,
      dateOfBirth,
      monthlySalary,
      employmentMode,
      brePassed: true,
      salarySlipId,
      salarySlipUrl,
      principalAmount,
      tenureDays,
      interestRate: math.interestRate,
      interestAmount: math.interestAmount,
      totalRepayment: math.totalRepayment,
      status: LoanStatus.APPLIED,
    });

    res.status(201).json(loan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Step 3: Handle Salary Slip Upload
export const uploadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'User authentication required.' });
    return;
  }

  try {
    const salarySlip = await SalarySlip.create({
      uploadedBy: userId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
    });
    res.status(201).json({ salarySlipId: salarySlip._id.toString() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSalarySlip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'User authentication required.' });
      return;
    }
    if (!isValidObjectId(documentId)) {
      res.status(404).json({ message: 'Salary slip not found.' });
      return;
    }

    const salarySlip = await SalarySlip.findById(documentId);
    const canReview = req.user?.role === UserRole.SANCTION || req.user?.role === UserRole.ADMIN;
    if (!salarySlip || (!canReview && salarySlip.uploadedBy.toString() !== userId)) {
      res.status(404).json({ message: 'Salary slip not found.' });
      return;
    }

    res.set({
      'Content-Type': salarySlip.mimeType,
      'Content-Length': String(salarySlip.size),
      'Content-Disposition': `inline; filename="${salarySlip.originalName.replace(/["\\]/g, '_')}"`,
      'Cache-Control': 'private, no-store',
    });
    res.send(salarySlip.data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
