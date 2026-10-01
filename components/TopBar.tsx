'use client';

import React from 'react';
import { 
  Shield, 
  Sparkles, 
  PhoneCall, 
  Search, 
  Home as HomeIcon, 
  CalendarCheck, 
  Receipt, 
  Navigation,
  Bell
} from 'lucide-react';
import { AelineButton } from '@/components/AelineButton';

export type ViewType = 'home' | 'check' | 'project' | 'concierge' | 'booking' | 'cost' | 'commute' | 'watching';

interface TopBarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  watchedCount?: number;
}

export function TopBar({ currentView, onNavigate, watchedCount = 0 }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#F2F2F2]/95 backdrop-blur-md border-b border-[#E2E2E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
        {/* Brand / Logo (hyderabad.properties with Aeline aesthetic) */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group min-h-[44px] cursor-pointer"
          aria-label="hyderabad.properties home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#131313] flex items-center justify-center text-[#D6FD70] shadow-2xs group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-[#D6FD70]" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-0.5">
              <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-[#131313]">
                hyderabad<span className="text-[#131313] underline decoration-[#D6FD70] decoration-3 underline-offset-4">.properties</span>
              </span>
            </div>
            <span className="text-[9px] tracking-widest uppercase font-mono font-bold text-[#888888] block -mt-0.5">
              House of Investors · Independent Diligence
            </span>
          </div>
        </button>

        {/* Desktop Navigation (Aeline rounded pill container) */}
        <nav className="hidden xl:flex items-center gap-1 p-1.5 rounded-full bg-white/90 border border-[#E2E2E2] shadow-2xs">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => onNavigate('check')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'check'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            Check a Project
          </button>

          <button
            type="button"
            onClick={() => onNavigate('commute')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'commute'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            Search by commute
          </button>

          <button
            type="button"
            onClick={() => onNavigate('project')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'project'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            Project Report
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cost')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'cost'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            Cost Calculator
          </button>

          <button
            type="button"
            onClick={() => onNavigate('watching')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'watching'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#131313]" strokeWidth={1.5} />
            <span>Watching</span>
            {watchedCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#D6FD70] text-[#131313] rounded-full text-[10px] font-bold">
                {watchedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('concierge')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'concierge'
                ? 'bg-[#131313] text-white font-bold shadow-xs'
                : 'text-[#585858] hover:text-[#131313] hover:bg-[#F2F2F2]'
            }`}
          >
            Wealth Desk
          </button>
        </nav>

        {/* Primary Header CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate('check')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#E2E2E2] text-xs font-mono font-semibold uppercase tracking-wider text-[#131313] hover:border-[#131313] transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Check</span>
          </button>

          {/* Signature Aeline Volt Green Arrow Button for Advisor Consultation */}
          <AelineButton variant="lime" onClick={() => onNavigate('booking')}>
            Talk to an Advisor
          </AelineButton>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="xl:hidden border-t border-[#E2E2E2] bg-white px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'home' ? 'bg-[#131313] text-white' : 'text-[#666666]'
          }`}
        >
          <HomeIcon className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('check')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'check' ? 'bg-[#131313] text-white' : 'text-[#666666]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Check</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('commute')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'commute' ? 'bg-[#131313] text-white' : 'text-[#666666]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Commute</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('project')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'project' ? 'bg-[#131313] text-white' : 'text-[#666666]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('cost')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'cost' ? 'bg-[#131313] text-white' : 'text-[#666666]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Cost</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('watching')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'watching' ? 'bg-[#131313] text-white' : 'text-[#666666]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Watching</span>
          {watchedCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#D6FD70] text-[#131313] text-[9px] font-bold flex items-center justify-center">
              {watchedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('booking')}
          className={`flex items-center gap-1 py-1 px-3 rounded-full shrink-0 font-mono text-[11px] font-semibold ${
            currentView === 'booking' ? 'bg-[#D6FD70] text-[#131313]' : 'text-[#666666]'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Book</span>
        </button>
      </div>
    </header>
  );
}
