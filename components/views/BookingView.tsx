'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  PhoneCall, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  MessageSquare,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { ViewType } from '@/components/TopBar';
import { ProjectSafetyItem } from '@/lib/mock-data';
import { UserPreferences } from '@/components/AppShell';
import { PrivacyPledge } from '@/components/PrivacyPledge';

interface BookingViewProps {
  onNavigate: (view: ViewType) => void;
  selectedProject?: ProjectSafetyItem;
  userPreferences?: UserPreferences;
  onBookingConfirmed?: (bookingDetails: {
    slot: string;
    timezone: string;
    email: string;
    phone?: string;
  }) => void;
}

type Timezone = 'IST' | 'GST' | 'EST' | 'PST' | 'SGT';

interface SlotData {
  id: string;
  dayLabel: string;
  dateLabel: string;
  times: Record<Timezone, string>;
}

export function BookingView({
  onNavigate,
  selectedProject,
  userPreferences,
  onBookingConfirmed,
}: BookingViewProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [timezone, setTimezone] = useState<Timezone>('IST');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-1');
  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const timezones: { code: Timezone; label: string; offset: string }[] = [
    { code: 'IST', label: 'IST (India)', offset: 'UTC+5:30' },
    { code: 'GST', label: 'GST (Gulf / Dubai)', offset: 'UTC+4:00' },
    { code: 'EST', label: 'EST (New York)', offset: 'UTC-5:00' },
    { code: 'PST', label: 'PST (California)', offset: 'UTC-8:00' },
    { code: 'SGT', label: 'SGT (Singapore)', offset: 'UTC+8:00' },
  ];

  // 6 mock slots over the next 3 days
  const mockSlots: SlotData[] = [
    {
      id: 'slot-1',
      dayLabel: 'Tomorrow',
      dateLabel: 'Morning slot',
      times: {
        IST: '11:00 AM IST',
        GST: '09:30 AM GST',
        EST: '01:30 AM EST',
        PST: '10:30 PM PST (prev day)',
        SGT: '01:30 PM SGT',
      },
    },
    {
      id: 'slot-2',
      dayLabel: 'Tomorrow',
      dateLabel: 'Late afternoon slot',
      times: {
        IST: '04:30 PM IST',
        GST: '03:00 PM GST',
        EST: '07:00 AM EST',
        PST: '04:00 AM PST',
        SGT: '07:00 PM SGT',
      },
    },
    {
      id: 'slot-3',
      dayLabel: 'Day after tomorrow',
      dateLabel: 'Morning slot',
      times: {
        IST: '10:30 AM IST',
        GST: '09:00 AM GST',
        EST: '01:00 AM EST',
        PST: '10:00 PM PST (prev day)',
        SGT: '01:00 PM SGT',
      },
    },
    {
      id: 'slot-4',
      dayLabel: 'Day after tomorrow',
      dateLabel: 'Evening slot',
      times: {
        IST: '06:00 PM IST',
        GST: '04:30 PM GST',
        EST: '08:30 AM EST',
        PST: '05:30 AM PST',
        SGT: '08:30 PM SGT',
      },
    },
    {
      id: 'slot-5',
      dayLabel: 'Saturday',
      dateLabel: 'Weekend morning slot',
      times: {
        IST: '11:30 AM IST',
        GST: '10:00 AM GST',
        EST: '02:00 AM EST',
        PST: '11:00 PM PST (prev day)',
        SGT: '02:00 PM SGT',
      },
    },
    {
      id: 'slot-6',
      dayLabel: 'Saturday',
      dateLabel: 'Weekend afternoon slot',
      times: {
        IST: '03:30 PM IST',
        GST: '02:00 PM GST',
        EST: '06:00 AM EST',
        PST: '03:00 AM PST',
        SGT: '06:00 PM SGT',
      },
    },
  ];

  const activeSlot = mockSlots.find((s) => s.id === selectedSlotId) || mockSlots[0];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (onBookingConfirmed) {
      onBookingConfirmed({
        slot: `${activeSlot.dayLabel}, ${activeSlot.times[timezone]}`,
        timezone,
        email,
        phone: whatsapp || undefined,
      });
    }

    setIsBooked(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (step === 2 && !isBooked) {
              setStep(1);
            } else {
              onNavigate('project');
            }
          }}
          className="text-xs font-semibold text-stone-600 hover:text-[#0F1B2D] inline-flex items-center gap-1.5 py-1 min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>{step === 2 && !isBooked ? 'Back to time selection' : 'Back to project report'}</span>
        </button>
      </div>

      {!isBooked ? (
        <div className="space-y-8">
          {/* Header & Step Indicator */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
              <span>Step {step} of 2</span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600">
                {step === 1 ? 'Pick a time' : 'Confirm consultation'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1B2D]">
              Schedule a private advisor consultation
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              One-on-one session with an HoI property analyst. We do not accept developer referral fees.
            </p>

            {selectedProject && (
              <div className="pt-1 text-xs text-stone-700">
                Discussing: <strong className="text-[#0F1B2D]">{selectedProject.name}</strong> ({selectedProject.location})
              </div>
            )}
          </div>

          {/* STEP 1: PICK A TIME */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Timezone Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0F1B2D] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#0E7C86]" strokeWidth={1.5} />
                    <span>Select your timezone:</span>
                  </label>
                  <span className="text-[11px] text-stone-500">
                    Defaulting to IST
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {timezones.map((tz) => (
                    <button
                      key={tz.code}
                      type="button"
                      onClick={() => setTimezone(tz.code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors min-h-[38px] cursor-pointer border ${
                        timezone === tz.code
                          ? 'border-[#131313] bg-[#131313] text-[#D6FD70] font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {tz.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 Mock Slots over the next 3 days */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#0F1B2D] block">
                  Select a consultation slot:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mockSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-4 rounded-xl text-left border transition-colors cursor-pointer min-h-[64px] flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#131313] bg-white ring-2 ring-[#D6FD70]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                            {slot.dayLabel} · {slot.dateLabel}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#131313]" strokeWidth={2} />
                          )}
                        </div>

                        <div className="text-sm font-bold text-[#0F1B2D] mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#131313]" strokeWidth={1.5} />
                          <span>{slot.times[timezone]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full min-h-[50px] py-3.5 px-6 rounded-full bg-[#131313] hover:bg-black text-[#D6FD70] text-sm font-bold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Continue to Confirmation</span>
                  <ArrowRight className="w-4 h-4 text-[#D6FD70]" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRM */}
          {step === 2 && (
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {/* Summary Card from earlier views/chat */}
              <div className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-white space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Consultation Summary
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Selected Time</span>
                    <strong className="text-[#0F1B2D]">{activeSlot.dayLabel}, {activeSlot.times[timezone]}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Subject Property</span>
                    <strong className="text-[#0F1B2D]">{selectedProject?.name || 'Aurelia Heights'}</strong>
                  </div>
                  {userPreferences?.budget && (
                    <div>
                      <span className="text-stone-400 block text-[11px]">Target Budget</span>
                      <strong className="text-[#0F1B2D]">{userPreferences.budget}</strong>
                    </div>
                  )}
                  {userPreferences?.lookingFor && (
                    <div>
                      <span className="text-stone-400 block text-[11px]">Purpose</span>
                      <strong className="text-[#0F1B2D]">{userPreferences.lookingFor}</strong>
                    </div>
                  )}
                  {userPreferences?.timeline && (
                    <div>
                      <span className="text-stone-400 block text-[11px]">Timeline</span>
                      <strong className="text-[#0F1B2D]">{userPreferences.timeline}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-stone-400 block text-[11px]">Buyer Residence</span>
                    <strong className="text-[#0F1B2D]">
                      {userPreferences?.location === 'Abroad (NRI)' ? 'NRI (Overseas)' : 'Resident Buyer'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1B2D] mb-1">
                    Email address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0E7C86] min-h-[44px]"
                    />
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    We send the calendar invite and dial-in details here.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#0F1B2D]">
                      WhatsApp number <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210 (optional)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0E7C86] min-h-[44px]"
                    />
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Only used if you prefer meeting reminders on WhatsApp.
                  </span>
                </div>
              </div>

              {/* Privacy Pledge component directly above submit button */}
              <PrivacyPledge />

              {/* Confirm CTA (Neon) - disabled until email is valid */}
              <button
                type="submit"
                disabled={!email.trim() || !email.includes('@')}
                className="w-full min-h-[52px] py-3.5 px-6 rounded-full bg-[#D6FD70] hover:bg-[#c7f354] text-[#131313] text-sm font-bold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhoneCall className="w-4 h-4 text-[#131313]" strokeWidth={2} />
                <span>Confirm Consultation Call</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* SUCCESS SCREEN */
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 space-y-6 text-left animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0F1B2D]">
                You&apos;re booked
              </h2>
              <p className="text-xs text-stone-500">
                Confirmation sent to <strong>{email}</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-1">
            <div><strong>Time:</strong> {activeSlot.dayLabel}, {activeSlot.times[timezone]}</div>
            <div><strong>Property:</strong> {selectedProject?.name || 'Aurelia Heights'} ({selectedProject?.location || 'Neopolis'})</div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-serif text-base font-bold text-[#0F1B2D]">
              What happens next:
            </h3>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#0E7C86]">1.</span>
                <span>An advisor reviews the project title documents and municipal sanctions before the call.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#0E7C86]">2.</span>
                <span>You receive a calendar invite with a Google Meet link.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#0E7C86]">3.</span>
                <span>We talk through the legal checks, pricing, and lake buffer maps.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0F1B2D] text-xs font-semibold transition-colors cursor-pointer"
            >
              Return to Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('check')}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:text-[#0F1B2D] text-xs font-semibold transition-colors cursor-pointer"
            >
              Audit another project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
