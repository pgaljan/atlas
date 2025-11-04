import React from 'react';
import { PiLink, PiTrash } from 'react-icons/pi';

export default function PortfolioCard({ project, index, isUserProject, onDelete }) {
  return (
    <div
      className="bg-white rounded-lg p-4 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
      style={{
        border: '1px solid var(--color-neutral-border)',
        opacity: project.isExample ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {project.isExample && (
              <span
                className="text-[11px] font-semibold rounded px-2 py-[2px] whitespace-nowrap"
                style={{
                  background: '#fff3cd',
                  color: '#856404',
                }}
              >
                Example
              </span>
            )}
            <span
              className="text-[11px] font-semibold rounded px-2 py-[2px] whitespace-nowrap"
              style={{
                background: 'var(--color-muted-bg, #f5f5f7)',
                color: 'var(--color-muted-text, #666)',
              }}
            >
              {project.completedDate}
            </span>
          </div>

          <h4 className="m-0 text-[16px] font-semibold text-[#1a1a1a] leading-snug">
            {project.title}
          </h4>

          <p className="text-[13px] text-[#666] leading-relaxed mt-2 mb-3">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {(project.technologies || []).map((tech, i) => (
              <span
                key={`${tech}-${i}`}
                className="text-[11px] font-semibold rounded px-2 py-[3px]"
                style={{
                  background: '#e3f2fd',
                  color: '#0066CC',
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          {project.highlights && project.highlights.length > 0 && (
            <div className="pt-3 mt-3" style={{ borderTop: '1px solid #e5e5e7' }}>
              <strong className="block text-[12px] text-[#333] mb-2">Key Achievements:</strong>
              <ul className="list-disc pl-5 text-[12px] text-[#666] leading-relaxed">
                {project.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 ml-3 flex flex-col items-end gap-2">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-semibold rounded px-3 py-2"
              style={{
                background: 'var(--color-muted-bg, #f5f5f7)',
                color: 'var(--color-muted-text, #666)',
                textDecoration: 'none',
              }}
            >
              <PiLink />
              View
            </a>
          ) : null}

          {isUserProject ? (
            <button
              onClick={() => onDelete(index)}
              className="inline-flex items-center gap-2 text-[11px] font-semibold rounded px-3 py-2"
              style={{
                background: '#fff2f2',
                color: '#c33',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <PiTrash />
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
