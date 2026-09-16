export default function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPLIED: 'bg-amber-100 text-amber-800', SANCTIONED: 'bg-blue-100 text-blue-800',
    DISBURSED: 'bg-indigo-100 text-indigo-800', CLOSED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
}
