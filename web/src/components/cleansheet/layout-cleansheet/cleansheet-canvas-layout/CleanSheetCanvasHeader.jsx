import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CleansheetCanvasHeader({ viewMode, onModeChange }) {
  const navigate = useNavigate();
  const [persona, setPersona] = useState('retail-manager');
  const [activeMenu, setActiveMenu] = useState('home');
  const [profileOpen, setProfileOpen] = useState(false);

  const viewModes = ['seeker', 'learner', 'professional'];
  const personas = [
    ['retail-manager', 'Retail Manager'],
    ['chemist', 'Research Chemist'],
    ['new-graduate', 'New Graduate'],
    ['data-analyst', 'Data Analyst'],
  ];

  return (
    <header className="relative bg-[#1a1a1a] text-white border-b border-white/10 shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-5 flex items-center gap-2 px-4 py-2 rounded-md bg-[#151A25] border border-[#2A3143]
                    transition-all duration-300 hover:bg-[#1E2433] hover:border-[#3C4A66]
                    hover:shadow-[0_0_8px_#3C4A66] hover:-translate-y-[1px]"
        aria-label="Back"
      >
        <svg
          className="w-4 h-4 transition-transform duration-300"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 16L6 10L12 4"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="w-full mx-auto px-8 py-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-4">
          <h2
            className="text-[20px] font-semibold whitespace-nowrap cursor-pointer ml-32"
            onClick={() => (window.location.href = '/')}
          >
            Cleansheet Canvas Tour
          </h2>

          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {viewModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-transparent text-white/70 hover:bg-white/10'
                }`}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {personas.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPersona(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  persona === key
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-transparent text-white/70 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <nav className="flex items-center gap-1">
            {[
              ['home', 'Home', 'ph-house'],
              ['jobSearch', 'Job Search', 'ph-briefcase'],
              ['library', 'Library', 'ph-book-open'],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setActiveMenu(key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-all duration-150 ${
                  activeMenu === key
                    ? 'bg-[#0066CC]/30 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <i className={`ph ${icon} text-base`}></i>
                {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto relative">
            <button
              aria-label="Profile"
              onClick={() => setProfileOpen((p) => !p)}
              className="w-11 h-11 rounded-full bg-[#0066CC]/30 flex items-center justify-center text-white text-[15px] hover:bg-[#0066CC]/40 transition"
            >
              AM
            </button>

            <div
              className={`absolute right-0 top-[52px] bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.15)] min-w-[200px] z-[2000] transform transition-all duration-200 ${
                profileOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2'
              }`}
            >
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="font-semibold text-[14px] text-[#1A1A1A] mb-1">Alex Martinez</div>
                <div className="text-[12px] text-gray-500 capitalize">
                  {persona.replace('-', ' ')}
                </div>
              </div>

              <div className="py-2">
                <button
                  className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 transition-all"
                  onClick={() => alert('Profile clicked')}
                >
                  <i className="ph ph-user-circle text-[18px] text-[#0066CC]" />
                  <span>Profile</span>
                </button>

                <button
                  className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 transition-all"
                  onClick={() => alert('Settings clicked')}
                >
                  <i className="ph ph-gear text-[18px] text-[#0066CC]" />
                  <span>Settings</span>
                </button>

                <button
                  className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 transition-all"
                  onClick={() => alert('Logout clicked')}
                >
                  <i className="ph ph-sign-out text-[18px] text-[#0066CC]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
