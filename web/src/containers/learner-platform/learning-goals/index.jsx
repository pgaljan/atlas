import React, { useEffect, useState } from 'react';

const defaultSkills = [
  { id: 's-1', name: 'Python', type: 'tool' },
  { id: 's-2', name: 'TensorFlow', type: 'tool' },
  { id: 's-3', name: 'PyTorch', type: 'tool' },
  { id: 's-4', name: 'Jupyter Notebooks', type: 'tool' },
  { id: 's-5', name: 'Machine Learning Algorithms', type: 'skill' },
  { id: 's-6', name: 'Deep Learning', type: 'skill' },
];

export default function LearningGoals({ initialSkills = defaultSkills, onBack, onContinue }) {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const rows = (initialSkills || []).map((s) => ({
      ...s,
      current: 0,
      desired: 0,
    }));
    setSkills(rows);
  }, [initialSkills]);

  function updateLevel(id, field, value) {
    setSkills((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: Number(value) } : r)));
  }

  function totalGap() {
    return skills.reduce((acc, s) => acc + Math.max(0, s.desired - s.current), 0);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-custom-main/10 text-custom-main font-semibold w-8 h-8 flex items-center justify-center">
              4
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Set Your Learning Goals</div>
              <div className="text-sm text-gray-500">
                Choose your learning paths and set current & desired levels.
              </div>
            </div>
          </div>

          <div className="mt-2 sm:mt-0 flex items-center gap-3">
            <div className="rounded-full bg-green-100 text-green-800 text-sm px-3 py-1">
              AI/ML Engineer
            </div>
            <div className="text-sm text-gray-500">6 skills & tools</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-3 px-2 min-w-[180px]">Skill / Tool</th>
                <th className="py-3 px-2 w-28">Type</th>
                <th className="py-3 px-2 w-36">Current Level</th>
                <th className="py-3 px-2 w-36">Desired Level</th>
                <th className="py-3 px-2 w-20 text-right">Gap</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => {
                const gap = Math.max(0, (s.desired || 0) - (s.current || 0));
                return (
                  <tr key={s.id} className="border-t">
                    <td className="py-3 px-2 align-top">
                      <div className="font-medium text-gray-800 truncate">{s.name}</div>
                      <div className="text-xs text-gray-400">{/* optional subtitle */}</div>
                    </td>
                    <td className="py-3 px-2 align-top">
                      <div
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.type === 'tool'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {s.type}
                      </div>
                    </td>

                    <td className="py-3 px-2 align-top">
                      <select
                        aria-label={`Current level for ${s.name}`}
                        value={s.current}
                        onChange={(e) => updateLevel(s.id, 'current', e.target.value)}
                        className="w-full rounded border px-3 py-1 text-sm"
                      >
                        <option value={0}>0 — None</option>
                        <option value={1}>1 — Beginner</option>
                        <option value={2}>2 — Basic</option>
                        <option value={3}>3 — Intermediate</option>
                        <option value={4}>4 — Advanced</option>
                        <option value={5}>5 — Expert</option>
                      </select>
                    </td>

                    <td className="py-3 px-2 align-top">
                      <select
                        aria-label={`Desired level for ${s.name}`}
                        value={s.desired}
                        onChange={(e) => updateLevel(s.id, 'desired', e.target.value)}
                        className="w-full rounded border px-3 py-1 text-sm"
                      >
                        <option value={0}>0 — None</option>
                        <option value={1}>1 — Beginner</option>
                        <option value={2}>2 — Basic</option>
                        <option value={3}>3 — Intermediate</option>
                        <option value={4}>4 — Advanced</option>
                        <option value={5}>5 — Expert</option>
                      </select>
                    </td>

                    <td className="py-3 px-2 align-top text-right">
                      <div className="text-sm font-medium">{gap}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
          <div>
            Total gap across skills:{' '}
            <span className="font-semibold text-gray-800 ml-2">{totalGap()}</span>
          </div>
          <div className="text-xs text-gray-400">Changes are saved locally (demo)</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onBack && onBack()}
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onContinue) onContinue();
            }}
            className="px-4 py-2 bg-custom-main text-white rounded hover:bg-custom-secondary"
          >
            Continue to Goals →
          </button>
        </div>
      </div>
    </div>
  );
}








