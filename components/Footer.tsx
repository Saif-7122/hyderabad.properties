'use client';

import React from 'react';
import { Shield, Info, Check, Eye } from 'lucide-react';
import { FOOTER_DISCLAIMER } from '@/lib/mock-data';

interface FooterProps {
  isAdvisorDemoOpen?: boolean;
  onToggleAdvisorDemo?: () => void;
}

export function Footer({ isAdvisorDemoOpen, onToggleAdvisorDemo }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0E7C86]" strokeWidth={1.5} />
              <span className="font-serif text-lg font-bold text-[#0F1B2D]">
                hyderabad<span className="text-[#0E7C86]">.properties</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              Independent property verification by House of Investors. Checks RERA registration, approvals, and lake zones in seconds.
            </p>
          </div>

          <div className="text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-[#0F1B2D] uppercase tracking-wider text-[11px]">
              Three Diligence Standards
            </h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" strokeWidth={1.5} />
                <span>Zero developer sales kickbacks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" strokeWidth={1.5} />
                <span>Municipal sanction drawing verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" strokeWidth={1.5} />
                <span>Cadastral lake buffer boundary checks</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-[#0F1B2D] uppercase tracking-wider text-[11px]">
              House of Investors Advisory
            </h4>
            <p className="text-stone-500 leading-relaxed">
              Financial District, Hyderabad, Telangana. Private advisory sessions for first-time buyers and NRI property acquisitions.
            </p>
          </div>
        </div>

        {/* Disclaimer & Advisor View Demo Toggle */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
            <p className="text-stone-600">
              Disclaimer: {FOOTER_DISCLAIMER}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Small "Advisor view (demo)" toggle */}
            {onToggleAdvisorDemo && (
              <button
                type="button"
                onClick={onToggleAdvisorDemo}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                  isAdvisorDemoOpen
                    ? 'bg-[#0E7C86] text-white border-[#0E7C86]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Advisor view (demo)</span>
                <span className={`w-2 h-2 rounded-full ${isAdvisorDemoOpen ? 'bg-white' : 'bg-emerald-500'}`} />
              </button>
            )}

            <div className="text-stone-400 text-right">
              © {new Date().getFullYear()} hyderabad.properties
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
