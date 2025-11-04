import React, { useState } from 'react';
import BehavioralTab from './behavioral-tab';
import TechnicalPrep from './technical-tab';

export default function InterviewPrepSlideout({
  currentPersona = 'retail-manager',
  initialBehavioralStories = [],
}) {
  const [activeMainTab, setActiveMainTab] = useState('behavioral');

  return (
    <div className="interview-slideout w-full max-h-[calc(100vh-120px)] overflow-y-auto bg-transparent p-4">
      <div>
        <div
          role="tablist"
          aria-label="Interview main tabs"
          className="flex mb-4 border-b-0"
          style={{ borderBottom: '2px solid var(--color-neutral-border)' }}
        >
          <button
            role="tab"
            aria-selected={activeMainTab === 'behavioral'}
            onClick={() => setActiveMainTab('behavioral')}
            className="flex-1 text-center px-6 py-3 text-sm font-semibold border-b-4 focus:outline-none transition-none"
            style={{
              color:
                activeMainTab === 'behavioral'
                  ? 'var(--color-primary-blue)'
                  : 'var(--color-neutral-text-light)',
              borderBottomColor:
                activeMainTab === 'behavioral' ? 'var(--color-primary-blue)' : 'transparent',
              background: 'transparent',
            }}
          >
            Behavioral
          </button>

          <button
            role="tab"
            aria-selected={activeMainTab === 'technical'}
            onClick={() => setActiveMainTab('technical')}
            className="flex-1 text-center px-6 py-3 text-sm font-semibold border-b-4 focus:outline-none transition-none"
            style={{
              color:
                activeMainTab === 'technical'
                  ? 'var(--color-primary-blue)'
                  : 'var(--color-neutral-text-light)',
              borderBottomColor:
                activeMainTab === 'technical' ? 'var(--color-primary-blue)' : 'transparent',
              background: 'transparent',
            }}
          >
            Technical
          </button>
        </div>

        <div className={activeMainTab === 'behavioral' ? 'block' : 'hidden'}>
          <BehavioralTab
            currentPersona={currentPersona}
            initialStories={initialBehavioralStories}
          />
        </div>

        <div className={activeMainTab === 'technical' ? 'block' : 'hidden'}>
          <TechnicalPrep />
        </div>
      </div>
    </div>
  );
}
