//adding .js due to config conflict between tsconfig and package.json
import { EmploymentMode } from '../models/Loan.js';

export interface BREResult {
  passed: boolean;
  reason?: string;
}

// Standard Indian PAN format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function evaluateBRE(data: {
  dateOfBirth: Date | string;
  monthlySalary: number;
  pan: string;
  employmentMode: EmploymentMode;
}): BREResult {
  const dob = new Date(data.dateOfBirth);
  const ageDifMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  // Rule 1: Age check (23 - 50 years)
  if (age < 23 || age > 50) {
    return { passed: false, reason: `Age must be between 23 and 50 years old. Current age: ${age}` };
  }

  // Rule 2: Minimum Salary check (>= 25,000)
  if (data.monthlySalary < 25000) {
    return { passed: false, reason: 'Monthly salary must be at least ₹25,000.' };
  }

  // Rule 3: Valid PAN Format
  if (!PAN_REGEX.test(data.pan.toUpperCase())) {
    return { passed: false, reason: 'Invalid PAN card format. Expected 5 letters, 4 numbers, 1 letter.' };
  }

  // Rule 4: Employment check
  if (data.employmentMode === EmploymentMode.UNEMPLOYED) {
    return { passed: false, reason: 'Unemployed applicants are not eligible for a loan.' };
  }

  return { passed: true };
}