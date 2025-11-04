import React, { useState } from 'react';
import CleansheetCanvasHeader from './CleanSheetCanvasHeader';
import { Outlet } from 'react-router-dom';

export default function CleansheetCanvasLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'seeker');

  const handleModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };
  return (
    <div className="h-screen flex flex-col bg-custom-neutralBackground relative overflow-hidden">
      <CleansheetCanvasHeader viewMode={viewMode} onModeChange={handleModeChange} />

      <main className="flex-1 relative min-h-0 ">
        <div className="rounded-xl shadow-inner p-4 md:p-6 h-full min-h-0 flex flex-col relative overflow-hidden">
          <div
            className={`grid gap-4 transition-[grid-template-columns] duration-500 ease-in-out h-full ${
              collapsed ? 'grid-cols-[0_1fr]' : 'grid-cols-[360px_1fr]'
            }`}
          >
            <aside
              aria-hidden={collapsed}
              className={`flex flex-col gap-4 transition-all duration-500 ease-in-out transform ${
                collapsed
                  ? 'opacity-0 -translate-x-6 pointer-events-none'
                  : 'opacity-100 translate-x-0'
              } h-full min-h-0`}
            >
              <div className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h3 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.5" />
                      <path d="M16 3v4M8 3v4" strokeWidth="1.5" />
                    </svg>
                    Upcoming Events
                  </h3>

                  <button
                    onClick={() => alert('Sync Outlook')}
                    className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 border-2 border-[#0066CC] text-[#0066CC] rounded-md hover:bg-[#0066CC] hover:text-white transition"
                  >
                    Sync Outlook
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {[
                    {
                      time: 'Today, 2:00 PM',
                      title: 'Interview: Senior Developer',
                      details: 'TechCorp - Final Round (Virtual)',
                    },
                    {
                      time: 'Tomorrow, 10:00 AM',
                      title: 'Coffee Chat: Referral',
                      details: 'Sarah Chen - Starbucks Downtown',
                    },
                    {
                      time: 'Wed, 3:30 PM',
                      title: 'Application Deadline',
                      details: 'Cloud Architect - Amazon AWS',
                    },
                  ].map((event, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md bg-gray-50 border-l-[3px] border-[#0066CC]"
                    >
                      <div className="text-[10px] font-semibold text-[#0066CC] mb-1">
                        {event.time}
                      </div>
                      <div className="text-[12px] font-semibold text-gray-800">{event.title}</div>
                      <div className="text-[10px] text-gray-500">{event.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5 flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h3 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M2 12h20M2 12l4-4M22 12l-4 4" strokeWidth="1.5" />
                    </svg>
                    Cleansheet AI Assistant
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 space-y-3 text-[13px] text-gray-800 min-h-0">
                  <div className="bg-gray-50 p-3 rounded-md">
                    Hi! I'm your Cleansheet AI assistant. I can help you with:
                    <ul className="list-disc ml-5 mt-2 text-[13px] space-y-1 text-gray-700">
                      <li>Resume and cover letter tips</li>
                      <li>Interview preparation</li>
                      <li>Career path guidance</li>
                      <li>Job search strategies</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-gray-200 pt-3">
                  <input
                    id="aiInput"
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-md text-[13px] outline-none focus:border-[#0066CC] transition"
                    placeholder="Ask me anything about your job search..."
                  />
                  <button
                    onClick={() => alert('Send')}
                    className="px-3 py-2 bg-[#0066CC] text-white rounded-md hover:bg-[#005bb5] transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </aside>

            <section className="relative overflow-hidden h-full min-h-0">
              <div className="h-full min-h-0 flex items-stretch">
                <Outlet context={{ viewMode }} />
              </div>
            </section>
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`absolute z-20 top-1/2 -translate-y-1/2 flex items-center justify-center 
                w-8 h-16 bg-white border border-gray-300 shadow-lg rounded-r-lg 
                text-gray-700 hover:bg-[#0066CC] hover:text-white transition-all duration-300 ease-in-out 
                ${collapsed ? 'left-0' : 'left-[374px]'}`}
            aria-label={collapsed ? 'Open panel' : 'Collapse panel'}
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ease-in-out ${
                collapsed ? 'rotate-180' : 'rotate-0'
              }`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path d="M7 5l5 5-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </main>

      <footer className="p-4 text-center text-gray-500 text-xs">
        © 2025 Cleansheet LLC. All rights reserved.
      </footer>
    </div>
  );
}
