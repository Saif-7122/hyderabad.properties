'use client';

import React, { useState, useEffect } from 'react';
import { TopBar, ViewType } from '@/components/TopBar';
import { Footer, SimulatedChangeType } from '@/components/Footer';
import { HomeView } from '@/components/views/HomeView';
import { CheckView } from '@/components/views/CheckView';
import { ProjectView } from '@/components/views/ProjectView';
import { ConciergeView } from '@/components/views/ConciergeView';
import { BookingView } from '@/components/views/BookingView';
import { CostView } from '@/components/views/CostView';
import { CommuteView } from '@/components/views/CommuteView';
import { WatchingView, WatchedProjectItem, WatchedAlertPreview } from '@/components/views/WatchingView';
import { WatchSheet } from '@/components/WatchSheet';
import { AdvisorDemoPanel } from '@/components/AdvisorDemoPanel';
import { MOCK_PROJECTS, ProjectSafetyItem } from '@/lib/mock-data';
import { Shield, AlertCircle, X } from 'lucide-react';

export interface UserPreferences {
  lookingFor?: 'A home to live in' | 'An investment' | 'Not sure yet';
  location?: 'Hyderabad' | 'Elsewhere in India' | 'Abroad (NRI)';
  timeline?: 'Within 6 months' | '6-12 months' | 'Just exploring' | string;
  budget?: string;
  purpose?: string;
}

export default function Page() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedProject, setSelectedProject] = useState<ProjectSafetyItem>(MOCK_PROJECTS[0]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');

  // 1.5s Initial Splash screen
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Viewed projects tracking
  const [viewedProjects, setViewedProjects] = useState<ProjectSafetyItem[]>([MOCK_PROJECTS[0]]);

  // Chat transcript tracking
  const [chatTranscript, setChatTranscript] = useState<{ sender: 'assistant' | 'user'; text: string; time: string }[]>([]);

  // Booking details tracking
  const [bookingDetails, setBookingDetails] = useState<{ slot: string; timezone: string; email: string; phone?: string } | undefined>(undefined);

  // Advisor Demo Panel toggle
  const [isAdvisorDemoOpen, setIsAdvisorDemoOpen] = useState<boolean>(false);

  // ==========================================
  // WATCH THIS PROJECT STATE
  // ==========================================
  const [watchedProjects, setWatchedProjects] = useState<WatchedProjectItem[]>([
    {
      project: MOCK_PROJECTS[0], // Aurelia Heights pre-watched for immediate demo readiness
      channel: 'whatsapp',
      contact: '+91 98765 43210',
      watchedAt: 'Yesterday',
      lastChecked: 'today, 9:15 am',
    },
  ]);
  const [alertTimeline, setAlertTimeline] = useState<WatchedAlertPreview[]>([]);
  const [latestAlert, setLatestAlert] = useState<WatchedAlertPreview | null>(null);

  // Watch Sheet modal state
  const [isWatchSheetOpen, setIsWatchSheetOpen] = useState<boolean>(false);
  const [watchSheetProject, setWatchSheetProject] = useState<ProjectSafetyItem | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (view: ViewType, query?: string) => {
    if (query !== undefined) {
      setActiveSearchTerm(query);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (project: ProjectSafetyItem) => {
    setSelectedProject(project);
    setViewedProjects((prev) => {
      if (prev.some((p) => p.id === project.id)) return prev;
      return [...prev, project];
    });
  };

  const handleUpdatePreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const getProjectPriceInRupees = (project: ProjectSafetyItem): number => {
    const priceText = project.priceRange;
    if (priceText.includes('Cr')) {
      const match = priceText.match(/(\d+(\.\d+)?)/);
      if (match) return Math.round(parseFloat(match[1]) * 10000000);
    }
    if (priceText.includes('Lakh')) {
      const match = priceText.match(/(\d+(\.\d+)?)/);
      if (match) return Math.round(parseFloat(match[1]) * 100000);
    }
    return 12000000;
  };

  // Watch Sheet Handlers
  const handleOpenWatchSheet = (project: ProjectSafetyItem) => {
    setWatchSheetProject(project);
    setIsWatchSheetOpen(true);
  };

  const handleStartWatching = (project: ProjectSafetyItem, channel: 'whatsapp' | 'email', contact: string) => {
    setWatchedProjects((prev) => {
      const existing = prev.find((w) => w.project.id === project.id);
      if (existing) {
        return prev.map((w) =>
          w.project.id === project.id
            ? { ...w, channel, contact, lastChecked: 'today, 9:15 am' }
            : w
        );
      }
      return [
        {
          project,
          channel,
          contact,
          watchedAt: 'Just now',
          lastChecked: 'today, 9:15 am',
        },
        ...prev,
      ];
    });

    setToastMessage(`Now watching ${project.name}. Alerts active.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStopWatching = (projectId: string) => {
    const target = watchedProjects.find((w) => w.project.id === projectId);
    setWatchedProjects((prev) => prev.filter((w) => w.project.id !== projectId));
    if (target) {
      setToastMessage(`Stopped watching ${target.project.name}.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Demo: Simulate a Change
  const handleSimulateChange = (changeType: SimulatedChangeType) => {
    // Target Aurelia Heights or currently selected project
    const target = selectedProject || MOCK_PROJECTS[0];

    let whatChanged = '';
    let whatItMeans = '';
    let newStatus: 'safe' | 'warning' | 'risk' = 'warning';
    let newLabel: 'Looks Safe' | 'Needs a Closer Look' | 'High Risk' = 'Needs a Closer Look';
    let newScore = target.score;
    let note = '';

    if (changeType === 'Penalty added') {
      whatChanged = 'Telangana RERA added a delayed filing penalty of ₹2,50,000 on Tower C quarterly milestone return.';
      whatItMeans = 'This indicates an administrative filing delay. Municipal layout sanction remains intact, but compliance record has been penalized.';
      newStatus = 'warning';
      newLabel = 'Needs a Closer Look';
      newScore = 76;
      note = 'Penalty added: ₹2.5L delayed quarterly filing penalty';
    } else if (changeType === 'Registration lapsed') {
      whatChanged = 'Telangana RERA registration expired without active quarterly project extension certificate.';
      whatItMeans = 'New sales deed registrations are paused at the sub-registrar office pending builder regulatory renewal.';
      newStatus = 'risk';
      newLabel = 'High Risk';
      newScore = 44;
      note = 'Registration lapsed: renewal pending with TG-RERA';
    } else {
      whatChanged = 'HMDA municipal planning branch granted unconditional revised building sanction for upper residential floors.';
      whatItMeans = 'All previously conditional floors now possess verified municipal sanction orders.';
      newStatus = 'safe';
      newLabel = 'Looks Safe';
      newScore = 96;
      note = 'Sanction granted: upper floors unconditionally cleared';
    }

    // Update target project
    const updatedProject: ProjectSafetyItem = {
      ...target,
      status: newStatus,
      statusLabel: newLabel,
      score: newScore,
      summary: `${target.summary} [Regulatory Alert: ${whatChanged}]`,
    };
    setSelectedProject(updatedProject);

    // Show required toast: "<ProjectName>: a penalty was added"
    const toastVerb = changeType === 'Penalty added' 
      ? 'a penalty was added' 
      : changeType === 'Registration lapsed' 
      ? 'registration lapsed' 
      : 'approval was granted';
    setToastMessage(`${target.name}: ${toastVerb}`);
    setTimeout(() => setToastMessage(null), 6000);

    // Update or add to watched list
    setWatchedProjects((prev) => {
      const existing = prev.find((w) => w.project.id === target.id);
      if (existing) {
        return prev.map((w) =>
          w.project.id === target.id
            ? { ...w, project: updatedProject, hasChanged: true, changeNote: note, lastChecked: 'Just now' }
            : w
        );
      }
      return [
        {
          project: updatedProject,
          channel: 'whatsapp',
          contact: '+91 98765 43210',
          watchedAt: 'Today',
          lastChecked: 'Just now',
          hasChanged: true,
          changeNote: note,
        },
        ...prev,
      ];
    });

    // Alert preview
    const alertItem: WatchedAlertPreview = {
      id: `alert-${Date.now()}`,
      projectName: target.name,
      changeType,
      timestamp: 'Just now',
      channel: 'whatsapp',
      contact: '+91 98765 43210',
      whatChanged,
      whatItMeans,
    };
    setLatestAlert(alertItem);
    setAlertTimeline((prev) => [alertItem, ...prev]);
  };

  const isSelectedProjectWatched = watchedProjects.some((w) => w.project.id === selectedProject.id);
  const watchedProjectIds = watchedProjects.map((w) => w.project.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2] text-[#131313]">
      {/* 1.5s First-Load Splash Screen */}
      {showSplash && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 bg-[#131313] text-white flex flex-col items-center justify-center p-6 text-center animate-out fade-out duration-300 cursor-pointer"
        >
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#131313] border-2 border-[#D6FD70] flex items-center justify-center text-[#D6FD70] shadow-xl">
                <Shield className="w-7 h-7 text-[#D6FD70]" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                hyderabad<span className="text-[#D6FD70]">.properties</span>
              </div>
              <p className="text-[11px] uppercase font-mono font-semibold tracking-widest text-[#AAAAAA]">
                HOUSE OF INVESTORS · INDEPENDENT VERIFICATION
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#D6FD70]">
              <span className="w-2 h-2 rounded-full bg-[#D6FD70] animate-ping" />
              <span>Loading verified land and municipal records...</span>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Top Bar with Watching count badge */}
      <TopBar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        watchedCount={watchedProjects.length} 
      />

      {/* Main Content Area with State-Based Routing */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
            userPreferences={userPreferences}
            onUpdatePreferences={handleUpdatePreferences}
          />
        )}

        {currentView === 'check' && (
          <CheckView
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
            initialSearchTerm={activeSearchTerm}
            onClearInitialSearch={() => setActiveSearchTerm('')}
            watchedProjectIds={watchedProjectIds}
            onOpenWatchSheet={handleOpenWatchSheet}
            onStopWatching={handleStopWatching}
          />
        )}

        {currentView === 'project' && (
          <ProjectView
            project={selectedProject}
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
            isWatching={isSelectedProjectWatched}
            onOpenWatchSheet={handleOpenWatchSheet}
            onStopWatching={handleStopWatching}
          />
        )}

        {currentView === 'watching' && (
          <WatchingView
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
            watchedProjects={watchedProjects}
            alertTimeline={alertTimeline}
            latestAlert={latestAlert}
            onStopWatching={handleStopWatching}
          />
        )}

        {currentView === 'concierge' && (
          <ConciergeView
            onNavigate={handleNavigate}
            selectedProject={selectedProject}
            userPreferences={userPreferences}
            onUpdatePreferences={handleUpdatePreferences}
            onUpdateTranscript={setChatTranscript}
          />
        )}

        {currentView === 'booking' && (
          <BookingView
            onNavigate={handleNavigate}
            selectedProject={selectedProject}
            userPreferences={userPreferences}
            onBookingConfirmed={(details) => setBookingDetails(details)}
          />
        )}

        {currentView === 'cost' && (
          <CostView
            onNavigate={handleNavigate}
            selectedProject={selectedProject}
            initialPrice={getProjectPriceInRupees(selectedProject)}
          />
        )}

        {currentView === 'commute' && (
          <CommuteView
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
          />
        )}
      </main>

      {/* Footer with Mandatory Disclaimer & Demo Controls */}
      <Footer
        isAdvisorDemoOpen={isAdvisorDemoOpen}
        onToggleAdvisorDemo={() => setIsAdvisorDemoOpen(!isAdvisorDemoOpen)}
        onSimulateChange={handleSimulateChange}
      />

      {/* Advisor Demo Panel Drawer */}
      <AdvisorDemoPanel
        isOpen={isAdvisorDemoOpen}
        onClose={() => setIsAdvisorDemoOpen(false)}
        selectedProject={selectedProject}
        userPreferences={userPreferences}
        viewedProjects={viewedProjects}
        chatTranscript={chatTranscript}
        bookingDetails={bookingDetails}
      />

      {/* Compact Watch Sheet (Bottom sheet on mobile, side panel / modal on desktop) */}
      {watchSheetProject && (
        <WatchSheet
          project={watchSheetProject}
          isOpen={isWatchSheetOpen}
          onClose={() => {
            setIsWatchSheetOpen(false);
            setWatchSheetProject(null);
          }}
          onStartWatching={handleStartWatching}
        />
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#0F1B2D] text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={1.5} />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white p-1 cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
