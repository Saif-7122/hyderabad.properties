'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { LiveSnapshot, MicroMarketLive, ProjectAlertItem, ProjectSafetyItem } from '@/lib/mock-data';

const CHANNEL = 'hp-live-updates';
const POLL_MS = 30_000;

interface LiveDataValue {
  projects: ProjectSafetyItem[];
  markets: MicroMarketLive[];
  alerts: ProjectAlertItem[];
  version: string;
  refresh: () => Promise<void>;
  getProject: (id: string) => ProjectSafetyItem | undefined;
  alertsFor: (projectId: string) => ProjectAlertItem[];
  marketFor: (project: ProjectSafetyItem) => MicroMarketLive | undefined;
}

const LiveDataContext = createContext<LiveDataValue | null>(null);

/** Tell every open tab in this browser that live data changed (used by the admin desk). */
export function broadcastLiveUpdate() {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ type: 'refresh', at: Date.now() });
    bc.close();
  } catch {
    /* BroadcastChannel unavailable */
  }
}

export function LiveDataProvider({ initial, children }: { initial: LiveSnapshot; children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<LiveSnapshot>(initial);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      if (!res.ok) return;
      const next = (await res.json()) as LiveSnapshot;
      setSnapshot((prev) => (prev.version === next.version ? prev : next));
    } catch {
      /* offline: keep last good snapshot */
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = () => refresh();
    } catch {
      bc = null;
    }
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      bc?.close();
    };
  }, [refresh]);

  const value = useMemo<LiveDataValue>(() => {
    const byId = new Map(snapshot.projects.map((p) => [p.id, p]));
    return {
      projects: snapshot.projects,
      markets: snapshot.markets,
      alerts: snapshot.alerts,
      version: snapshot.version,
      refresh,
      getProject: (id) => byId.get(id),
      alertsFor: (projectId) => snapshot.alerts.filter((a) => a.projectId === projectId),
      marketFor: (project) =>
        snapshot.markets.find((m) => m.name === project.microMarket) ??
        snapshot.markets.find((m) => m.name.toLowerCase().includes(project.location.toLowerCase()) || project.microMarket.includes(m.name)),
    };
  }, [snapshot, refresh]);

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}

export function useLiveData(): LiveDataValue {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error('useLiveData must be used inside <LiveDataProvider>');
  return ctx;
}

/** "12 Sep 2026" from an ISO date or timestamp, in IST. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00+05:30` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}
