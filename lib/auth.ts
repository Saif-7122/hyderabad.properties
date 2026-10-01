/**
 * Admin session: a signed, httpOnly cookie "<email>|<expiry>|<hmac>".
 * Uses Web Crypto so it runs in both middleware (edge) and route handlers (node).
 */
export const ADMIN_COOKIE = 'hp_admin';
const TTL_SECONDS = 60 * 60 * 12;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') throw new Error('ADMIN_SESSION_SECRET must be set (16+ chars) in production.');
  return 'dev-only-session-secret-change-me';
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSessionToken(user: string): Promise<{ token: string; maxAge: number }> {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const body = `${encodeURIComponent(user)}|${exp}`;
  return { token: `${body}|${await hmac(body)}`, maxAge: TTL_SECONDS };
}

export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const parts = token.split('|');
  if (parts.length !== 3) return null;
  const [user, exp, sig] = parts;
  if (Number(exp) < Date.now() / 1000) return null;
  if (!safeEqual(sig, await hmac(`${user}|${exp}`))) return null;
  return decodeURIComponent(user);
}

/** Admin accounts from ADMIN_USERS="email:password,email2:password2" or a single ADMIN_PASSWORD. */
export function checkCredentials(email: string, password: string): string | null {
  const users = (process.env.ADMIN_USERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf(':');
      return { email: pair.slice(0, i).toLowerCase(), password: pair.slice(i + 1) };
    });
  const e = email.trim().toLowerCase();
  const match = users.find((u) => u.email === e);
  if (match) return safeEqual(match.password, password) ? e : null;

  const shared = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === 'production' ? undefined : 'admin');
  if (shared && safeEqual(shared, password)) return e || 'admin';
  return null;
}

/** Bearer token check for cron and machine callers. */
export function isCronAuthorized(authHeader: string | null): boolean {
  const s = process.env.CRON_SECRET;
  if (!s) return process.env.NODE_ENV !== 'production';
  return !!authHeader && safeEqual(authHeader, `Bearer ${s}`);
}
