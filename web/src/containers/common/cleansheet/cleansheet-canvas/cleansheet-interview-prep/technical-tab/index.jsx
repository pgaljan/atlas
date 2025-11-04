import React, { useState } from 'react';
import { PiPlusCircle, PiQuestion, PiBuildings, PiVideoCamera } from 'react-icons/pi';
import PlaceholderPanel from '../empty-content-state';

export default function TechnicalPrep({ onAddQuestion, onAddCompany, onScheduleMock }) {
  const [currentTechTab, setCurrentTechTab] = useState('questions');

  function addTechnicalQuestion() {
    if (onAddQuestion) return onAddQuestion();
    alert('Technical Questions feature coming soon!');
  }
  function addCompanyResearch() {
    if (onAddCompany) return onAddCompany();
    alert('Company Research feature coming soon!');
  }
  function addMockSession() {
    if (onScheduleMock) return onScheduleMock();
    alert('Mock Interview Sessions feature coming soon!');
  }

  function renderQuestionsPlaceholder() {
    return (
      <PlaceholderPanel
        icon={<PiQuestion />}
        title={`Track technical questions you've encountered or want to practice.`}
        subtitle={`Coming soon: Add questions with your answers, solutions, and notes.`}
      />
    );
  }

  function renderResearchPlaceholder() {
    return (
      <PlaceholderPanel
        icon={<PiBuildings />}
        title={`Organize research on companies you're interviewing with.`}
        subtitle={`Coming soon: Track tech stack, culture notes, interviewers, and key talking points.`}
      />
    );
  }

  function renderMockPlaceholder() {
    return (
      <PlaceholderPanel
        icon={<PiVideoCamera />}
        title={`Schedule and track mock interview sessions.`}
        subtitle={`Coming soon: Book sessions with mentors, record feedback, and review performance.`}
      />
    );
  }

  return (
    <div className="slideout-body" id="technicalContent">
      <div
        role="tablist"
        aria-label="Technical sub tabs"
        className="flex mb-4 border-b-0"
        style={{ borderBottom: '2px solid var(--color-neutral-border)' }}
      >
        <button
          role="tab"
          aria-selected={currentTechTab === 'questions'}
          onClick={() => setCurrentTechTab('questions')}
          className="flex-1 text-center px-6 py-3 text-sm font-semibold border-b-4 focus:outline-none transition-none"
          style={{
            color:
              currentTechTab === 'questions'
                ? 'var(--color-primary-blue)'
                : 'var(--color-neutral-text-light)',
            borderBottomColor:
              currentTechTab === 'questions' ? 'var(--color-primary-blue)' : 'transparent',
            background: 'transparent',
          }}
        >
          Questions
        </button>

        <button
          role="tab"
          aria-selected={currentTechTab === 'research'}
          onClick={() => setCurrentTechTab('research')}
          className="flex-1 text-center px-6 py-3 text-sm font-semibold border-b-4 focus:outline-none transition-none"
          style={{
            color:
              currentTechTab === 'research'
                ? 'var(--color-primary-blue)'
                : 'var(--color-neutral-text-light)',
            borderBottomColor:
              currentTechTab === 'research' ? 'var(--color-primary-blue)' : 'transparent',
            background: 'transparent',
          }}
        >
          Company Research
        </button>

        <button
          role="tab"
          aria-selected={currentTechTab === 'mock'}
          onClick={() => setCurrentTechTab('mock')}
          className="flex-1 text-center px-6 py-3 text-sm font-semibold border-b-4 focus:outline-none transition-none"
          style={{
            color:
              currentTechTab === 'mock'
                ? 'var(--color-primary-blue)'
                : 'var(--color-neutral-text-light)',
            borderBottomColor:
              currentTechTab === 'mock' ? 'var(--color-primary-blue)' : 'transparent',
            background: 'transparent',
          }}
        >
          Mock Interviews
        </button>
      </div>

      {/* Questions */}
      <div className={currentTechTab === 'questions' ? 'block' : 'hidden'}>
        <div className="mb-4">
          <button
            onClick={addTechnicalQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold focus:outline-none"
            style={{ background: 'var(--color-primary-blue)', color: 'white', border: 'none' }}
          >
            <PiPlusCircle />
            Add Question
          </button>
        </div>

        <div id="questionsContainer" className="min-h-[240px] flex items-center justify-center">
          {renderQuestionsPlaceholder()}
        </div>
      </div>

      {/* Research */}
      <div className={currentTechTab === 'research' ? 'block' : 'hidden'}>
        <div className="mb-4">
          <button
            onClick={addCompanyResearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold focus:outline-none"
            style={{ background: 'var(--color-primary-blue)', color: 'white', border: 'none' }}
          >
            <PiPlusCircle />
            Add Company
          </button>
        </div>

        <div id="researchContainer" className="min-h-[240px] flex items-center justify-center">
          {renderResearchPlaceholder()}
        </div>
      </div>

      {/* Mock */}
      <div className={currentTechTab === 'mock' ? 'block' : 'hidden'}>
        <div className="mb-4">
          <button
            onClick={addMockSession}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold focus:outline-none"
            style={{ background: 'var(--color-primary-blue)', color: 'white', border: 'none' }}
          >
            <PiPlusCircle />
            Schedule Session
          </button>
        </div>

        <div id="mockContainer" className="min-h-[240px] flex items-center justify-center">
          {renderMockPlaceholder()}
        </div>
      </div>
    </div>
  );
}
