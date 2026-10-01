import { AppShell } from '@/components/AppShell';
import { LiveDataProvider } from '@/components/live/LiveDataProvider';
import { getSnapshotSafe } from '@/lib/data/snapshot';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const snapshot = await getSnapshotSafe();
  return (
    <LiveDataProvider initial={snapshot}>
      <AppShell />
    </LiveDataProvider>
  );
}
