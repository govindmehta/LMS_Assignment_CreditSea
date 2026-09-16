"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusPill from "@/components/StatusPill";

type Tab = "Sales" | "Sanction" | "Disbursement" | "Collection";
const tabs: Tab[] = ["Sales", "Sanction", "Disbursement", "Collection"];
const endpoint: Record<Tab, string> = {
  Sales: "/ops/sales",
  Sanction: "/ops/sanction",
  Disbursement: "/ops/disbursement",
  Collection: "/ops/collection",
};
const money = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

function OpsDashboard() {
  const [role, setRole] = useState("");
  const [tab, setTab] = useState<Tab>("Sales");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [slip, setSlip] = useState<string | null>(null);
  const [forms, setForms] = useState<
    Record<string, { utr: string; amount: string }>
  >({});
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setRole(user.role || "");
      if (tabs.includes(user.role)) setTab(user.role);
    } catch {}
  }, []);
  const load = async () => {
    if (!role) return;
    setLoading(true);
    setError("");
    try {
      setData((await api.get(endpoint[tab])).data);
    } catch (e: any) {
      setData([]);
      setError(e.response?.data?.message || "Could not load module data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    setPage(1);
  }, [role, tab]); // eslint-disable-line react-hooks/exhaustive-deps
  const records = useMemo(
    () =>
      data.filter(
        (x) =>
          `${x.fullName || x.name || ""} ${x.applicant?.email || x.email || ""} ${x.pan || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (status === "ALL" || x.status === status),
      ),
    [data, search, status],
  );
  const pageCount = Math.max(1, Math.ceil(records.length / 6));
  const rows = records.slice((page - 1) * 6, page * 6);
  const canAccess = (t: Tab) => role === "Admin" || role === t;
  const act = async (url: string, body: unknown, success: string) => {
    try {
      await api.post(url, body);
      setNotice(success);
      setError("");
      setReason("");
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Action failed.");
    }
  };
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <p className="text-sm font-semibold text-blue-700">OPERATIONS PORTAL</p>
      <h1 className="mb-6 text-3xl font-bold">Operations dashboard</h1>
      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mb-5 flex flex-wrap gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t}
            disabled={!canAccess(t)}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold ${tab === t ? "bg-blue-600 text-white" : canAccess(t) ? "text-slate-600 hover:bg-slate-100" : "cursor-not-allowed text-slate-300"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or PAN"
          className="min-w-64 flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="ALL">All statuses</option>
          {["APPLIED", "SANCTIONED", "DISBURSED", "CLOSED", "REJECTED"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </div>
      {loading ? (
        <p className="text-slate-500">Loading module data…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {tab === "Sales" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Lead</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr className="border-t" key={x._id}>
                    <td className="p-3 font-medium">{x.name}</td>
                    <td className="p-3">{x.email}</td>
                    <td className="p-3">
                      {new Date(x.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "Sanction" && (
            <div className="divide-y">
              {rows.map((x) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                  key={x._id}
                >
                  <div>
                    <div className="flex gap-2">
                      <b>{x.fullName}</b>
                      <StatusPill status={x.status} />
                    </div>
                    <p className="text-sm text-slate-600">
                      {x.pan} · {money(x.principalAmount)} · Salary{" "}
                      {money(x.monthlySalary)}
                    </p>
                    {x.salarySlipUrl && (
                      <button
                        onClick={() => setSlip(x.salarySlipUrl)}
                        className="mt-2 text-sm font-semibold text-blue-600"
                      >
                        Preview salary slip
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Rejection reason"
                      className="rounded border p-2 text-sm"
                    />
                    <button
                      onClick={() =>
                        act(
                          `/ops/sanction/${x._id}`,
                          { action: "APPROVE" },
                          "Loan sanctioned successfully.",
                        )
                      }
                      className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        act(
                          `/ops/sanction/${x._id}`,
                          { action: "REJECT", rejectionReason: reason },
                          "Loan rejected and reason saved.",
                        )
                      }
                      className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "Disbursement" && (
            <div className="divide-y">
              {rows.map((x) => (
                <div
                  className="flex items-center justify-between gap-4 p-4"
                  key={x._id}
                >
                  <div>
                    <b>{x.fullName}</b>
                    <p className="text-sm text-slate-600">
                      Sanctioned amount: {money(x.principalAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      act(
                        `/ops/disbursement/${x._id}`,
                        {},
                        "Loan disbursed successfully.",
                      )
                    }
                    className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Disburse funds
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "Collection" && (
            <div className="divide-y">
              {rows.map((x) => {
                const f = forms[x._id] || { utr: "", amount: "" };
                const remaining = x.totalRepayment - x.totalPaid;
                return (
                  <div className="p-4" key={x._id}>
                    <div className="mb-3 flex justify-between">
                      <div>
                        <b>{x.fullName}</b>
                        <p className="text-sm text-slate-600">
                          Total: {money(x.totalRepayment)} · Paid:{" "}
                          {money(x.totalPaid)} ·{" "}
                          <b>Remaining: {money(remaining)}</b>
                        </p>
                      </div>
                      <StatusPill status={x.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-lg bg-slate-50 p-3">
                      <input
                        value={f.utr}
                        onChange={(e) =>
                          setForms({
                            ...forms,
                            [x._id]: { ...f, utr: e.target.value },
                          })
                        }
                        placeholder="Unique UTR"
                        className="rounded border p-2 text-sm"
                      />
                      <input
                        type="number"
                        max={remaining}
                        value={f.amount}
                        onChange={(e) =>
                          setForms({
                            ...forms,
                            [x._id]: { ...f, amount: e.target.value },
                          })
                        }
                        placeholder="Amount"
                        className="rounded border p-2 text-sm"
                      />
                      <button
                        onClick={() =>
                          act(
                            `/ops/collection/${x._id}`,
                            { utr: f.utr, amount: Number(f.amount) },
                            "Payment recorded successfully.",
                          )
                        }
                        className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Record payment
                      </button>
                    </div>
                    {x.payments?.length > 0 && (
                      <div className="mt-3 text-sm">
                        <b>Previous payments</b>
                        {x.payments.map((p: any) => (
                          <p key={p._id} className="text-slate-600">
                            {p.utr} ·{" "}
                            {new Date(p.paidAt).toLocaleDateString("en-IN")} ·{" "}
                            {money(p.amount)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!rows.length && (
            <p className="p-8 text-center text-slate-500">
              No matching records.
            </p>
          )}
        </div>
      )}
      <div className="mt-4 flex justify-end gap-3 text-sm">
        <span>
          Page {page} of {pageCount}
        </span>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page === pageCount}
          onClick={() => setPage(page + 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
      {slip && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/60 p-5">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white">
            <div className="flex justify-between border-b p-3">
              <b>Salary slip preview</b>
              <button onClick={() => setSlip(null)} className="text-xl">
                ×
              </button>
            </div>
            <iframe
              src={`http://localhost:5000${slip}`}
              title="Salary slip"
              className="min-h-0 flex-1"
            />
          </div>
        </div>
      )}
    </main>
  );
}
export default function DashboardPage() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Admin",
        "Sales",
        "Sanction",
        "Disbursement",
        "Collection",
      ]}
    >
      <OpsDashboard />
    </ProtectedRoute>
  );
}
