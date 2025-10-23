import React from 'react';

export default function RightSlideout({ open, title, onClose, children }) {
  return (
    <aside
      aria-hidden={!open}
      className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]`}
      style={{
        width: open ? '60%' : '0%',
        maxWidth: '1200px',
        boxShadow: open ? '-6px 0 26px rgba(0,0,0,0.12)' : 'none',
        pointerEvents: open ? 'auto' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        opacity: open ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold font-['Questrial',system-ui]">
            {title || 'Details'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white text-2xl leading-none p-1 hover:opacity-80"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</div>
      </div>
    </aside>
  );
}
