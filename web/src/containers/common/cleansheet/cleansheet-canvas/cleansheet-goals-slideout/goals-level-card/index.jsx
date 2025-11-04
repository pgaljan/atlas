import React from 'react';

export default function LevelCard({ item }) {
  const currentLevel = item.currentLevel || 1;
  const desiredLevel = item.desiredLevel || 1;
  const gap = desiredLevel - currentLevel;
  const gapColor = gap > 0 ? '#ff9800' : gap < 0 ? '#666666' : '#4caf50';

  const posFor = (level) => `${(level - 1) * 25}%`;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-3 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="m-0 text-sm font-semibold text-[#1a1a1a]">{item.name}</h4>
          <span
            className={`text-[9px] font-semibold rounded px-1.5 py-[2px]`}
            style={{
              background: item.fromExperience ? '#e3f2fd' : '#f5f5f7',
              color: item.fromExperience ? '#0066CC' : '#666666',
            }}
          >
            {item.fromExperience ? 'From Experience' : 'Custom'}
          </span>
        </div>
      </div>

      <div className="relative py-4">
        <div className="flex justify-between mb-2 px-2">
          {[1, 2, 3, 4, 5]?.map((n) => (
            <span key={n} className="text-[10px] text-[#999] font-semibold">
              {n}
            </span>
          ))}
        </div>

        <div className="relative h-2 rounded-md mx-2" style={{ background: '#e5e5e7' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: posFor(desiredLevel),
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              background: '#ff9800',
              border: '3px solid white',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: posFor(currentLevel),
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              background: '#0066CC',
              border: '3px solid white',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 2,
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-3 px-2">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#0066CC' }} />
              <span className="text-[10px] text-neutral-500">
                Current: <strong>{currentLevel}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff9800' }} />
              <span className="text-[10px] text-neutral-500">
                Target: <strong>{desiredLevel}</strong>
              </span>
            </div>
          </div>

          {gap !== 0 && (
            <div style={{ color: gapColor }} className="text-[10px] font-semibold">
              Gap: {gap > 0 ? `+${gap}` : gap}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
