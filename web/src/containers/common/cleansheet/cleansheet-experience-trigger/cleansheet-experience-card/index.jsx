import React, { useState } from 'react';
import { FaPencilAlt, FaTrash, FaCaretDown } from 'react-icons/fa';
import { normalizeTechs } from '../../../../../utils/cleansheet-utils';

const ExperienceCard = ({ exp, index, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  const startDate = exp.startDate
    ? new Date(exp.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : '';
  const endDate = exp.endDate
    ? new Date(exp.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : 'Present';
  const techs = normalizeTechs(exp);
  const coreTechs = techs.filter((t) => (t.type || '').toLowerCase() === 'core');
  const peripheralTechs = techs.filter((t) => (t.type || '').toLowerCase() === 'peripheral');

  return (
    <article
      data-exp-index={index}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="text-[#0066CC] font-semibold text-xl leading-tight truncate">
            {exp.role || 'Untitled Role'}
          </h3>
          <div className="text-sm text-gray-500 truncate mt-1">
            {exp.organizationName}
            {exp.location ? ` • ${exp.location}` : ''}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <button
            onClick={() => onEdit(index)}
            className="p-2 rounded text-gray-500 hover:text-[#0066CC] hover:bg-gray-100 transition-colors focus:outline-none"
            title="Edit"
          >
            <FaPencilAlt className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-2 rounded text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-colors focus:outline-none"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="text-sm font-semibold text-gray-700 mb-3">
        {startDate} {startDate || endDate ? ' - ' : ''} {endDate}
      </div>

      {exp.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{exp.description}</p>
      )}

      <div className="mt-auto">
        <button
          onClick={() => setOpen(!open)}
          className="btn-toggle flex items-center justify-between w-full text-[#0066CC] font-medium hover:text-[#004C99]"
        >
          <span>Show Details</span>
          <FaCaretDown
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          className={`experience-details transition-all duration-300 overflow-hidden ${
            open ? 'max-h-[1000px] mt-3' : 'max-h-0'
          }`}
        >
          <div className="space-y-6 mt-3">
            {(coreTechs.length || peripheralTechs.length) && (
              <div className="tag-section">
                <div className="tag-section-title">Technologies</div>
                <div className="tags space-y-2">
                  {coreTechs.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Core</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {coreTechs.map((t, i) => (
                          <span key={`${t.name}-${i}`} className="tag core">
                            {t.name}
                            <span className="tag-badge">Core</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {peripheralTechs.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Peripheral</div>
                      <div className="flex flex-wrap gap-2">
                        {peripheralTechs.map((t, i) => (
                          <span key={`${t.name}-${i}`} className="tag peripheral">
                            {t.name}
                            <span className="tag-badge">Peripheral</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {exp.competencies?.length > 0 && (
              <div className="tag-section">
                <div className="tag-section-title">Competencies</div>
                <div className="tags">
                  {exp.competencies.map((comp, i) => (
                    <span key={comp + i} className="tag">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exp.projectTypes?.length > 0 && (
              <div className="tag-section">
                <div className="tag-section-title">Project Types</div>
                <div className="tags">
                  {exp.projectTypes.map((type, i) => (
                    <span key={type + i} className="tag">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exp.internalStakeholders?.length > 0 && (
              <div className="tag-section">
                <div className="tag-section-title">Internal Stakeholders</div>
                <div className="tags">
                  {exp.internalStakeholders.map((stake, i) => (
                    <span key={stake + i} className="tag">
                      {stake}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exp.externalStakeholders?.length > 0 && (
              <div className="tag-section">
                <div className="tag-section-title">External Stakeholders</div>
                <div className="tags">
                  {exp.externalStakeholders.map((stake, i) => (
                    <span key={stake + i} className="tag">
                      {stake}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exp.achievements?.length > 0 && (
              <div className="tag-section">
                <div className="tag-section-title">Achievements</div>
                <div className="tags">
                  {exp.achievements.map((ach, i) => (
                    <span key={ach + i} className="tag">
                      {ach}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ExperienceCard;
