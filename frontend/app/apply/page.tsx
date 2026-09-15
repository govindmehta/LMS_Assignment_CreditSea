'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  // Step 1: Auth / Personal Details
  const [formData, setFormData] = useState({
    fullName: '',
    pan: '',
    dateOfBirth: '',
    monthlySalary: 30000,
    employmentMode: 'Salaried',
  });

  // Step 2: Salary Slip Path
  const [salarySlipUrl, setSalarySlipUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Step 3: Loan Config Sliders
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [tenureDays, setTenureDays] = useState(90);

  // Live Loan Math Calculations (Fixed 12% p.a.)
  const annualRate = 12;
  const interestAmount = Math.round(((principalAmount * annualRate * tenureDays) / (365 * 100)) * 100) / 100;
  const totalRepayment = Math.round((principalAmount + interestAmount) * 100) / 100;

  // Step 1 BRE Verification
  const handleBRECheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/loans/check-bre', formData);
      setStep(2); // Proceed to document upload
    } catch (err: any) {
      setError(err.response?.data?.reason || err.response?.data?.message || 'BRE check failed');
    }
  };

  // Step 2 File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('salarySlip', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/loans/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSalarySlipUrl(res.data.fileUrl);
      setStep(3); // Proceed to loan configuration
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Final Step: Submit Application
  const handleFinalSubmit = async () => {
    setError('');
    try {
      await api.post('/loans/apply', {
        ...formData,
        salarySlipUrl,
        principalAmount,
        tenureDays,
      });
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit loan application');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Borrower Loan Application</h1>

      {/* Wizard Progress Indicator */}
      <div className="flex justify-between mb-8 border-b pb-4 text-sm font-medium">
        <span className={step >= 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}>1. Details & BRE</span>
        <span className={step >= 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}>2. Upload Slip</span>
        <span className={step >= 3 ? 'text-blue-600 font-bold' : 'text-gray-400'}>3. Configure Loan</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {step === 1 && (
        <form onSubmit={handleBRECheck} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PAN Card Number</label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="ABCDE1234F"
                className="w-full border p-2 rounded uppercase"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                required
                className="w-full border p-2 rounded"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                required
                className="w-full border p-2 rounded"
                value={formData.monthlySalary}
                onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employment Mode</label>
              <select
                className="w-full border p-2 rounded"
                value={formData.employmentMode}
                onChange={(e) => setFormData({ ...formData, employmentMode: e.target.value })}
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
            Verify Eligibility
          </button>
        </form>
      )}

      {/* STEP 2: Upload Salary Slip */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please upload your recent salary slip (PDF, JPG, or PNG, max 5MB).</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="w-full border p-2 rounded"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-blue-600">Uploading document...</p>}
        </div>
      )}

      {/* STEP 3: Loan Configuration Sliders */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Loan Amount: <span className="text-blue-600 font-bold">₹{principalAmount.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="range"
              min={50000}
              max={500000}
              step={5000}
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹50,000</span>
              <span>₹5,000,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tenure: <span className="text-blue-600 font-bold">{tenureDays} Days</span>
            </label>
            <input
              type="range"
              min={30}
              max={365}
              step={5}
              value={tenureDays}
              onChange={(e) => setTenureDays(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>30 Days</span>
              <span>365 Days</span>
            </div>
          </div>

          {/* Live Loan Interest Summary Panel */}
          <div className="p-4 bg-gray-50 border rounded-lg text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-semibold">12% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Interest:</span>
              <span className="font-semibold text-gray-900">₹{interestAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-base text-gray-900">
              <span>Total Repayment:</span>
              <span className="text-blue-600">₹{totalRepayment.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleFinalSubmit}
            className="w-full py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
          >
            Confirm & Apply Loan
          </button>
        </div>
      )}
    </div>
  );
}