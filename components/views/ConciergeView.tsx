'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  ArrowRight, 
  PhoneCall, 
  RotateCcw,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import { ProjectSafetyItem } from '@/lib/mock-data';
import { ViewType } from '@/components/TopBar';
import { UserPreferences } from '@/app/page';

interface ConciergeViewProps {
  onNavigate: (view: ViewType) => void;
  selectedProject: ProjectSafetyItem;
  userPreferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onUpdateTranscript?: (messages: { sender: 'assistant' | 'user'; text: string; time: string }[]) => void;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  time: string;
  quickReplies?: string[];
  isSummary?: boolean;
}

export function ConciergeView({
  onNavigate,
  selectedProject,
  userPreferences,
  onUpdatePreferences,
  onUpdateTranscript,
}: ConciergeViewProps) {
  const [scriptStep, setScriptStep] = useState<number>(1);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  const [budgetAnswer, setBudgetAnswer] = useState<string>('');
  const [purposeAnswer, setPurposeAnswer] = useState<string>(userPreferences.lookingFor || '');
  const [timelineAnswer, setTimelineAnswer] = useState<string>(userPreferences.timeline || '');
  const [browsingFocus, setBrowsingFocus] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounter = useRef(1);
  const nextId = (prefix: string) => `${prefix}-${++messageCounter.current}`;

  const isNRI = userPreferences.location === 'Abroad (NRI)';

  const getInitialGreeting = () => {
    const nriNote = isNRI ? ' and coordinating remote due diligence from abroad' : '';
    const purposeNote = userPreferences.lookingFor ? ` for ${userPreferences.lookingFor.toLowerCase()}` : '';
    return `Hello. Welcome to the House of Investors Wealth Desk. I am Ananya. I see you are evaluating ${selectedProject.name} in ${selectedProject.location}${purposeNote}${nriNote}.\n\nTo help our diligence team tailor advice to your goals, what budget range are you planning for this acquisition?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: getInitialGreeting(),
      time: 'Just now',
      quickReplies: ['Under ₹1 Crore', '₹1 Cr – ₹2.5 Cr', '₹2.5 Cr – ₹4 Cr', 'Above ₹4 Crore'],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (onUpdateTranscript) {
      onUpdateTranscript(
        messages.map((m) => ({
          sender: m.sender,
          text: m.text,
          time: m.time,
        }))
      );
    }
  }, [messages, isTyping, onUpdateTranscript]);

  const handleUserResponse = (answerText: string) => {
    if (!answerText.trim() || isTyping) return;

    const userMsg: Message = {
      id: nextId('u'),
      sender: 'user',
      text: answerText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 700ms scripted delay
    setTimeout(() => {
      setIsTyping(false);

      if (scriptStep === 1) {
        setBudgetAnswer(answerText);
        onUpdatePreferences({ budget: answerText });
        setScriptStep(2);

        setMessages((prev) => [
          ...prev,
          {
            id: nextId('a'),
            sender: 'assistant',
            text: `Understood, budgeting ${answerText} gives you options in ${selectedProject.microMarket}.\n\nAre you looking at this property for personal living, investment growth, or both?`,
            time: 'Just now',
            quickReplies: [
              'Live (Primary Home)',
              'Invest (Rental / Growth)',
              'Both (Live later, rent now)',
            ],
          },
        ]);
      } else if (scriptStep === 2) {
        setPurposeAnswer(answerText);
        onUpdatePreferences({
          lookingFor: answerText.includes('Live')
            ? 'A home to live in'
            : answerText.includes('Invest')
            ? 'An investment'
            : 'Not sure yet',
          purpose: answerText,
        });
        setScriptStep(3);

        setMessages((prev) => [
          ...prev,
          {
            id: nextId('a'),
            sender: 'assistant',
            text: `Got it. For ${answerText.toLowerCase()}, understanding possession milestones is essential.\n\nWhen are you planning to finalize and purchase?`,
            time: 'Just now',
            quickReplies: ['Within 3 months', '6 to 12 months', 'Just browsing'],
          },
        ]);
      } else if (scriptStep === 3) {
        setTimelineAnswer(answerText);
        onUpdatePreferences({ timeline: answerText as any });

        // CRITICAL CONDITION: If user taps "Just browsing", respond gently with a long-term question instead of pushing a call
        if (answerText.toLowerCase().includes('browsing') || answerText.toLowerCase().includes('exploring')) {
          setScriptStep(35);
          setMessages((prev) => [
            ...prev,
            {
              id: nextId('a'),
              sender: 'assistant',
              text: `That makes complete sense. Hyderabad's micro-markets like ${selectedProject.microMarket} require careful observation.\n\nAre you tracking price trends or waiting for specific infrastructure milestones like Metro expansions?`,
              time: 'Just now',
              quickReplies: [
                'Watching price trends',
                'Waiting for Metro / Infra',
                'Just learning the market',
              ],
            },
          ]);
        } else {
          setScriptStep(4);
          renderSummaryCard(budgetAnswer, purposeAnswer, answerText);
        }
      } else if (scriptStep === 35) {
        setBrowsingFocus(answerText);
        setScriptStep(4);
        renderSummaryCard(budgetAnswer, purposeAnswer, 'Just browsing');
      }
    }, 700);
  };

  const renderSummaryCard = (
    finalBudget: string,
    finalPurpose: string,
    finalTimeline: string
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId('summary'),
        sender: 'assistant',
        text: `Thank you for sharing your preferences. I have assembled your curated profile so our Senior Advisory Lead is fully briefed before your conversation.`,
        time: 'Just now',
        isSummary: true,
      },
    ]);
  };

  const getLeadTemperature = () => {
    if (timelineAnswer.includes('3 months')) {
      return { label: 'Hot', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    if (timelineAnswer.includes('6 to 12')) {
      return { label: 'Warm', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    return { label: 'Cool', color: 'bg-sky-100 text-sky-800 border-sky-300' };
  };

  const handleResetConversation = () => {
    setScriptStep(1);
    setBudgetAnswer('');
    setPurposeAnswer(userPreferences.lookingFor || '');
    setTimelineAnswer(userPreferences.timeline || '');
    setBrowsingFocus('');
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: getInitialGreeting(),
        time: 'Just now',
        quickReplies: ['Under ₹1 Crore', '₹1 Cr – ₹2.5 Cr', '₹2.5 Cr – ₹4 Cr', 'Above ₹4 Crore'],
      },
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('project')}
          className="text-xs font-semibold text-stone-600 hover:text-[#0F1B2D] inline-flex items-center gap-1.5 py-1 min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to Project Report</span>
        </button>
      </div>

      {/* 1. HEADER */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          {/* Human Advisor Avatar Group */}
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0E7C86] text-white text-[10px] font-bold ring-2 ring-white">
              AN
            </span>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#B8893B] text-white text-[10px] font-bold ring-2 ring-white">
              VK
            </span>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 text-white text-[10px] font-bold ring-2 ring-white">
              PR
            </span>
          </div>

          <div>
            <h1 className="font-serif font-bold text-base text-[#0F1B2D]">
              HoI Wealth Desk Assistant
            </h1>
            <p className="text-xs text-stone-500">
              Assisting with <strong>{selectedProject.name}</strong> ({selectedProject.location})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Small "Immediate Replies" Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Immediate Replies</span>
          </div>

          <button
            type="button"
            onClick={handleResetConversation}
            title="Restart conversation"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 2. CHAT MESSAGES WINDOW */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 min-h-[460px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left ${
                  msg.sender === 'user'
                    ? 'bg-[#0E7C86] text-white'
                    : 'bg-[#FAF8F5] text-stone-800 border border-stone-200'
                }`}
              >
                {msg.text}
              </div>

              <span className="text-[10px] text-stone-400 mt-1 px-1">
                {msg.time}
              </span>

              {/* SUMMARY CARD AT THE END */}
              {msg.isSummary && (
                <div className="w-full mt-4 p-5 rounded-xl bg-[#FAF8F5] border border-[#B8893B] space-y-4 text-left animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#B8893B]" strokeWidth={1.5} />
                      <h3 className="font-serif font-bold text-base text-[#0F1B2D]">
                        Your Summary
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-stone-500 font-medium">Priority:</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${getLeadTemperature().color}`}>
                        {getLeadTemperature().label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-stone-200">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Project</span>
                      <strong className="text-[#0F1B2D]">{selectedProject.name}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Budget</span>
                      <strong className="text-[#0F1B2D]">{budgetAnswer || '₹1 Cr – ₹2.5 Cr'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Purpose</span>
                      <strong className="text-[#0F1B2D]">{purposeAnswer || 'Live / Invest'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Timeline</span>
                      <strong className="text-[#0F1B2D]">{timelineAnswer || 'Within 6 months'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">NRI Status</span>
                      <strong className="text-[#0F1B2D]">{isNRI ? 'Yes (Overseas)' : 'No (Resident)'}</strong>
                    </div>
                    {browsingFocus && (
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Focus</span>
                        <strong className="text-[#0F1B2D]">{browsingFocus}</strong>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-stone-500">
                    Your advisor will see this so you never repeat yourself.
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate('booking')}
                    className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#B8893B] hover:bg-[#9E742E] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" strokeWidth={1.5} />
                    <span>Book a free advisor call</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              )}

              {/* Quick Reply Buttons */}
              {msg.quickReplies && (
                <div className="flex flex-wrap gap-2 mt-3 w-full">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => handleUserResponse(reply)}
                      disabled={isTyping}
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-[#0F1B2D] border border-stone-200 text-xs font-semibold transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>{reply}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-stone-500 text-xs py-1">
              <span className="text-[10px] font-bold text-[#0E7C86]">AN:</span>
              <span className="text-[11px] text-stone-500 italic">Ananya is reviewing project records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. CHAT INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserResponse(inputText);
          }}
          className="pt-3 border-t border-stone-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your reply or pick an option above..."
            disabled={isTyping}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0E7C86] transition-colors min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-3 rounded-xl bg-[#0E7C86] hover:bg-[#095961] text-white text-xs font-semibold min-h-[44px] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </form>
      </div>

      <div className="text-[11px] text-stone-500 text-center">
        Confidential client intake · House of Investors Real Estate Advisory
      </div>
    </div>
  );
}
