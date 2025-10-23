import React from 'react';

export default function CleanSheetCanvas({ children }) {
  return (
    <div className="flex-1 bg-white rounded-lg border border-gray-100 min-h-[72vh] shadow-sm p-6">
      {children || <CanvasPlaceholder />}
    </div>
  );
}

function CanvasPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center text-black">
      <div className="text-center">
        <div className="text-emerald-500 font-semibold text-xl mb-3">My Canvas</div>
        <div className="text-slate-400">(Canvas visualization renders here)</div>
      </div>
    </div>
  );
}
