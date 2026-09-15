// src/controllers/loanController.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { Loan, LoanStatus } from '../models/Loan.js';
import { evaluateBRE } from '../utils/bre.js';
import { calculateLoanDetails } from '../utils/loanMath.js';

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

    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode, principalAmount, tenureDays, salarySlipUrl } = req.body;

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
export const uploadFile = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
};