'use client';

import React from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Check, 
  Clock, 
  MessageSquare, 
  Mail, 
  Trash2, 
  AlertCircle, 
  PhoneCall, 
  Building2,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ViewType } from '@/components/TopBar';
import { ProjectSafetyItem } from '@/lib/mock-data';
import { SafetyBadge } from '@/components/SafetyBadge';

export interface WatchedProjectItem {
  project: ProjectSafetyItem;
  channel: 'whatsapp' | 'email';
  contact: string;
  watchedAt: string;
  lastChecked: string;
  hasChanged?: boolean;
  changeNote?: string;
  changeTimestamp?: string;
}

export interface WatchedAlertPreview {
  id: string;
  projectName: string;
  changeType: 'Registration lapsed' | 'Penalty added' | 'Approval granted';
  timestamp: string;
  channel: 'whatsapp' | 'email';
  contact: string;
  whatChanged: string;
  whatItMeans: string;
}

interface WatchingViewProps {
  onNavigate: (view: ViewType) => void;
  onSelectProject: (project: ProjectSafetyItem) => void;
  watchedProjects: WatchedProjectItem[];
  alertTimeline: WatchedAlertPreview[];
  latestAlert: WatchedAlertPreview | null;
  onStopWatching: (projectId: string) => void;
}

export function WatchingView({
  onNavigate,
  onSelectProject,
  watchedProjects,
  alertTimeline,
  latestAlert,
  onStopWatching,
}: WatchingViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-8 animate-in fade-in duration-200 text-left">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-xs font-semibold text-stone-600 hover:text-[#0F1B2D] inline-flex items-center gap-1.5 py-1 min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E2E2E2] text-xs font-mono font-semibold tracking-wider uppercase text-[#131313] shadow-2xs">
          <Bell className="w-4 h-4 text-[#131313]" strokeWidth={1.5} />
          <span>Active Monitoring Desk</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0F1B2D]">
          Projects You&apos;re Watching
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Daily automated sweeps against Telangana RERA, HMDA, and municipal court dockets.
        </p>
      </div>

      {/* 1. ALERT PREVIEW CARD (WHEN AN ALERT OCCURRED) */}
      {latestAlert && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Preview of the message you&apos;ll get</span>
            </span>
            <span className="text-[11px] text-stone-500">
              Via {latestAlert.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} to {latestAlert.contact}
            </span>
          </div>

          {/* WhatsApp / Email card mockup */}
          <div className="bg-white rounded-xl border-2 border-amber-300 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                {latestAlert.channel === 'whatsapp' ? (
                  <MessageSquare className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                ) : (
                  <Mail className="w-4 h-4 text-[#0E7C86]" strokeWidth={1.5} />
                )}
                <span className="font-semibold text-[#0F1B2D]">House of Investors Vigil Alert</span>
              </div>
              <span>{latestAlert.timestamp}</span>
            </div>

            {/* 3 SHORT LINES */}
            <div className="text-xs sm:text-sm text-[#0F1B2D] space-y-2 leading-relaxed">
              <p>
                <strong>What changed:</strong> {latestAlert.whatChanged}
              </p>
              <p className="text-stone-700">
                <strong>What it means:</strong> {latestAlert.whatItMeans}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('booking')}
                  className="font-bold font-mono text-xs text-[#131313] hover:text-[#585858] underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#131313]" strokeWidth={2} />
                  <span>Talk to an advisor about this update →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLAIN LIST OF WATCHED PROJECTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#0F1B2D]">
            Monitored Developments ({watchedProjects.length})
          </h2>
          <span className="text-xs text-stone-500">
            Automated check frequency: 24h
          </span>
        </div>

        {watchedProjects.length > 0 ? (
          <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white overflow-hidden">
            {watchedProjects.map(({ project, channel, contact, lastChecked, hasChanged, changeNote }) => (
              <div
                key={project.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                <div 
                  className="space-y-1.5 flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectProject(project);
                    onNavigate('project');
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-base text-[#0F1B2D] hover:text-[#0E7C86] transition-colors">
                      {project.name}
                    </h3>
                    <span className="text-xs text-stone-500">· {project.location}</span>
                    <SafetyBadge status={project.status} size="sm" showScore={false} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1 text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                      Last checked: {lastChecked}
                    </span>
                    <span>·</span>
                    <span>Alerts: {channel === 'whatsapp' ? 'WhatsApp' : 'Email'} ({contact})</span>
                  </div>

                  {/* One-line status notice */}
                  <p className={`text-xs ${hasChanged ? 'text-amber-800 font-semibold' : 'text-stone-400'}`}>
                    {hasChanged ? changeNote : 'Nothing has changed'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(project);
                      onNavigate('project');
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors cursor-pointer min-h-[36px]"
                  >
                    View report
                  </button>

                  <button
                    type="button"
                    onClick={() => onStopWatching(project.id)}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer min-h-[36px]"
                    title="Stop watching this project"
                    aria-label={`Stop watching ${project.name}`}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif font-bold text-base text-[#0F1B2D]">
                You aren&apos;t watching any projects yet.
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tap &ldquo;Watch this project&rdquo; on any project verification report or check result to receive immediate alerts if RERA or lake buffer statuses update.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => onNavigate('check')}
                className="px-5 py-2.5 rounded-full bg-[#D6FD70] hover:bg-[#c7f354] text-[#131313] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer min-h-[44px] shadow-xs"
              >
                Browse & check projects
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. WHAT CHANGED TIMELINE */}
      {alertTimeline.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-serif font-bold text-lg text-[#0F1B2D]">
              What Changed Timeline
            </h3>
            <p className="text-xs text-stone-500">
              Verified statutory events recorded across your watch list:
            </p>
          </div>

          <div className="space-y-3 divide-y divide-stone-100">
            {alertTimeline.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-1 text-xs">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="font-bold text-[#0F1B2D] text-sm">{item.projectName}</span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="text-stone-800">
                  <strong className="text-amber-700">[{item.changeType}]:</strong> {item.whatChanged}
                </p>
                <p className="text-stone-500">
                  Impact: {item.whatItMeans}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Small muted line required */}
      <p className="text-xs text-stone-500 text-center pt-2">
        Alerts use the latest verified records. Updates may take up to 24 hours to appear.
      </p>
    </div>
  );
}
