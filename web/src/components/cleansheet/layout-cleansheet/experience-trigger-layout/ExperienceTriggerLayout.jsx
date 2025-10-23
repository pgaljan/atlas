import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ExperienceTriggerLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="relative bg-[#0B0F1A] text-white shadow-sm border-b border-gray-800 h-20 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 flex items-center gap-2 px-4 py-2 rounded-md bg-[#151A25] border border-[#2A3143]
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
          <span className="text-sm font-medium">Home</span>
        </button>

        <div className="w-full max-w-screen-xl mx-auto px-4">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-200 pl-6">
            Experience Tagger
          </h1>
        </div>
      </header>

      <main className="max-w-[1430px] mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ExperienceTriggerLayout;
