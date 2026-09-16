'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type User = { name: string; role: string };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); } catch { setUser(null); }
  }, [pathname]);

  if (!user || pathname === '/login' || pathname === '/signup') return null;
  const borrower = user.role === 'Borrower';
  const destination = borrower ? '/borrower/dashboard' : '/dashboard';
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.replace('/login'); };

  return <nav className="sticky top-0 z-20 border-b border-black/15 bg-[#f8f8f5]/85 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
      <Link href={destination} className="flex items-center gap-2 font-bold text-slate-900"><span className="grid h-7 w-7 place-items-center bg-black text-sm text-[#f4f1c8]">L</span> Loanline</Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href={destination} className="font-medium text-slate-700 hover:text-black">{borrower ? 'My Loans' : 'Ops Dashboard'}</Link>
        {borrower && <Link href="/apply" className="font-medium text-slate-700 hover:text-black">Apply</Link>}
        <span className="hidden border border-black/15 bg-white/50 px-3 py-1 text-slate-700 sm:inline">{user.name} · {user.role}</span>
        <button onClick={logout} className="outline-button px-3 py-1.5 font-medium">Logout</button>
      </div>
    </div>
  </nav>;
}
