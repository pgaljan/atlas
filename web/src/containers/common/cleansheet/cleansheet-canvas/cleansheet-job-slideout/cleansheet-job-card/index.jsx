import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { IoTrash } from 'react-icons/io5';

export default function JobCard({ job = {}, index = 0, onEdit, onDelete, onOpen }) {
  const isExample = !!job.isExample;
  const status = (job.status || 'interested').toLowerCase();

  const STATUS_MAP = {
    applied: { bg: 'bg-[#e3f2fd]', text: 'text-[#1976d2]' },
    interviewing: { bg: 'bg-[#fff3e0]', text: 'text-[#f57c00]' },
    offer: { bg: 'bg-[#e8f5e9]', text: 'text-[#388e3c]' },
    rejected: { bg: 'bg-[#ffebee]', text: 'text-[#d32f2f]' },
    interested: { bg: 'bg-[#f3e5f5]', text: 'text-[#7b1fa2]' },
    'not-interested': { bg: 'bg-[#f5f5f5]', text: 'text-[#666666]' },
  };

  const st = STATUS_MAP[status] || STATUS_MAP.interested;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

  const colors = {
    primaryBlue: '#0066CC',
    accentBlue: '#004C99',
    dark: '#1a1a1a',
    neutralText: '#333333',
    neutralTextLight: '#666666',
    subneutralTextLight: '#666',
    neutralTextMuted: '#999999',
    neutralBackground: '#f5f5f7',
    neutralBackgroundSecondary: '#f8f8f8',
    neutralBorder: '#e5e5e7',
    white: '#ffffff',
  };
  return (
    <article
      role="button"
      aria-label={`${job.title || 'Job'} at ${job.company || ''}`}
      onClick={(e) => {
        if (e.target.closest('button')) return;
        onOpen?.(index);
      }}
      className={`relative w-full rounded-lg border border-[#e5e7eb] p-[14px] bg-white transition-all 
        hover:shadow-md hover:-translate-y-[2px] cursor-pointer flex flex-col justify-between`}
      style={{
        borderLeft: `4px solid ${isExample ? '#e3f2fd' : '#0066CC'}`,
      }}
    >
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-[#1a1a1a] leading-tight mb-[4px] truncate">
            {job.title || 'Untitled role'}
          </h3>

          <div className="text-xs font-normal text-[#0066CC] mt-2 mb-2 truncate">
            {job.company || '—'}
          </div>

          {job.location && (
            <div className="flex items-center gap-1 text-[11px] text-[#999999] mb-[8px]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{job.location}</span>
            </div>
          )}

          {job.salary && (
            <div className="text-xs font-semibold text-[#333333] mb-[8px]">{job.salary}</div>
          )}

          <div className="flex items-center gap-2 mb-[8px]">
            <span
              className={`inline-block px-2 py-[3px] rounded-[10px] text-[9px] font-semibold ${st.bg} ${st.text}`}
            >
              {statusLabel}
            </span>

            {isExample && (
              <span className="inline-block px-[8px] py-[3px] rounded-[10px] text-[9px] font-semibold bg-[#e3f2fd] text-[#1976d2]">
                Example
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(index);
            }}
            title="Edit"
            aria-label="Edit job"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[16px] transition-all duration-200 transform hover:scale-110"
            style={{
              background: 'none',
              border: 'none',
              color: colors.primaryBlue,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.accentBlue)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.primaryBlue)}
          >
            <FaEdit size={13} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isExample) return;
              onDelete?.(index);
            }}
            title={isExample ? 'Cannot delete example job' : 'Delete'}
            aria-label="Delete job"
            disabled={isExample}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-[16px] transition-all duration-200 transform ${
              isExample ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'
            }`}
            style={{
              background: 'none',
              border: 'none',
              color: isExample ? '#9ca3af' : colors.primaryBlue,
              transition: 'color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isExample) e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              if (!isExample) e.currentTarget.style.color = colors.primaryBlue;
            }}
          >
            <IoTrash size={14} />
          </button>
        </div>
      </div>

      <div className="border-t border-[#e5e7eb] mt-[10px]" />

      {job.skills?.length > 0 && (
        <div className="mt-3">
          <div className="text-[12px] font-normal text-[#666] mb-1">Required Skills</div>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-[3px] rounded-md bg-[#e3f2fd] text-[#0066CC] border border-[#bbdefb]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.competencies?.length > 0 && (
        <div className="mt-3">
          <div className="text-[12px] font-normal text-[#666] mb-1">Key Competencies</div>
          <div className="flex flex-wrap gap-2">
            {job.competencies.map((c, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-[2px] rounded-md bg-[#f5f5f7] text-[#666] "
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
