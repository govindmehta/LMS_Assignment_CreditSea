'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [role, setRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Sales' | 'Sanction' | 'Disbursement' | 'Collection'>('Sales');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for operations actions
  const [rejectionReason, setRejectionReason] = useState('');
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role);
      // Default initial tab matching user role
      if (['Sales', 'Sanction', 'Disbursement', 'Collection'].includes(user.role)) {
        setActiveTab(user.role);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpointMap = {
        Sales: '/ops/sales',
        Sanction: '/ops/sanction',
        Disbursement: '/ops/disbursement',
        Collection: '/ops/collection',
      };
      const res = await api.get(endpointMap[activeTab]);
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) fetchData();
  }, [activeTab, role]);

  // Sanction Approve/Reject Action
  const handleSanctionAction = async (loanId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/ops/sanction/${loanId}`, { action, rejectionReason });
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  // Disbursement Action
  const handleDisburse = async (loanId: string) => {
    try {
      await api.post(`/ops/disbursement/${loanId}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Disbursement failed');
    }
  };

  // Collection Action (Payment Record)
  const handleRecordPayment = async (loanId: string) => {
    if (!utr || !amount) {
      alert('Please provide UTR and Payment Amount');
      return;
    }
    try {
      await api.post(`/ops/collection/${loanId}`, { utr, amount: Number(amount) });
      setUtr('');
      setAmount('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  const isTabAccessible = (tabRole: string) => role === 'Admin' || role === tabRole;

  return (
    <div className="max-w-6xl mx-auto my-10 p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          Role: {role}
        </span>
      </div>

      {/* RBAC Tab Navigation Bar */}
      <div className="flex space-x-2 border-b mb-6">
        {(['Sales', 'Sanction', 'Disbursement', 'Collection'] as const).map((tab) => {
          const accessible = isTabAccessible(tab);
          return (
            <button
              key={tab}
              disabled={!accessible}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-sm font-medium rounded-t-lg ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : accessible
                  ? 'text-gray-600 hover:text-blue-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {tab} Module
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading module data...</p>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          {/* TAB 1: SALES */}
          {activeTab === 'Sales' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3">Lead Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {data.map((lead: any) => (
                  <tr key={lead._id} className="border-b">
                    <td className="p-3 font-medium">{lead.name}</td>
                    <td className="p-3">{lead.email}</td>
                    <td className="p-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: SANCTION */}
          {activeTab === 'Sanction' && (
            <div className="divide-y">
              {data.map((loan: any) => (
                <div key={loan._id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{loan.fullName} ({loan.pan})</h3>
                    <p className="text-sm text-gray-600">
                      Amount: ₹{loan.principalAmount.toLocaleString('en-IN')} | Salary: ₹{loan.monthlySalary.toLocaleString('en-IN')}
                    </p>
                    {loan.salarySlipUrl && (
                      <a
                        href={`http://localhost:5000${loan.salarySlipUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline mt-1 inline-block"
                      >
                        📄 View Uploaded Salary Slip
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Rejection Reason"
                      className="border text-xs p-1.5 rounded"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <button
                      onClick={() => handleSanctionAction(loan._id, 'APPROVE')}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleSanctionAction(loan._id, 'REJECT')}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DISBURSEMENT */}
          {activeTab === 'Disbursement' && (
            <div className="divide-y">
              {data.map((loan: any) => (
                <div key={loan._id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{loan.fullName}</h3>
                    <p className="text-sm text-gray-600">
                      Sanctioned Amount: ₹{loan.principalAmount.toLocaleString('en-IN')} | Status: {loan.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisburse(loan._id)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                  >
                    Disburse Funds
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: COLLECTION */}
          {activeTab === 'Collection' && (
            <div className="divide-y">
              {data.map((loan: any) => (
                <div key={loan._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{loan.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        Total Repayment: ₹{loan.totalRepayment.toLocaleString('en-IN')} | Total Paid: ₹{loan.totalPaid.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs font-medium text-amber-600">
                        Remaining Balance: ₹{(loan.totalRepayment - loan.totalPaid).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border">
                    <input
                      type="text"
                      placeholder="Unique UTR Number"
                      className="border text-xs p-2 rounded w-1/3"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      className="border text-xs p-2 rounded w-1/3"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <button
                      onClick={() => handleRecordPayment(loan._id)}
                      className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 w-1/3"
                    >
                      Record Repayment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}