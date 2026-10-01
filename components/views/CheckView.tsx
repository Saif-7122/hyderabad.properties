'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  ArrowRight, 
  PhoneCall, 
  RotateCcw,
  HelpCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { MOCK_PROJECTS, ProjectSafetyItem, JARGON_DICTIONARY } from '@/lib/mock-data';
import { JargonTooltip } from '@/components/JargonTooltip';
import { ViewType } from '@/components/TopBar';

interface CheckViewProps {
  onNavigate: (view: ViewType) => void;
  onSelectProject: (project: ProjectSafetyItem) => void;
  initialSearchTerm?: string;
  onClearInitialSearch?: () => void;
}

export function CheckView({
  onNavigate,
  onSelectProject,
  initialSearchTerm,
  onClearInitialSearch,
}: CheckViewProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<ProjectSafetyItem | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');

  // Expandable states for the 3 check rows
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Expandable state for the bottom glossary
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  // Run the 600ms check with progressive scanning steps
  const executeAudit = (projectToAudit: ProjectSafetyItem | null, rawQuery: string) => {
    setIsSearching(true);
    setShowDropdown(false);
    setSelectedResult(null);
    setIsNotFound(false);
    setSearchedQuery(rawQuery);
    setExpandedRows({});

    // Dynamic loading text sequence
    setLoadingStep('Checking Telangana RERA registration...');
    setTimeout(() => {
      setLoadingStep('Verifying municipal building sanctions...');
    }, 250);
    setTimeout(() => {
      setLoadingStep('Scanning HYDRAA lake & waterbody buffer coordinates...');
    }, 450);

    setTimeout(() => {
      setIsSearching(false);
      if (projectToAudit) {
        setSelectedResult(projectToAudit);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
      }
    }, 650);
  };

  // Trigger search if initialSearchTerm provided
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm.trim().length > 0) {
      const timer = setTimeout(() => {
        setSearchTerm(initialSearchTerm);
        const query = initialSearchTerm.trim().toLowerCase();
        const matched = MOCK_PROJECTS.find(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.reraNumber.toLowerCase() === query ||
            query.includes(p.name.toLowerCase())
        );
        executeAudit(matched || null, initialSearchTerm);
        if (onClearInitialSearch) {
          onClearInitialSearch();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialSearchTerm, onClearInitialSearch]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 3 Clickable example chips
  const exampleChips = [
    { label: 'Aurelia Heights', query: 'Aurelia Heights' },
    { label: 'Lakeview Residency', query: 'Lakeview Residency' },
    { label: 'Banyan Park', query: 'Banyan Park' },
  ];

  // Autocomplete filtering based on user input
  const matchingProjects = searchTerm.trim().length > 0
    ? MOCK_PROJECTS.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.reraNumber.toLowerCase().includes(query)
        );
      })
    : [];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Find best match in mock projects
    const matched = MOCK_PROJECTS.find(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reraNumber.toLowerCase() === searchTerm.toLowerCase().trim() ||
        searchTerm.toLowerCase().includes(p.name.toLowerCase())
    );

    executeAudit(matched || null, searchTerm.trim());
  };

  const handleSelectFromDropdown = (project: ProjectSafetyItem) => {
    setSearchTerm(project.name);
    executeAudit(project, project.name);
  };

  const handleChipClick = (chipQuery: string) => {
    setSearchTerm(chipQuery);
    const matched = MOCK_PROJECTS.find((p) => p.name.toLowerCase().includes(chipQuery.toLowerCase()));
    executeAudit(matched || null, chipQuery);
  };

  const toggleRowExpand = (rowKey: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedResult(null);
    setIsNotFound(false);
    setExpandedRows({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* Consistent Back button */}
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

      {/* 1. BIG CENTERED SEARCH */}
      <section className="space-y-4">
        <div className="text-left space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">
            Independent Project Verification
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0F1B2D]">
            Property Safety Check Tool
          </h1>
          <p className="text-sm text-stone-600 max-w-xl">
            Verify building sanction orders, <JargonTooltip term="RERA" /> certificates, and <JargonTooltip term="FTL" /> lake buffer boundaries before paying any token advance.
          </p>
        </div>

        {/* Big Search Input with Autocomplete */}
        <div className="relative pt-2" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim().length > 0) setShowDropdown(true);
                }}
                placeholder="Type a project name or RERA number..."
                aria-label="Search project name or RERA number"
                className="w-full pl-12 pr-28 sm:pr-32 py-4 text-sm sm:text-base rounded-xl border border-stone-200 bg-white text-[#0F1B2D] placeholder:text-stone-400 focus:outline-none focus:border-[#0E7C86] min-h-[56px]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 px-5 py-2.5 rounded-lg bg-[#0E7C86] hover:bg-[#095961] text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Check</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && matchingProjects.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden z-30 text-left animate-in fade-in duration-100">
              <div className="p-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-3 border-b border-stone-100">
                Verified Database Matches
              </div>
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {matchingProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectFromDropdown(p)}
                    className="w-full p-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#0F1B2D]">
                        {p.name}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {p.location} · RERA: <span className="font-mono text-stone-700">{p.reraNumber}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.status === 'safe'
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.status === 'warning'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {p.statusLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3 Clickable Example Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-stone-600">
            <span className="text-stone-400 font-medium">Try searching:</span>
            {exampleChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.query)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-[#0F1B2D] border border-stone-200 font-medium transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5"
              >
                <span>{chip.label}</span>
                <ChevronRight className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LOADING STATE (600ms fake delay on submit with skeleton) */}
      {isSearching && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-10 text-left space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[#0E7C86]" strokeWidth={1.5} />
            <h3 className="font-serif text-lg font-bold text-[#0F1B2D]">
              {loadingStep || 'Checking registration... approvals... lake safety...'}
            </h3>
          </div>

          <div className="space-y-2 max-w-md pt-1">
            <div className="h-3 bg-stone-200 rounded w-3/4" />
            <div className="h-3 bg-stone-200 rounded w-full" />
            <div className="h-3 bg-stone-200 rounded w-5/6" />
          </div>

          <p className="text-xs text-stone-500">
            Querying state registries and waterbody cadastral coordinates...
          </p>
        </div>
      )}

      {/* 3. RESULT CARD */}
      {!isSearching && selectedResult && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden space-y-6 animate-in fade-in duration-200">
          {/* Top Status Banner */}
          <div
            className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              selectedResult.status === 'safe'
                ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950'
                : selectedResult.status === 'warning'
                ? 'bg-amber-50/60 border-amber-100 text-amber-950'
                : 'bg-rose-50/60 border-rose-100 text-rose-950'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {selectedResult.location} ({selectedResult.microMarket})
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-xs font-mono text-stone-600">
                  RERA: {selectedResult.reraNumber}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1B2D]">
                {selectedResult.name}
              </h2>

              <div className="pt-1 flex items-center gap-2">
                {selectedResult.status === 'safe' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" strokeWidth={1.5} />
                    <span>Looks Safe</span>
                  </div>
                )}
                {selectedResult.status === 'warning' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-700" strokeWidth={1.5} />
                    <span>Needs a Closer Look</span>
                  </div>
                )}
                {selectedResult.status === 'risk' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                    <AlertOctagon className="w-4 h-4 text-rose-700" strokeWidth={1.5} />
                    <span>High Risk</span>
                  </div>
                )}
              </div>
            </div>

            {/* Small Score Ring */}
            <div className="flex items-center gap-3 shrink-0 bg-white p-3 rounded-xl border border-stone-200">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    className="stroke-stone-200 fill-none"
                    strokeWidth="4"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    className={`fill-none ${
                      selectedResult.status === 'safe'
                        ? 'stroke-emerald-600'
                        : selectedResult.status === 'warning'
                        ? 'stroke-amber-500'
                        : 'stroke-rose-600'
                    }`}
                    strokeWidth="4"
                    strokeDasharray={119.38}
                    strokeDashoffset={119.38 * (1 - selectedResult.score / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-bold text-xs text-[#0F1B2D] leading-none">
                    {selectedResult.score}
                  </span>
                  <span className="text-[8px] text-stone-400">/100</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-stone-600">
                Safety Index
              </span>
            </div>
          </div>

          <div className="px-6 space-y-6">
            <p className="text-sm text-stone-700 leading-relaxed">
              {selectedResult.summary}
            </p>

            {/* 3 CHECK ROWS */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-[#0F1B2D]">
                Core Safety Breakdown
              </h3>

              <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-stone-50/50 overflow-hidden">
                {/* ROW 1: RERA */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {selectedResult.reraStatus === 'Active' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-[#0F1B2D]">
                          Registered with the state regulator (<JargonTooltip term="RERA" />)
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {selectedResult.reraStatus === 'Active'
                            ? `Active certificate registered on Telangana portal (Registration No: ${selectedResult.reraNumber}).`
                            : 'Application renewal currently undergoing administrative review.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRowExpand('rera')}
                      className="text-xs font-semibold text-[#0E7C86] hover:underline flex items-center gap-1 shrink-0 py-1 cursor-pointer"
                    >
                      <span>{expandedRows['rera'] ? 'Hide' : 'See why'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedRows['rera'] ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                    </button>
                  </div>

                  {expandedRows['rera'] && (
                    <div className="mt-2 pl-7 pr-2 py-2 text-xs text-stone-600 bg-white rounded-lg border border-stone-200 space-y-1">
                      <p>
                        <strong>Regulator Verification:</strong>{' '}
                        {selectedResult.reraStatus === 'Active'
                          ? 'Quarterly construction milestones and bank escrow accounts are properly declared on the TG-RERA portal. No active stop-work orders.'
                          : 'The developer has filed paperwork, but mandatory quarterly disclosures are lagging. Advised to verify phase-wise delivery certificates.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* ROW 2: BUILDING PLANS */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {selectedResult.buildingPlan === 'Approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-[#0F1B2D]">
                          Building plans approved
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {selectedResult.buildingPlan === 'Approved'
                            ? 'Sanctioned municipal construction permission in place for layout and floors.'
                            : 'Revised plans or additional upper floors currently pending final municipal sanction.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRowExpand('plans')}
                      className="text-xs font-semibold text-[#0E7C86] hover:underline flex items-center gap-1 shrink-0 py-1 cursor-pointer"
                    >
                      <span>{expandedRows['plans'] ? 'Hide' : 'See why'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedRows['plans'] ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                    </button>
                  </div>

                  {expandedRows['plans'] && (
                    <div className="mt-2 pl-7 pr-2 py-2 text-xs text-stone-600 bg-white rounded-lg border border-stone-200 space-y-1">
                      <p>
                        <strong>Sanction Verification:</strong>{' '}
                        {selectedResult.buildingPlan === 'Approved'
                          ? 'Clear town planning permissions issued by GHMC/HMDA. All standard setback norms, basement parking, and fire safety NOCs verified.'
                          : 'The builder has applied for permission on additional floors that have not yet been stamped. Always ensure your specific floor is within the approved drawing.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* ROW 3: LAKE SAFETY */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {selectedResult.lakeBuffer === 'Clear' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-[#0F1B2D]">
                          Not near a protected lake zone
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {selectedResult.lakeBuffer === 'Clear'
                            ? 'Completely outside lake full tank level (FTL) and protected stormwater buffer lines.'
                            : 'Boundary plot encroaches into the 30-meter lake conservation zone.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRowExpand('lake')}
                      className="text-xs font-semibold text-[#0E7C86] hover:underline flex items-center gap-1 shrink-0 py-1 cursor-pointer"
                    >
                      <span>{expandedRows['lake'] ? 'Hide' : 'See why'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedRows['lake'] ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                    </button>
                  </div>

                  {expandedRows['lake'] && (
                    <div className="mt-2 pl-7 pr-2 py-2 text-xs text-stone-600 bg-white rounded-lg border border-stone-200 space-y-1">
                      <p>
                        <strong>HYDRAA Buffer Analysis:</strong>{' '}
                        {selectedResult.lakeBuffer === 'Clear'
                          ? 'Verified against Telangana Irrigation department cadastral maps. Zero overlap with lake water spread or connecting stormwater channels.'
                          : 'Survey coordinates indicate portions of the compound fall inside the lake conservation perimeter. HYDRAA has actively removed unauthorized structures in this exact revenue survey.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Last verified line with info icon */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                <span>Last verified: <strong>{selectedResult.lastVerifiedDate}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-800 underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Check another project</span>
              </button>
            </div>

            {/* Two Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-6">
              <button
                type="button"
                onClick={() => {
                  onSelectProject(selectedResult);
                  onNavigate('project');
                }}
                className="min-h-[50px] px-6 py-3 rounded-xl bg-[#0E7C86] hover:bg-[#095961] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>See full project report</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="min-h-[50px] px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-[#0F1B2D] border border-stone-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#B8893B]" strokeWidth={1.5} />
                <span>Ask an advisor about this</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NOT-FOUND STATE */}
      {!isSearching && isNotFound && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-10 text-left space-y-5 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-[#0F1B2D]">
              We couldn&apos;t find this project. That itself is worth a closer look.
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              You searched for <span className="font-semibold text-stone-900">&ldquo;{searchedQuery}&rdquo;</span>. If a project does not show up in verified public databases, it could be an unregistered pre-launch, an unapproved layout, or operating under a different developer entity name.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Important buyer safety notice:</p>
            <p>
              In Hyderabad, advertising or collecting booking advances for unapproved projects is illegal under Telangana RERA laws. Never pay advances without verified RERA registration numbers.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="w-full sm:w-auto min-h-[50px] px-8 py-3 rounded-xl bg-[#B8893B] hover:bg-[#9E742E] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" strokeWidth={1.5} />
              <span>Ask an Advisor to Verify This Project</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-colors cursor-pointer"
            >
              Try another search
            </button>
          </div>
        </div>
      )}

      {/* 5. COLLAPSIBLE GLOSSARY */}
      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors min-h-[56px] cursor-pointer"
        >
          <div>
            <h3 className="font-serif font-bold text-base text-[#0F1B2D]">
              What do these checks mean?
            </h3>
            <p className="text-xs text-stone-500">
              Plain-English explanation of Hyderabad real estate terms (RERA, FTL, HYDRAA, UDS).
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-stone-400 transition-transform duration-150 ${
              isGlossaryOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={1.5}
          />
        </button>

        {isGlossaryOpen && (
          <div className="px-5 pb-6 sm:px-6 divide-y divide-stone-100 text-xs sm:text-sm text-stone-700 animate-in fade-in duration-150">
            <div className="py-3 space-y-1">
              <strong className="text-[#0F1B2D] text-sm">RERA (Real Estate Regulatory Authority)</strong>
              <p className="text-stone-600 text-xs">
                {JARGON_DICTIONARY.RERA.explanation} In Telangana, a builder cannot collect more than 10% advance payment without signing a registered agreement containing this number.
              </p>
            </div>

            <div className="py-3 space-y-1">
              <strong className="text-[#0F1B2D] text-sm">FTL (Full Tank Level)</strong>
              <p className="text-stone-600 text-xs">
                {JARGON_DICTIONARY.FTL.explanation} Even if local panchayats mistakenly issued old documents, construction within FTL boundaries cannot be regularized.
              </p>
            </div>

            <div className="py-3 space-y-1">
              <strong className="text-[#0F1B2D] text-sm">HYDRAA (Asset Protection Agency)</strong>
              <p className="text-stone-600 text-xs">
                {JARGON_DICTIONARY.HYDRAA.explanation} The agency uses satellite maps to restore lake catchment areas. Properties caught in their crosshairs face power disconnection and demolition.
              </p>
            </div>

            <div className="py-3 space-y-1">
              <strong className="text-[#0F1B2D] text-sm">UDS (Undivided Share of Land)</strong>
              <p className="text-stone-600 text-xs">
                {JARGON_DICTIONARY.UDS.explanation} When you buy an apartment, you legally own a proportion of the physical plot. A higher UDS gives you stronger long-term asset value.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
