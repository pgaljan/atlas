import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const CATEGORY_META = {
  accomplishments: { label: 'Accomplishments', pillClass: 'bg-blue-100 text-blue-800' },
  tasks: { label: 'Tasks', pillClass: 'bg-green-100 text-green-800' },
  tools: { label: 'Tools', pillClass: 'bg-purple-100 text-purple-800' },
  competencies: { label: 'Competencies', pillClass: 'bg-orange-100 text-orange-800' },
  priorities: { label: 'Priorities', pillClass: 'bg-red-100 text-red-800' },
};

const Pill = ({ children, className }) => (
  <span
    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md shadow-sm ring-1 ring-inset ring-gray-100 ${className}`}
  >
    {children}
  </span>
);

Pill.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default function LearnerExperienceReview({ positions = [], onEdit }) {
  const hasPositions = positions && positions.length > 0;

  const displayPositions = useMemo(
    () =>
      (positions || []).map((p) => ({
        ...p,
        accomplishments: Array.isArray(p.accomplishments) ? p.accomplishments : [],
        tasks: Array.isArray(p.tasks) ? p.tasks : [],
        tools: Array.isArray(p.tools) ? p.tools : [],
        competencies: Array.isArray(p.competencies) ? p.competencies : [],
        priorities: Array.isArray(p.priorities) ? p.priorities : [],
      })),
    [positions],
  );

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <div className="bg-custom-main text-white px-4 py-3 rounded-t-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">
            3
          </div>
          <div className="font-semibold">Review Your Experience</div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-white">
        {!hasPositions ? (
          <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded text-gray-500 text-sm">
            No work experience available to review. Add a position first.
          </div>
        ) : (
          <div className="space-y-6">
            {displayPositions.map((p) => (
              <article
                key={p.id}
                className="p-4 border rounded-md bg-white shadow-sm"
                aria-labelledby={`pos-${p.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 id={`pos-${p.id}`} className="font-medium text-gray-800">
                      {p.title} <span className="text-sm text-gray-500">at {p.company}</span>
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.startDate || '—'}{' '}
                      {p.currentlyWorking ? ' — Present' : p.endDate ? ` — ${p.endDate}` : ''}
                      {p.location ? ` • ${p.location}` : ''}
                    </div>
                    {p.description && <p className="mt-3 text-sm text-gray-600">{p.description}</p>}
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit && onEdit(p)}
                      className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {Object.keys(CATEGORY_META).map((key) => {
                    const items = p[key] || [];
                    if (!items.length) return null;
                    return (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2"
                      >
                        <div className="w-full sm:w-40 text-sm text-gray-600 font-medium">
                          {CATEGORY_META[key].label}{' '}
                          <span className="text-xs text-gray-400">({items.length})</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {items?.map((it, i) => (
                            <Pill key={i} className={CATEGORY_META[key].pillClass}>
                              {it}
                            </Pill>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

LearnerExperienceReview.propTypes = {
  positions: PropTypes.array,
  onEdit: PropTypes.func,
};
