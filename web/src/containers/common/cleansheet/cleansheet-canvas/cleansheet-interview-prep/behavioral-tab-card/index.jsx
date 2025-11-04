import React from 'react';
import { PiPencilSimple, PiTrash } from 'react-icons/pi';

export default function StoryCard({ story, isUserStory, onEdit, onDelete }) {
  return (
    <div
      className="bg-white rounded-lg p-4 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        border: '1px solid var(--color-neutral-border)',
        opacity: story.isExample ? 0.95 : 1,
        ...(story.isExample ? { background: '#fafbfc', borderLeft: '4px solid #e3f2fd' } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {story.isExample && (
              <span
                className="text-[11px] font-semibold rounded px-2 py-[2px] whitespace-nowrap"
                style={{ background: '#e3f2fd', color: '#0066CC' }}
              >
                Example Story
              </span>
            )}
          </div>

          <h3 className="m-0 text-sm font-semibold text-[#1a1a1a] leading-snug">{story.title}</h3>

          {story.experience && (
            <div className="text-xs text-[#666666] mt-1 mb-2 italic">
              Related to: {story.experience}
            </div>
          )}

          <div className="mt-2 space-y-3">
            <div>
              <div className="text-xs font-semibold text-[#0066CC]">SITUATION</div>
              <div className="text-[13px] text-[#333333] mt-1">{story.situation}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#0066CC]">TASK</div>
              <div className="text-xs text-[#333333] mt-1">{story.task}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#0066CC]">ACTION</div>
              <div className="text-xs text-[#333333] mt-1">{story.action}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#0066CC]">RESULT</div>
              <div className="text-xs text-[#333333] mt-1">{story.result}</div>
            </div>
          </div>

          {story.competencies && story.competencies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {story?.competencies?.map((c, i) => (
                <span
                  key={i}
                  className="text-[9px] font-semibold rounded px-2 py-[3px]"
                  style={{ background: '#e3f2fd', color: '#1a1a1a' }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {isUserStory && (
          <div className="flex-shrink-0 ml-3 flex items-start ">
            <button
              onClick={onEdit}
              aria-label="Edit story"
              className="inline-flex items-center justify-center p-2 rounded transition-transform duration-150 transform hover:scale-110 focus:outline-none"
            >
              <PiPencilSimple
                className="text-base"
                style={{ color: 'var(--color-primary-blue)' }}
              />
            </button>

            <button
              onClick={onDelete}
              aria-label="Delete story"
              className="inline-flex items-center justify-center p-2 rounded transition-transform duration-150 transform hover:scale-110 focus:outline-none"
            >
              <PiTrash className="text-base" style={{ color: 'var(--color-primary-blue)' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
