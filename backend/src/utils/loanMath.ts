export function calculateLoanDetails(principal: number, tenureDays: number, annualRate: number = 12) {
  // Simple Interest formula: (P * R * T) / (365 * 100)
  const interestAmount = Math.round(((principal * annualRate * tenureDays) / (365 * 100)) * 100) / 100;
  const totalRepayment = Math.round((principal + interestAmount) * 100) / 100;

  return {
    interestRate: annualRate,
    interestAmount,
    totalRepayment,
  };
}