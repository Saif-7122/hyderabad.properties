'use client';

import React, { useState, useEffect } from 'react';
import { TopBar, ViewType } from '@/components/TopBar';
import { Footer } from '@/components/Footer';
import { HomeView } from '@/components/views/HomeView';
import { CheckView } from '@/components/views/CheckView';
import { ProjectView } from '@/components/views/ProjectView';
import { ConciergeView } from '@/components/views/ConciergeView';
import { BookingView } from '@/components/views/BookingView';
import { AdvisorDemoPanel } from '@/components/AdvisorDemoPanel';
import { MOCK_PROJECTS, ProjectSafetyItem } from '@/lib/mock-data';
import { Shield } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0F1B2D]">
      {/* 1.5s First-Load Splash Screen */}
      {showSplash && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center animate-out fade-out duration-300 cursor-pointer"
        >
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center justify-center">
              <Shield className="w-12 h-12 text-[#0E7C86]" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1B2D]">
                hyderabad<span className="text-[#0E7C86]">.properties</span>
              </div>
              <p className="text-xs uppercase font-semibold tracking-wider text-stone-500">
                House of Investors
              </p>
            </div>
            <p className="text-sm text-stone-600 font-normal pt-2 border-t border-stone-200">
              Know if a property is safe before you fall in love with it.
            </p>
          </div>
        </div>
      )}

      {/* Persistent Top Bar */}
      <TopBar currentView={currentView} onNavigate={handleNavigate} />

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
          />
        )}

        {currentView === 'project' && (
          <ProjectView
            project={selectedProject}
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
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
      </main>

      {/* Footer with Mandatory Disclaimer & Advisor Demo Toggle */}
      <Footer
        isAdvisorDemoOpen={isAdvisorDemoOpen}
        onToggleAdvisorDemo={() => setIsAdvisorDemoOpen(!isAdvisorDemoOpen)}
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
    </div>
  );
}
