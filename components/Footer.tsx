'use client';

import React, { useState } from 'react';
import { Shield, Info, Check, Eye } from 'lucide-react';
import { FOOTER_DISCLAIMER } from '@/lib/mock-data';

export type SimulatedChangeType = 'Registration lapsed' | 'Penalty added' | 'Approval granted';

interface FooterProps {
  isAdvisorDemoOpen?: boolean;
  onToggleAdvisorDemo?: () => void;
  onSimulateChange?: (changeType: SimulatedChangeType) => void;
}

export function Footer({ isAdvisorDemoOpen, onToggleAdvisorDemo, onSimulateChange }: FooterProps) {
  const [selectedChange, setSelectedChange] = useState<SimulatedChangeType>('Penalty added');

  return (
    <footer className="mt-20 border-t border-[#2F2F2F] bg-[#131313] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#2F2F2F]">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-[#D6FD70] shadow-xs">
                <Shield className="w-4 h-4 text-[#D6FD70]" strokeWidth={2} />
              </div>
              <span className="font-heading text-lg font-bold text-white">
                hyderabad<span className="text-[#D6FD70]">.properties</span>
              </span>
            </div>
            <p className="text-xs text-[#AAAAAA] leading-relaxed max-w-sm font-sans">
              Independent property verification by House of Investors. Checks RERA registration, approvals, lake zones, and true acquisition costs in seconds.
            </p>
          </div>

          <div className="text-xs text-[#AAAAAA] space-y-2">
            <h4 className="font-mono font-bold text-[#D6FD70] uppercase tracking-wider text-[11px]">
              Three Diligence Standards
            </h4>
            <ul className="space-y-1.5 font-sans">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D6FD70] shrink-0" strokeWidth={2} />
                <span>Zero developer sales kickbacks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D6FD70] shrink-0" strokeWidth={2} />
                <span>Municipal sanction drawing verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D6FD70] shrink-0" strokeWidth={2} />
                <span>Cadastral lake buffer boundary checks</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-[#AAAAAA] space-y-2">
            <h4 className="font-mono font-bold text-[#D6FD70] uppercase tracking-wider text-[11px]">
              House of Investors Advisory
            </h4>
            <p className="text-[#888888] leading-relaxed font-sans">
              Financial District, Hyderabad, Telangana. Private advisory sessions for first-time buyers and NRI property acquisitions.
            </p>
          </div>
        </div>

        {/* Disclaimer & Demo Controls */}
        <div className="mt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#888888] shrink-0" strokeWidth={1.5} />
            <p className="text-[#AAAAAA] font-sans">
              Disclaimer: {FOOTER_DISCLAIMER}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Demo: Simulate a Change Control */}
            {onSimulateChange && (
              <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-[#2F2F2F] bg-[#1F1F1F] text-xs">
                <span className="font-mono text-[11px] font-semibold text-[#AAAAAA] pl-2">Demo change:</span>
                <select
                  value={selectedChange}
                  onChange={(e) => setSelectedChange(e.target.value as SimulatedChangeType)}
                  className="bg-[#131313] border border-[#2F2F2F] rounded-full px-2.5 py-1 text-[11px] font-mono font-medium text-white focus:outline-none focus:border-[#D6FD70]"
                >
                  <option value="Penalty added">Penalty added</option>
                  <option value="Registration lapsed">Registration lapsed</option>
                  <option value="Approval granted">Approval granted</option>
                </select>
                <button
                  type="button"
                  onClick={() => onSimulateChange(selectedChange)}
                  className="px-3 py-1 bg-[#D6FD70] hover:bg-[#c7f354] text-[#131313] rounded-full text-[11px] font-mono font-bold cursor-pointer transition-colors"
                >
                  Trigger
                </button>
              </div>
            )}

            {/* Small "Advisor view (demo)" toggle */}
            {onToggleAdvisorDemo && (
              <button
                type="button"
                onClick={onToggleAdvisorDemo}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold transition-colors cursor-pointer min-h-[36px] ${
                  isAdvisorDemoOpen
                    ? 'bg-[#D6FD70] text-[#131313] border-[#D6FD70]'
                    : 'bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border-[#2F2F2F]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Advisor view (demo)</span>
                <span className={`w-2 h-2 rounded-full ${isAdvisorDemoOpen ? 'bg-[#131313]' : 'bg-[#D6FD70]'}`} />
              </button>
            )}

            <div className="text-[#666666] font-mono text-[11px]">
              © {new Date().getFullYear()} hyderabad.properties
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
