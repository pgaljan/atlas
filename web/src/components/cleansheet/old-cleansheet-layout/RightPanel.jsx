import React, { useState } from 'react';
import CoachCard from './CoachCard';

export default function RightPanel({
  user,
  leaders,
  activeLeader,
  onSelectLeader,
  calendarItems = [],
}) {
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  return (
    <div className="space-y-4 relative">
      <CoachCard user={user} />

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-800">Calendar</div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#1E40AF]">Sync Calendar</span>
            <button className="text-[#1E40AF] text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setOutlookConnected(!outlookConnected)}
              className={`w-full border rounded-md py-1.5 text-sm flex items-center justify-center gap-2 transition
                ${
                  outlookConnected
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-[#BFDBFE] text-[#1E3A8A] hover:bg-[#F8FAFC]'
                }`}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/732/732223.png"
                alt="Outlook"
                className="w-4 h-4"
              />
              {outlookConnected ? 'Outlook Connected' : 'Connect Outlook'}
            </button>

            <button
              onClick={() => setGoogleConnected(!googleConnected)}
              className={`w-full border rounded-md py-1.5 text-sm flex items-center justify-center gap-2 transition
                ${
                  googleConnected
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-[#BFDBFE] text-[#1E3A8A] hover:bg-[#F8FAFC]'
                }`}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281769.png"
                alt="Google Calendar"
                className="w-4 h-4"
              />
              {googleConnected ? 'Google Connected' : 'Connect Google Calendar'}
            </button>

            <p className="text-xs text-[#2563EB] text-center mt-1">
              Sync both ways to keep all your appointments in one place
            </p>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5">
          {calendarItems.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color} inline-block`} />
              <span className="text-slate-700">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-800">Cleansheet AI</div>
          <div className="text-xs text-slate-400">DEMO MODE</div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-md p-3 text-sm text-emerald-700">
            AI assistant ready
          </div>
        </div>
      </div>
    </div>
  );
}
