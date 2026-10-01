import { eq } from 'drizzle-orm';
import type { DB } from './db/client';
import { notifications, watchSubscriptions, type ProjectAlertRow, type ProjectRow } from './db/schema';

function siteUrl(): string {
  const u = process.env.PUBLIC_SITE_URL ?? process.env.APP_URL;
  return u && !u.startsWith('MY_') ? u.replace(/\/$/, '') : 'https://hyderabad.properties';
}

export function alertMessage(project: Pick<ProjectRow, 'id' | 'name'>, alert: Pick<ProjectAlertRow, 'whatChanged' | 'whatItMeans'>) {
  const link = `${siteUrl()}/project?id=${encodeURIComponent(project.id)}`;
  const text = [
    `hyderabad.properties alert: ${project.name}`,
    `What changed: ${alert.whatChanged}`,
    `What it means: ${alert.whatItMeans}`,
    `Full report: ${link}`,
  ].join('\n');
  return { text, link };
}

async function sendWhatsApp(to: string, text: string, meta: Record<string, unknown>): Promise<'sent' | 'logged'> {
  const url = process.env.WHATSAPP_WEBHOOK_URL;
  if (!url) return 'logged';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.WHATSAPP_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.WHATSAPP_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ to, text, template: process.env.WHATSAPP_TEMPLATE_NAME ?? 'project_alert', ...meta }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`WhatsApp webhook ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return 'sent';
}

async function sendEmail(to: string, subject: string, text: string): Promise<'sent' | 'logged'> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return 'logged';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: process.env.ALERT_EMAIL_FROM ?? 'hyderabad.properties <alerts@hyderabad.properties>',
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return 'sent';
}

/**
 * Fan an approved alert out to everyone watching the project.
 * Every attempt is recorded in the notifications table. Without provider keys
 * the message is logged rather than sent, so the flow is testable end to end.
 */
export async function notifyWatchers(db: DB, project: ProjectRow, alert: ProjectAlertRow) {
  const subs = await db.select().from(watchSubscriptions).where(eq(watchSubscriptions.projectId, project.id));
  const { text, link } = alertMessage(project, alert);
  const result = { sent: 0, logged: 0, failed: 0 };

  await Promise.all(
    subs.map(async (s) => {
      let status: 'sent' | 'logged' | 'failed' = 'logged';
      let error: string | null = null;
      try {
        status =
          s.channel === 'whatsapp'
            ? await sendWhatsApp(s.contact, text, { projectId: project.id, alertId: alert.id, link })
            : await sendEmail(s.contact, `${project.name}: ${alert.type}`, text);
      } catch (err) {
        status = 'failed';
        error = (err as Error).message;
      }
      result[status]++;
      await db.insert(notifications).values({
        alertId: alert.id,
        subscriptionId: s.id,
        channel: s.channel,
        contact: s.contact,
        status,
        error,
      });
    })
  );
  return { subscribers: subs.length, ...result };
}
