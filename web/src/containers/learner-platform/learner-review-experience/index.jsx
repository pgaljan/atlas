import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { fetchCleansheetProfile } from '../../../redux/slices/cleansheet';

const CATEGORY_META = {
  accomplishments: { label: 'Accomplishments', pillClass: 'bg-blue-100 text-blue-800' },
  tasks: { label: 'Tasks', pillClass: 'bg-green-100 text-green-800' },
  technologies: { label: 'Technologies', pillClass: 'bg-purple-100 text-purple-800' },
  competencies: { label: 'Competencies', pillClass: 'bg-orange-100 text-orange-800' },
  priorities: { label: 'Priorities', pillClass: 'bg-red-100 text-red-800' },
};

const Pill = ({ children, className }) => (
  <span
    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md shadow-sm ring-1 ring-inset ${className}`}
  >
    {children}
  </span>
);

Pill.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default function LearnerExperienceReview({ positions = undefined, onEdit }) {
  const dispatch = useDispatch();
  const [fetchedPositions, setFetchedPositions] = useState(null);

  const effectivePositions = positions && positions.length > 0 ? positions : fetchedPositions || [];

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (positions && positions.length > 0) return;
      const userId = Cookies.get('atlas_user_id') || null;
      if (!userId) {
        setFetchedPositions([]);
        return;
      }
      try {
        const res = await dispatch(fetchCleansheetProfile(userId)).unwrap();
        if (!mounted) return;
        const exps = Array.isArray(res.experiences) ? res.experiences : [];
        const mapped = exps.map((e, idx) => ({
          id: e.id || `exp-${idx}-${Date.now()}`,
          company: e.organizationName || '',
          title: e.role || '',
          location: e.location || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          currentlyWorking: !e.endDate || e.endDate === '',
          description: e.description || '',
          accomplishments: Array.isArray(e.achievements) ? e.achievements : [],
          tasks: Array.isArray(e.keySkills) ? e.keySkills : [],
          tools: (Array.isArray(e.technologies) ? e.technologies : []).map((t) => t.name),
          technologies: Array.isArray(e.technologies) ? e.technologies : [],
          internalStakeholders: Array.isArray(e.internalStakeholders) ? e.internalStakeholders : [],
          externalStakeholders: Array.isArray(e.externalStakeholders) ? e.externalStakeholders : [],
          competencies: Array.isArray(e.competencies) ? e.competencies : [],
          priorities: Array.isArray(e.priorities) ? e.priorities : [],
          projectTypes: Array.isArray(e.projectTypes) ? e.projectTypes : [],
        }));
        setFetchedPositions(mapped);
      } catch (err) {
        console.warn('Failed to fetch cleansheet profile for LearnerExperienceReview', err);
        setFetchedPositions([]);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [dispatch, positions]); 

  const hasPositions = effectivePositions && effectivePositions.length > 0;

  const displayPositions = useMemo(
    () =>
      (effectivePositions || []).map((p) => ({
        ...p,
        accomplishments: Array.isArray(p.accomplishments) ? p.accomplishments : [],
        tasks: Array.isArray(p.tasks) ? p.tasks : [],
        tools: Array.isArray(p.tools) ? p.tools : [],
        competencies: Array.isArray(p.competencies) ? p.competencies : [],
        priorities: Array.isArray(p.priorities) ? p.priorities : [],
        technologies:
          Array.isArray(p.technologies) && p.technologies.length
            ? p.technologies
            : Array.isArray(p.tools)
              ? p.tools.map((t) => ({ name: t, type: 'Peripheral' }))
              : [],
      })),
    [effectivePositions],
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
            No work experience available to review. Add an experience first.
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
                  {Array.isArray(p.internalStakeholders) && p.internalStakeholders.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2">
                      <div className="w-full sm:w-40 text-sm text-gray-600 font-medium">
                        Internal Stakeholders
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.internalStakeholders.map((s, i) => (
                          <Pill key={i} className="bg-gray-100 text-gray-800 ring-gray-200">
                            {s}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(p.externalStakeholders) && p.externalStakeholders.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2">
                      <div className="w-full sm:w-40 text-sm text-gray-600 font-medium">
                        External Stakeholders
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.externalStakeholders.map((s, i) => (
                          <Pill key={i} className="bg-gray-50 text-gray-700 ring-gray-100">
                            {s}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(CATEGORY_META).map((key) => {
                    if (key === 'technologies') {
                      const items = p.technologies || [];
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
                            {items.map((it, i) => {
                              const isCore = (it.type || '').toLowerCase() === 'core';
                              const pillClass = isCore
                                ? 'bg-green-50 text-green-800 ring-green-200 border border-green-200'
                                : 'bg-gray-100 text-gray-700 ring-gray-200';
                              return (
                                <Pill key={i} className={pillClass}>
                                  <span className="truncate max-w-[12rem]">{it.name}</span>
                                  {isCore ? (
                                    <span className="ml-2 text-[10px] font-medium opacity-90">
                                      (Core)
                                    </span>
                                  ) : (
                                    <span className="ml-2 text-[10px] text-gray-500">
                                      (Peripheral)
                                    </span>
                                  )}
                                </Pill>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

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
                          {items.map((it, i) => (
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
