import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, isCronAuthorized, verifySessionToken } from './auth';

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

/** Admin user from the session cookie, or "cron" for a valid CRON_SECRET bearer. */
export async function getCaller(req: Request): Promise<string | null> {
  const user = await verifySessionToken(readCookie(req.headers.get('cookie'), ADMIN_COOKIE));
  if (user) return user;
  if (req.headers.get('authorization') && isCronAuthorized(req.headers.get('authorization'))) return 'cron';
  return null;
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}
