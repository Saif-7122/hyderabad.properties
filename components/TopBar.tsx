'use client';

import React from 'react';
import { Shield, Sparkles, PhoneCall, Search, Home as HomeIcon, CalendarCheck } from 'lucide-react';

export type ViewType = 'home' | 'check' | 'project' | 'concierge' | 'booking';

interface TopBarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export function TopBar({ currentView, onNavigate }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group min-h-[44px] cursor-pointer"
          aria-label="hyderabad.properties home"
        >
          <Shield className="w-6 h-6 text-[#0E7C86] shrink-0" strokeWidth={1.5} />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-serif text-lg font-bold tracking-tight text-[#0F1B2D]">
                hyderabad<span className="text-[#0E7C86]">.properties</span>
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-500 block -mt-0.5">
              House of Investors
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] cursor-pointer ${
              currentView === 'home'
                ? 'bg-white text-[#0F1B2D] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-[#0F1B2D]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('check')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] cursor-pointer ${
              currentView === 'check'
                ? 'bg-white text-[#0F1B2D] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-[#0F1B2D]'
            }`}
          >
            Check a Project
          </button>
          <button
            onClick={() => onNavigate('project')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] cursor-pointer ${
              currentView === 'project'
                ? 'bg-white text-[#0F1B2D] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-[#0F1B2D]'
            }`}
          >
            Project Report
          </button>
          <button
            onClick={() => onNavigate('concierge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] cursor-pointer ${
              currentView === 'concierge'
                ? 'bg-white text-[#0F1B2D] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-[#0F1B2D]'
            }`}
          >
            Wealth Desk
          </button>
          <button
            onClick={() => onNavigate('booking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] cursor-pointer ${
              currentView === 'booking'
                ? 'bg-white text-[#0F1B2D] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-[#0F1B2D]'
            }`}
          >
            Booking
          </button>
        </nav>

        {/* Primary Header CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Check a Project CTA */}
          <button
            onClick={() => onNavigate('check')}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer ${
              currentView === 'check'
                ? 'bg-[#0E7C86] text-white'
                : 'bg-white hover:bg-stone-50 text-[#0E7C86] border border-[#0E7C86]/40'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Check a Project</span>
            <span className="sm:hidden">Check</span>
          </button>

          {/* Talk to an Advisor CTA (Gold accent used strictly for this action) */}
          <button
            onClick={() => onNavigate('booking')}
            className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#B8893B] hover:bg-[#9E742E] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Talk to an Advisor</span>
            <span className="sm:hidden">Advisor</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-stone-200 bg-stone-50 px-2 py-1 flex items-center justify-around text-xs">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center py-1 px-2 min-h-[44px] justify-center ${
            currentView === 'home' ? 'text-[#0E7C86] font-bold' : 'text-stone-600'
          }`}
        >
          <HomeIcon className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px]">Home</span>
        </button>
        <button
          onClick={() => onNavigate('check')}
          className={`flex flex-col items-center py-1 px-2 min-h-[44px] justify-center ${
            currentView === 'check' ? 'text-[#0E7C86] font-bold' : 'text-stone-600'
          }`}
        >
          <Search className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px]">Check</span>
        </button>
        <button
          onClick={() => onNavigate('project')}
          className={`flex flex-col items-center py-1 px-2 min-h-[44px] justify-center ${
            currentView === 'project' ? 'text-[#0E7C86] font-bold' : 'text-stone-600'
          }`}
        >
          <Shield className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px]">Report</span>
        </button>
        <button
          onClick={() => onNavigate('concierge')}
          className={`flex flex-col items-center py-1 px-2 min-h-[44px] justify-center ${
            currentView === 'concierge' ? 'text-[#0E7C86] font-bold' : 'text-stone-600'
          }`}
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px]">Chat</span>
        </button>
        <button
          onClick={() => onNavigate('booking')}
          className={`flex flex-col items-center py-1 px-2 min-h-[44px] justify-center ${
            currentView === 'booking' ? 'text-[#B8893B] font-bold' : 'text-stone-600'
          }`}
        >
          <CalendarCheck className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px]">Book</span>
        </button>
      </div>
    </header>
  );
}
