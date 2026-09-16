'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Props = { children: ReactNode; allowedRoles: string[] };

function tokenIsValid(token: string | null) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    try {
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!tokenIsValid(token) || !user) throw new Error('Unauthenticated');
      if (!allowedRoles.includes(user.role)) {
        router.replace(user.role === 'Borrower' ? '/borrower/dashboard' : '/dashboard');
        return;
      }
      setAllowed(true);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [allowedRoles, router]);

  if (!allowed) return <div className="min-h-screen grid place-items-center text-sm text-slate-500">Checking access…</div>;
  return <>{children}</>;
}
