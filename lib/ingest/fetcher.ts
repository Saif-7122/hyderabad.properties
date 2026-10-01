import { createHash } from 'node:crypto';

export function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

const UA =
  process.env.INGEST_USER_AGENT ??
  'hyderabad.properties-verifier/1.0 (+https://hyderabad.properties; regulatory monitoring)';

export interface FetchedDoc {
  url: string;
  contentType: string;
  text: string;
  html?: string;
  hash: string;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<input[^>]*type=["']?hidden[^>]*>/gi, ' ') // ASP.NET viewstate churns every request
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

/** Absolute links to PDFs found on a page. */
export function extractPdfLinks(html: string, baseUrl: string): { url: string; label: string }[] {
  const out: { url: string; label: string }[] = [];
  const re = /<a[^>]+href=["']([^"']+?\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const url = new URL(m[1], baseUrl).toString();
      const label = htmlToText(m[2]).slice(0, 160) || url.split('/').pop() || 'Document';
      if (!out.some((o) => o.url === url)) out.push({ url, label });
    } catch {
      /* ignore malformed */
    }
  }
  return out;
}

export async function fetchDoc(url: string, timeoutMs = 25_000): Promise<FetchedDoc> {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8' },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('pdf') || url.toLowerCase().split('?')[0].endsWith('.pdf')) {
    const buf = new Uint8Array(await res.arrayBuffer());
    const { extractText, getDocumentProxy } = await import('unpdf');
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    const t = Array.isArray(text) ? text.join('\n') : text;
    return { url, contentType: 'application/pdf', text: t, hash: sha256(t) };
  }

  const html = await res.text();
  const text = htmlToText(html);
  return { url, contentType, text, html, hash: sha256(text) };
}
