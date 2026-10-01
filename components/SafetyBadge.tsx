'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface SafetyBadgeProps {
  status: 'safe' | 'warning' | 'risk';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export function SafetyBadge({
  status,
  score,
  size = 'md',
  showScore = true,
}: SafetyBadgeProps) {
  const config = {
    safe: {
      label: 'Looks Safe',
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-700',
      icon: ShieldCheck,
      scoreColor: 'text-emerald-700',
    },
    warning: {
      label: 'Needs a Closer Look',
      bgColor: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-700',
      icon: AlertTriangle,
      scoreColor: 'text-amber-700',
    },
    risk: {
      label: 'High Risk',
      bgColor: 'bg-rose-50 border-rose-200 text-rose-900',
      iconColor: 'text-rose-700',
      icon: AlertOctagon,
      scoreColor: 'text-rose-700',
    },
  }[status];

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2.5 text-base gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className={`inline-flex items-center rounded-full border font-medium ${config.bgColor} ${sizeClasses}`}>
      <Icon className={`${iconSizes} ${config.iconColor} shrink-0`} strokeWidth={1.5} />
      <span className="font-semibold tracking-tight">{config.label}</span>
      {showScore && score !== undefined && (
        <span className={`text-xs ml-1 font-normal opacity-75 ${config.scoreColor}`}>
          ({score}/100)
        </span>
      )}
    </div>
  );
}
