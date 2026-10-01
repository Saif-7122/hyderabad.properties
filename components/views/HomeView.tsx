'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  ChevronRight, 
  Globe, 
  HelpCircle, 
  Check, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Mail,
  Send
} from 'lucide-react';
import { MOCK_PROJECTS, ProjectSafetyItem } from '@/lib/mock-data';
import { SafetyBadge } from '@/components/SafetyBadge';
import { ViewType } from '@/components/TopBar';
import { UserPreferences } from '@/app/page';
import { PrivacyPledge } from '@/components/PrivacyPledge';
import { AelineButton } from '@/components/AelineButton';

interface HomeViewProps {
  onNavigate: (view: ViewType, query?: string) => void;
  onSelectProject: (project: ProjectSafetyItem) => void;
  userPreferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export function HomeView({
  onNavigate,
  onSelectProject,
  userPreferences,
  onUpdatePreferences,
}: HomeViewProps) {
  const initialStep = userPreferences.timeline ? 'results' : 'idle';
  const [miniStep, setMiniStep] = useState<'idle' | 1 | 2 | 3 | 'results'>(initialStep);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [quizEmail, setQuizEmail] = useState('');
  const [quizWhatsapp, setQuizWhatsapp] = useState('');
  const [quizSent, setQuizSent] = useState(false);

  const recommendedProjects: ProjectSafetyItem[] = [
    MOCK_PROJECTS[0], // Aurelia Heights (Neopolis) - Green
    MOCK_PROJECTS[2], // Skyline Crest (Financial District) - Green
    MOCK_PROJECTS[3], // Banyan Park (Kokapet) - Amber
  ];

  const microMarketInsights = [
    {
      id: 'neopolis',
      name: 'Neopolis',
      rates: '₹14,000 – ₹17,500',
      tagline: 'High-density commercial and residential zone',
      explanation:
        'Western corridor high-rise cluster off the Outer Ring Road. 100-foot roads, government auction layouts, and zero lake-bed buffer overlaps.',
    },
    {
      id: 'financial-district',
      name: 'Financial District',
      rates: '₹10,500 – ₹17,500',
      tagline: 'Prime tech tower district with walk-to-work towers',
      explanation:
        'Close to corporate campuses. Consistent rental demand and strictly regulated municipal layout permissions.',
    },
    {
      id: 'kokapet',
      name: 'Kokapet',
      rates: '₹11,000 – ₹14,000',
      tagline: 'Residential expansion belt connecting to airport expressway',
      explanation:
        'Direct 25-minute drive to the international airport via the trumpet interchange. Always check individual plot boundaries against local nalas and irrigation maps.',
    },
  ];

  const handleSelectLookingFor = (value: UserPreferences['lookingFor']) => {
    onUpdatePreferences({ lookingFor: value });
    setMiniStep(2);
  };

  const handleSelectLocation = (value: UserPreferences['location']) => {
    onUpdatePreferences({ location: value });
    setMiniStep(3);
  };

  const handleSelectTimeline = (value: UserPreferences['timeline']) => {
    onUpdatePreferences({ timeline: value });
    setMiniStep('results');
  };

  const handleResetFlow = () => {
    onUpdatePreferences({ lookingFor: undefined, location: undefined, timeline: undefined });
    setMiniStep('idle');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('check', searchQuery);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-200">
      {/* 1. HERO SECTION */}
      <section className="pt-4 sm:pt-10 max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E2E2] text-xs font-mono font-semibold tracking-wider uppercase text-[#131313] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#D6FD70]" />
          <span>House of Investors · Independent Diligence</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#131313] leading-[1.12]">
          Know if a property is safe before you fall in love with it.
        </h1>

        <p className="text-base sm:text-lg text-[#585858] font-normal max-w-2xl leading-relaxed">
          Free, independent checks for Hyderabad buyers. No sales commissions. No broker calls.
        </p>
      </section>

      {/* 2. ONE PRIMARY CARD (Not sure where to start?) */}
      <section className="max-w-3xl">
        {miniStep === 'idle' && (
          <div className="bg-white rounded-3xl border border-[#E2E2E2] hover:border-[#131313] transition-all duration-300 p-6 sm:p-10 space-y-6 shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#666666]">
                [ 30-SECOND SCREENING ]
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#131313]">
                Not sure where to start?
              </h2>
              <p className="text-sm text-[#585858] max-w-xl">
                Answer 3 quick questions. We will highlight the safest verified properties that match your budget and location.
              </p>
            </div>

            {/* Aeline Signature Volt Green Pill Button */}
            <div>
              <AelineButton variant="lime" onClick={() => setMiniStep(1)}>
                Answer 3 quick questions
              </AelineButton>
            </div>

            <div className="text-xs font-mono text-[#888888] pt-2 border-t border-[#E2E2E2]">
              No phone number required to browse vetted projects.
            </div>
          </div>
        )}

        {/* GUIDED 3-STEP MINI FLOW (INLINE) */}
        {(miniStep === 1 || miniStep === 2 || miniStep === 3) && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
            {/* Step indicator */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                <span>Step {miniStep} of 3</span>
              </div>
              <button
                type="button"
                onClick={handleResetFlow}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer py-1"
              >
                Cancel
              </button>
            </div>

            {/* Step progress bar */}
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D6FD70] transition-all duration-200"
                style={{ width: `${(miniStep / 3) * 100}%` }}
              />
            </div>

            {/* Q1: What are you looking for? */}
            {miniStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1B2D]">
                    What are you looking for?
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Select your primary purchase goal:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { label: 'A home to live in', desc: 'End-use residence for family living' },
                    { label: 'An investment', desc: 'Rental yield and capital growth' },
                    { label: 'Not sure yet', desc: 'Comparing prices and comparing micro-markets' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectLookingFor(opt.label as UserPreferences['lookingFor'])}
                      className={`min-h-[58px] p-4 text-left rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                        userPreferences.lookingFor === opt.label
                          ? 'border-[#131313] bg-white ring-2 ring-[#D6FD70]'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#0F1B2D]">
                          {opt.label}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-3" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q2: Where are you based? */}
            {miniStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1B2D]">
                    Where are you based?
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    This determines whether you need remote legal diligence:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { label: 'Hyderabad', desc: 'Can visit sites in person' },
                    { label: 'Elsewhere in India', desc: 'Visiting Hyderabad periodically' },
                    { label: 'Abroad (NRI)', desc: 'Living overseas, requiring remote legal diligence' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectLocation(opt.label as UserPreferences['location'])}
                      className={`min-h-[58px] p-4 text-left rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                        userPreferences.location === opt.label
                          ? 'border-[#131313] bg-white ring-2 ring-[#D6FD70]'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#0F1B2D]">
                          {opt.label}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-3" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMiniStep(1)}
                    className="text-xs text-stone-500 hover:text-stone-800 underline py-2 min-h-[44px] cursor-pointer"
                  >
                    ← Back to Question 1
                  </button>
                </div>
              </div>
            )}

            {/* Q3: When are you planning to buy? */}
            {miniStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1B2D]">
                    When are you planning to buy?
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Filters out projects that do not match your possession targets:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { label: 'Within 6 months', desc: 'Ready-to-move or near-possession towers' },
                    { label: '6-12 months', desc: 'Under-construction with verified construction milestones' },
                    { label: 'Just exploring', desc: 'Early research into price benchmarks' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectTimeline(opt.label as UserPreferences['timeline'])}
                      className={`min-h-[58px] p-4 text-left rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                        userPreferences.timeline === opt.label
                          ? 'border-[#131313] bg-white ring-2 ring-[#D6FD70]'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#0F1B2D]">
                          {opt.label}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-3" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMiniStep(2)}
                    className="text-xs text-stone-500 hover:text-stone-800 underline py-2 min-h-[44px] cursor-pointer"
                  >
                    ← Back to Question 2
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. AFTER Q3: RECOMMENDED PROJECTS RESULTS */}
        {miniStep === 'results' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">
                  Personalized Match
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#0F1B2D]">
                  Recommended Safe Projects
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetFlow}
                className="text-xs text-stone-500 hover:text-[#0F1B2D] flex items-center gap-1.5 min-h-[44px] cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Change answers</span>
              </button>
            </div>

            {/* Answer recap */}
            <div className="flex flex-wrap gap-2 text-xs text-stone-600">
              <span className="bg-white border border-stone-200 px-3 py-1 rounded-lg">
                <strong>Goal:</strong> {userPreferences.lookingFor || 'Home'}
              </span>
              <span className="bg-white border border-stone-200 px-3 py-1 rounded-lg">
                <strong>Location:</strong> {userPreferences.location || 'India'}
              </span>
              <span className="bg-white border border-stone-200 px-3 py-1 rounded-lg">
                <strong>Timeline:</strong> {userPreferences.timeline || 'Exploring'}
              </span>
            </div>

            {/* NRI Banner */}
            {userPreferences.location === 'Abroad (NRI)' && (
              <div className="bg-[#131313] text-white border border-[#2F2F2F] rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs">
                <Globe className="w-5 h-5 text-[#D6FD70] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="font-bold text-[#D6FD70] text-sm">
                    Buying from abroad? We handle checks and paperwork remotely.
                  </p>
                  <p className="text-[#AAAAAA] leading-relaxed">
                    House of Investors provides NRI buyers with independent remote title checks, Power of Attorney compliance verification, and site video audits without requiring travel.
                  </p>
                </div>
              </div>
            )}

            {/* 3 Recommended Project Cards */}
            <div className="grid grid-cols-1 gap-3">
              {recommendedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                        {project.location}
                      </span>
                      <SafetyBadge status={project.status} size="sm" showScore={false} />
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#0F1B2D]">
                      {project.name}
                    </h3>

                    <p className="text-xs text-stone-600">
                      <strong className="text-stone-900">{project.priceRange}</strong> · {project.config} · Possession {project.possessionYear}
                    </p>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(project);
                        onNavigate('project');
                      }}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full bg-[#131313] hover:bg-black text-[#D6FD70] text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>See safety check</span>
                      <ChevronRight className="w-4 h-4 text-[#D6FD70]" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz contact step: optional shortlist dispatch with PrivacyPledge */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-[#0F1B2D]">
                  Email this verified shortlist to me <span className="font-sans text-xs text-stone-500 font-normal">(optional)</span>
                </h4>
                <p className="text-xs text-stone-600">
                  Receive full link documents, survey numbers, and sanction orders in your inbox.
                </p>
              </div>

              {!quizSent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (quizEmail.trim() && quizEmail.includes('@')) {
                      setQuizSent(true);
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F1B2D] mb-1">
                        Email address <span className="text-stone-400 font-normal">(optional unless sending)</span>
                      </label>
                      <input
                        type="email"
                        value={quizEmail}
                        onChange={(e) => setQuizEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0E7C86] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F1B2D] mb-1">
                        WhatsApp number <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={quizWhatsapp}
                        onChange={(e) => setQuizWhatsapp(e.target.value)}
                        placeholder="+91 98765 43210 (optional)"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0E7C86] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <PrivacyPledge compact />

                  <button
                    type="submit"
                    disabled={!quizEmail.trim() || !quizEmail.includes('@')}
                    className="px-6 py-2.5 rounded-full bg-[#D6FD70] hover:bg-[#c7f354] text-[#131313] text-xs font-bold font-mono uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    <span>Send me the shortlist</span>
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
                  <span>Shortlist sent to <strong>{quizEmail}</strong>. No spam, ever.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. BELOW THE FOLD, QUIETLY */}
      <section className="max-w-4xl pt-4 space-y-12">
        {/* Search bar for specific project */}
        <div className="border-t border-stone-200 pt-8 space-y-3">
          <div className="space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1B2D]">
              Prefer to check a specific project?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Enter any project name to verify municipal approvals and lake buffer coordinates.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter project name (e.g. Aurelia, Lakeview, Kokapet)..."
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#0E7C86] transition-colors min-h-[48px]"
              />
            </div>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#0F1B2D] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Check Project</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>

        {/* 3 Micro-Market Cards with Rate Ranges & "What's this area like?" expandable */}
        <div className="border-t border-stone-200 pt-8 space-y-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1B2D]">
              Key Residential Corridors
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Current per sq ft rates and ground reality notes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {microMarketInsights.map((market) => {
              const isExpanded = expandedMarket === market.id;
              return (
                <div
                  key={market.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-serif font-bold text-base text-[#0F1B2D]">
                        {market.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        West Zone
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[#131313] mt-1">
                      {market.rates}
                      <span className="text-xs font-normal text-stone-500"> / sq ft</span>
                    </div>

                    <p className="text-xs text-stone-500 mt-1">
                      {market.tagline}
                    </p>
                  </div>

                  {/* "What's this area like?" Tooltip-style expandable */}
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setExpandedMarket(isExpanded ? null : market.id)}
                      className="w-full text-left text-xs font-semibold text-[#131313] hover:text-[#585858] flex items-center justify-between py-1 min-h-[36px] cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#131313]" strokeWidth={1.5} />
                        <span>What&apos;s this area like?</span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-lg bg-[#FAF8F5] border border-stone-200 text-xs text-stone-700 leading-relaxed animate-in fade-in duration-150">
                        {market.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
