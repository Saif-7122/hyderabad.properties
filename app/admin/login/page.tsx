'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { AelineButton } from '@/components/AelineButton';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'Sign in failed.');
      return;
    }
    const next = params.get('next');
    router.replace(next && next.startsWith('/admin') ? next : '/admin');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-[#E2E2E2] p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="space-y-2">
        <div className="w-11 h-11 rounded-xl bg-[#131313] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#D6FD70]" strokeWidth={2} />
        </div>
        <h1 className="font-heading font-extrabold text-2xl tracking-tight text-[#131313]">Review Desk</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#585858]">hyderabad.properties · staff only</p>
      </div>

      <label className="block space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#131313]">Email</span>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-[#E2E2E2] bg-[#F2F2F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6FD70] focus:border-[#131313]"
          placeholder="you@hoinvestors.com"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#131313]">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[#E2E2E2] bg-[#F2F2F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D6FD70] focus:border-[#131313]"
        />
      </label>

      {error && (
        <p role="alert" className="text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <AelineButton type="submit" variant="dark" disabled={busy} className="w-full">
        <span className="inline-flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" strokeWidth={2} />
          {busy ? 'Signing in' : 'Sign in'}
        </span>
      </AelineButton>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#F2F2F2]">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
