"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusPill from "@/components/StatusPill";
import { api } from "@/lib/api";

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function BorrowerDashboard() {
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const res = await api.get("/loans/my");
      setLoans(res.data.loans);
      setPayments(res.data.payments);
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Unable to load your loan information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const active = loans.some((loan) =>
    ["APPLIED", "SANCTIONED", "DISBURSED"].includes(loan.status),
  );

  return (
    <ProtectedRoute allowedRoles={["Borrower"]}>
      <main className="mx-auto w-full max-w-7xl px-5 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              BORROWER PORTAL
            </p>
            <h1 className="text-3xl font-bold text-slate-900">My loans</h1>
            <p className="mt-1 text-slate-600">
              Track applications, repayments, and decisions in one place.
            </p>
          </div>
          {active ? (
            <button
              disabled
              className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
            >
              Application in progress
            </button>
          ) : (
            <Link
              href="/apply"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply for New Loan
            </Link>
          )}
        </div>
        {message && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}
        {active && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            You cannot submit another application while a loan is applied,
            sanctioned, or disbursed.
          </div>
        )}
        {loading ? (
          <p className="text-slate-500">Loading your loans…</p>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loans.map((loan) => {
                const progress = loan.totalRepayment
                  ? Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)
                  : 0;
                return (
                  <article
                    key={loan._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Loan application
                        </p>
                        <h2 className="font-semibold text-slate-900">
                          {money(loan.principalAmount)}
                        </h2>
                      </div>
                      <StatusPill status={loan.status} />
                    </div>
                    <dl className="grid grid-cols-2 gap-y-3 text-sm">
                      <div>
                        <dt className="text-slate-500">Interest</dt>
                        <dd className="font-medium">
                          {money(loan.interestAmount)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Repayment</dt>
                        <dd className="font-medium">
                          {money(loan.totalRepayment)}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-500">Remaining balance</dt>
                        <dd className="font-semibold text-slate-900">
                          {money(loan.totalRepayment - loan.totalPaid)}
                        </dd>
                      </div>
                    </dl>
                    {loan.status === "REJECTED" && (
                      <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <b>Decision reason:</b>{" "}
                        {loan.rejectionReason || "No reason was provided."}
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Repayment progress</span>
                        <span>{progress.toFixed(0)}% paid</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
            {!loans.length && (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                No applications yet.{" "}
                <Link className="font-semibold text-blue-600" href="/apply">
                  Start your first application.
                </Link>
              </div>
            )}
            <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-bold text-slate-900">Payment history</h2>
                <p className="text-sm text-slate-500">
                  Recorded UTR transactions across all of your loans.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">UTR</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-t">
                        <td className="p-3 font-mono">{payment.utr}</td>
                        <td className="p-3">
                          {new Date(payment.paidAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {money(payment.amount)}
                        </td>
                      </tr>
                    ))}
                    {!payments.length && (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-6 text-center text-slate-500"
                        >
                          No payments have been recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
