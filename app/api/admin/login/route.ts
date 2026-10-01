import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, checkCredentials, createSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const user = checkCredentials(body.email ?? '', body.password ?? '');
  if (!user) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Wrong email or password.' }, { status: 401 });
  }
  const { token, maxAge } = await createSessionToken(user);
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
  return res;
}
