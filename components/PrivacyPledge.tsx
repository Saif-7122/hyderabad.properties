'use client';

import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PrivacyPledgeProps {
  compact?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

export function PrivacyPledge({ compact = false, variant, className = '' }: PrivacyPledgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCompact = compact || variant === 'compact';

  return (
    <>
      <div className={`pt-3.5 mt-3 border-t border-stone-200 text-left ${className}`}>
        {isCompact ? (
          /* COMPACT VARIANT: One line + link */
          <div className="flex items-center gap-1.5 text-xs text-stone-500 flex-wrap">
            <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" strokeWidth={1.5} />
            <span>Your number goes only to House of Investors. Never sold or shared.</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="font-medium text-[#131313] underline hover:text-[#585858] cursor-pointer inline"
            >
              How we handle your data
            </button>
          </div>
        ) : (
          /* FULL VARIANT: Quiet block with lock, heading, 3 lines, text link */
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold text-[#0F1B2D]">
                Your number goes only to House of Investors.
              </h4>
            </div>

            <ul className="text-xs text-stone-500 space-y-1 pl-6 list-disc list-outside">
              <li>We never sell or share your details with brokers or builders.</li>
              <li>One advisor contacts you. No cold calls, no group messages.</li>
              <li>Want out? Reply STOP or email us and we delete your data.</li>
            </ul>

            <div className="pl-6 pt-0.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-medium text-[#131313] underline hover:text-[#585858] cursor-pointer"
              >
                How we handle your data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SIMPLE 4-SENTENCE PRIVACY MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FAF8F5] border border-stone-300 rounded-xl p-6 shadow-xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#131313]" strokeWidth={1.5} />
                <h3 id="privacy-modal-title" className="font-serif font-bold text-base text-[#0F1B2D]">
                  How We Handle Your Data
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-stone-700 space-y-3 leading-relaxed">
              <p>
                <strong>What we collect:</strong> We collect your email address, optional WhatsApp number, and shortlisted property preferences.
              </p>
              <p>
                <strong>Why we collect it:</strong> We use this information solely to prepare for your consultation and share independent legal verification reports.
              </p>
              <p>
                <strong>Who sees it:</strong> Only your assigned House of Investors diligence analyst reviews your details—we never share or sell data to developers, brokers, or marketing networks.
              </p>
              <p>
                <strong>How to delete:</strong> Reply STOP to any message or email <em>privacy@hyderabad.properties</em> and we completely delete your records within 24 hours.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F1B2D] hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
