'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-16">
      <section className="grid w-full overflow-hidden border border-black/20 bg-white/45 md:grid-cols-[1.1fr_.9fr]">
        <div className="p-8 md:p-14"><p className="eyebrow mb-8">LOAN MANAGEMENT · 2026</p><h1 className="max-w-xl text-5xl font-bold tracking-[-.06em] text-black md:text-7xl">Money, made <span className="bg-[#f3f0c9] px-2">clear.</span></h1><p className="my-8 max-w-md text-lg leading-relaxed text-slate-600">A calm, transparent workspace for borrowers and loan operations teams.</p>
      <div className="flex flex-wrap gap-3">
        <Link 
          href="/login" 
          className="ink-button px-6 py-3 font-semibold"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="outline-button px-6 py-3 font-semibold"
        >
          Sign Up as Borrower
        </Link>
      </div></div>
      <aside className="border-t border-black/15 bg-[#f3f0c9]/60 p-8 md:border-l md:border-t-0 md:p-14"><p className="eyebrow mb-7">QUICK ACCESS</p><h2 className="text-3xl font-bold tracking-tight">A single place for every loan decision.</h2><div className="mt-10 border border-black bg-white/45 p-4 text-left text-xs text-gray-600">
        <p className="font-bold mb-1 text-gray-700">Seeded Role Test Credentials (Password: Password123!):</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>borrower@lms.com (Borrower)</li>
          <li>sales@lms.com (Sales Exec)</li>
          <li>sanction@lms.com (Sanction Officer)</li>
          <li>disbursement@lms.com (Disbursement Exec)</li>
          <li>collection@lms.com (Collection Exec)</li>
          <li>admin@lms.com (Admin)</li>
        </ul>
      </div></aside></section>
    </main>
  );
}
