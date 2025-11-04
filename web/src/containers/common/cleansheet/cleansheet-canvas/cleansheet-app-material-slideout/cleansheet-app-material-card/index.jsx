import React from 'react';
import { IoTrash } from 'react-icons/io5';

const typeBadgeClass = {
  Resume: 'bg-[#0066CC] text-white',
  'Cover Letter': 'bg-[#004C99] text-white',
  Email: 'bg-[#1a1a1a] text-white',
};

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

export default function ApplicationMaterialCard({
  material,
  isUserMaterial,
  onDownload,
  onDelete,
}) {
  return (
    <article
      className={`bg-white border border-[var(--color-neutral-border)] rounded-lg p-[14px] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]  ${
        material.isExample ? 'opacity-80' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* left content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold ${
                typeBadgeClass[material.type] || 'bg-gray-300 text-gray-800'
              }`}
            >
              {material.type}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-[#f5f5f7] text-[#666]">
              {material.format}
            </span>

            {material.atsOptimized && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-[#e3f2fd] text-[#0066CC]">
                ATS Optimized
              </span>
            )}

            {material.isExample && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-[#fff3cd] text-[#856404]">
                Example
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-[#1a1a1a] mb-1">{material.title}</h4>
          {material.jobOpportunity && (
            <p className="text-xs text-[#666] mb-1">For: {material.jobOpportunity}</p>
          )}
          <p className="text-xs text-[#999]">Created: {formatDate(material.createdDate)}</p>
        </div>

        {isUserMaterial && (
          <div className="flex-shrink-0 flex items-start gap-2">
            <button
              onClick={onDownload}
              aria-label="Download"
              className="inline-flex items-center gap-2 px-2 py-1.5 text-xs font-semibold rounded-md bg-[#f5f5f7] text-[#666] hover:bg-gray-200 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v12m0 0l-4-4m4 4l4-4"
                />
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 21H3" />
              </svg>
              <span>Download</span>
            </button>

            <button
              onClick={onDelete}
              aria-label="Delete"
              title="Delete"
              className=" py-1.5 px-2 flex items-center justify-center rounded-md bg-[#fee] text-[#c33] hover:bg-red-50 focus:outline-none"
            >
              <IoTrash className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#e5e5e7]">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{material.content}</p>
      </div>
    </article>
  );
}
