import React, { useMemo } from 'react';
import LevelCard from './goals-level-card';
import { PiPlusCircle } from 'react-icons/pi';
import { PiArrowsClockwise } from 'react-icons/pi';
import { PiTarget } from 'react-icons/pi';
export default function GoalsSlideout({
  open = true,
  onClose = () => {},
  currentPersona = 'retail-manager',
  exampleGoalsData,
  className = '',
}) {
  const fallback = useMemo(
    () => ({
      'retail-manager': {
        improvementGoals: [
          'Python Programming',
          'Power BI Advanced Features',
          'SQL Query Optimization',
        ],
        skills: [
          { name: 'Excel', currentLevel: 4, desiredLevel: 5 },
          { name: 'Power BI', currentLevel: 2, desiredLevel: 4 },
          { name: 'SQL', currentLevel: 2, desiredLevel: 4 },
          { name: 'Python', currentLevel: 1, desiredLevel: 3 },
          { name: 'Data Analysis', currentLevel: 3, desiredLevel: 4 },
        ],
        competencies: [
          { name: 'Leadership', currentLevel: 4, desiredLevel: 4 },
          { name: 'Operations Management', currentLevel: 4, desiredLevel: 5 },
          { name: 'Problem Solving', currentLevel: 3, desiredLevel: 4 },
          { name: 'Communication', currentLevel: 4, desiredLevel: 4 },
          { name: 'Strategic Thinking', currentLevel: 2, desiredLevel: 4 },
        ],
      },
    }),
    [],
  );

  const data = (exampleGoalsData || fallback)[currentPersona] || {
    improvementGoals: [],
    skills: [],
    competencies: [],
  };

  const improvementGoals = data.improvementGoals || [];
  const skills = data.skills || [];
  const competencies = data.competencies || [];

  const handleSync = () => {
    alert('Skills and competencies synced from your career experience!');
  };

  const handleAdd = () => {
    const name = window.prompt('Enter skill or competency name:');
    if (!name || !name.trim()) return;
    const isSkill = window.confirm('Click OK for Skill, Cancel for Competency');
    alert(`${isSkill ? 'Skill' : 'Competency'} "${name.trim()}" added (demo).`);
  };

  if (!open) return null;

  return (
    <div
      className={`w-full max-h-[calc(100vh-120px)] overflow-y-auto p-4 bg-transparent ${className}`}
    >
      <div
        className="mb-6 rounded-lg p-4"
        style={{ background: '#f8f8f8', borderLeft: '4px solid #ff9800' }}
      >
        <div className="text-[12px] font-semibold text-neutral-600 uppercase tracking-wide mb-2">
          Areas for Improvement
        </div>

        <div id="improvementGoalsPills" className="flex flex-wrap gap-2">
          {improvementGoals.length > 0 ? (
            improvementGoals.map((g) => (
              <div
                key={g}
                className="inline-flex items-center gap-2 text-white text-[12px] font-semibold rounded-full px-4 py-2 shadow"
                style={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #ff6b35 100%)',
                }}
              >
                <PiTarget size={14} className="text-current" />

                {g}
              </div>
            ))
          ) : (
            <p className="text-[#999] text-xs">No improvement goals set</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center mb-4">
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0066CC] text-white rounded-md text-xs font-semibold 
             transition-all duration-200 ease-in-out hover:bg-[var(--color-accent-blue)] hover:shadow-[0_2px_8px_rgba(0,102,204,0.3)]"
        >
          <PiPlusCircle size={16} className="text-white" />
          Add Skill/Competency
        </button>

        <button
          onClick={handleSync}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004C99] rounded-md text-xs font-semibold text-white 
             transition-all duration-200 ease-in-out hover:bg-[var(--color-dark)] hover:shadow-[0_2px_8px_rgba(0,70,153,0.3)]"
        >
          <PiArrowsClockwise />
          Sync from Experience
        </button>

        <div className="ml-auto text-[11px] text-[#666]">
          <strong>Rating Scale:</strong> 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert, 5=Master
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="skillsCompetenciesContainer">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-base font-semibold text-[#1a1a1a] pb-2 border-b-2 border-[#0066CC]">
            Skills
          </h3>

          {skills.length > 0 ? (
            skills.map((s, i) => (
              <LevelCard key={`skill-${s.name}-${i}`} item={{ ...s, fromExperience: true }} />
            ))
          ) : (
            <p className="text-neutral-400 text-[13px] p-4 text-center">
              No skills found. Add career experience or manually add skills to get started.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-base font-semibold text-[#1a1a1a] pb-2 border-b-2 border-[#004C99]">
            Competencies
          </h3>

          {competencies.length > 0 ? (
            competencies.map((c, i) => (
              <LevelCard key={`comp-${c.name}-${i}`} item={{ ...c, fromExperience: true }} />
            ))
          ) : (
            <p className="text-[#666] text-[13px] p-4 text-center">
              No competencies found. Add career experience or manually add competencies to get
              started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
