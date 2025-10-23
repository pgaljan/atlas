import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { normalizeTechs } from '../../../../../utils/cleansheet-utils';

const yearsBetween = (startIso, endIso) => {
  if (!startIso) return 0;
  const s = new Date(startIso);
  const e = endIso ? new Date(endIso) : new Date();
  const diff = Math.max(0, e - s);
  return diff / (1000 * 60 * 60 * 24 * 365);
};

const Badge = ({ type }) => {
  if (type === 'Core') {
    return (
      <span className="inline-flex flex-shrink-0 items-center text-[11px] font-medium px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-800">
        Core
      </span>
    );
  }
  return (
    <span className="inline-flex flex-shrink-0 items-center text-[11px] font-medium px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
      Peripheral
    </span>
  );
};

const CareerSummary = () => {
  const profile = useSelector((s) => s.cleansheet.profile);
  const experiences = profile?.experiences || [];
  const [collapsed, setCollapsed] = useState(false);

  const summary = useMemo(() => {
    const normalized = (experiences || []).map((exp = {}) => {
      return {
        ...exp,
        technologies: normalizeTechs(exp) || [],
      };
    });

    let total = 0;
    const techMap = {};
    const skillMap = {};
    const competencyMap = {};
    const projectMap = {};

    normalized.forEach((exp) => {
      const yrs = yearsBetween(exp.startDate, exp.endDate);
      total += yrs;

      (exp.technologies || []).forEach((t) => {
        if (!t) return;
        const rawName = (t.name || '').toString().trim();
        if (!rawName) return;
        const key = rawName.toLowerCase();
        const type = (t.type || 'Peripheral').toString();

        if (!techMap[key]) {
          techMap[key] = { name: rawName, yrs: 0, coreYrs: 0, periphYrs: 0 };
        }
        techMap[key].yrs += yrs;
        if (/core/i.test(type)) techMap[key].coreYrs += yrs;
        else techMap[key].periphYrs += yrs;
      });

      (exp.keySkills || []).forEach((sk) => {
        if (!sk) return;
        const n = sk.toString().trim();
        if (!n) return;
        skillMap[n] = (skillMap[n] || 0) + yrs;
      });

      (exp.competencies || []).forEach((c) => {
        if (!c) return;
        const n = c.toString().trim();
        if (!n) return;
        competencyMap[n] = (competencyMap[n] || 0) + yrs;
      });

      (exp.projectTypes || []).forEach((p) => {
        if (!p) return;
        const n = p.toString().trim();
        if (!n) return;
        projectMap[n] = (projectMap[n] || 0) + yrs;
      });
    });

    const techSorted = Object.values(techMap)
      .map((v) => {
        const type = v.coreYrs >= v.periphYrs ? 'Core' : 'Peripheral';
        return { name: v.name, yrs: v.yrs, type };
      })
      .sort((a, b) => b.yrs - a.yrs);

    const skillsSorted = Object.entries(skillMap)
      .map(([name, yrs]) => ({ name, yrs }))
      .sort((a, b) => b.yrs - a.yrs);

    const competenciesSorted = Object.entries(competencyMap)
      .map(([name, yrs]) => ({ name, yrs }))
      .sort((a, b) => b.yrs - a.yrs);

    const projectsSorted = Object.entries(projectMap)
      .map(([name, yrs]) => ({ name, yrs }))
      .sort((a, b) => b.yrs - a.yrs);

    return {
      totalYears: Math.round(total * 10) / 10,
      techSorted,
      skillsSorted,
      competenciesSorted,
      projectsSorted,
    };
  }, [experiences]);

  const formattedTotal = Number(summary.totalYears || 0).toFixed(1);

  return (
    <aside className="reporting-panel bg-white p-5 rounded-2xl shadow-lg sticky top-6 self-start z-30">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-semibold leading-tight">Career Summary</h3>
          <div className="text-sm text-gray-500 mt-1">Experience breakdown by category</div>
        </div>

        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-expanded={!collapsed}
          className="ml-4 p-1.5 rounded hover:bg-gray-50 transition"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${collapsed ? '' : 'rotate-180'}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M12 16L6 10h12l-6 6z" fill="#1f6feb" />
          </svg>
        </button>
      </div>

      <style>{`
        .cs-scroll {
          max-height: calc(100vh - 140px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-right: 6px;
          scrollbar-gutter: stable both-edges;
        }
        .cs-scroll::-webkit-scrollbar { width: 8px; }
        .cs-scroll::-webkit-scrollbar-track { background: transparent; }
        .cs-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(31,111,235,0.18);
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .cs-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(31,111,235,0.26); }
        @supports (scrollbar-width: thin) {
          .cs-scroll { scrollbar-width: thin; scrollbar-color: rgba(31,111,235,0.18) transparent; }
        }
      `}</style>

      <div className={`${collapsed ? 'hidden' : ''} cs-scroll`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl mb-5 text-center shadow-inner">
          <div className="text-sm font-medium opacity-95 tracking-wide">Total Experience</div>
          <div className="text-[52px] font-extrabold leading-none mt-2">{formattedTotal}</div>
          <div className="text-sm opacity-90 mt-1">years</div>
        </div>

        <div>
          <section className="pb-4 pt-2">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-widest text-gray-600 font-medium">
                TECHNOLOGIES
              </div>
              <div className="mt-3 border-b border-gray-200" />
            </div>

            <div className="space-y-3 mt-4 pr-6">
              {summary.techSorted.slice(0, 8).map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 inline-block flex-shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-600 truncate max-w-[14rem]">{t.name}</span>
                      <span className="ml-1 flex-shrink-0">
                        <Badge type={t.type} />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline ml-4 whitespace-nowrap">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(Math.round(t.yrs * 10) / 10).toFixed(1)}
                    </span>
                    <span className="text-custom-neutralMuteText text-sm ml-1">yr</span>
                  </div>
                </div>
              ))}

              {!summary.techSorted.length && (
                <div className="text-sm text-gray-400">No technologies yet</div>
              )}
            </div>
          </section>

          <section className="pt-6 pb-4">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-widest text-gray-600 font-medium">
                KEY SKILLS
              </div>
              <div className="mt-3 border-b border-gray-200" />
            </div>

            <div className="space-y-3 mt-4 pr-6">
              {summary.skillsSorted.slice(0, 8).map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 min-w-0 truncate">{s.name}</div>
                  <div className="flex items-baseline ml-4 whitespace-nowrap">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(Math.round(s.yrs * 10) / 10).toFixed(1)}
                    </span>
                    <span className="text-custom-neutralMuteText text-sm ml-1">yr</span>
                  </div>
                </div>
              ))}

              {!summary.skillsSorted.length && (
                <div className="text-sm text-gray-400">No skills yet</div>
              )}
            </div>
          </section>

          <section className="pt-6 pb-4">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-widest text-gray-600 font-medium">
                COMPETENCIES
              </div>
              <div className="mt-3 border-b border-gray-200" />
            </div>

            <div className="space-y-3 mt-4 pr-6">
              {summary.competenciesSorted.slice(0, 10).map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 min-w-0 truncate">{c.name}</div>
                  <div className="flex items-baseline ml-4 whitespace-nowrap">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(Math.round(c.yrs * 10) / 10).toFixed(1)}
                    </span>
                    <span className="text-custom-neutralMuteText text-sm ml-1">yr</span>
                  </div>
                </div>
              ))}

              {!summary.competenciesSorted.length && (
                <div className="text-sm text-gray-400">No competencies yet</div>
              )}
            </div>
          </section>

          <section className="pt-6 pb-4">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-widest text-gray-600 font-medium">
                PROJECT TYPES
              </div>
              <div className="mt-3 border-b border-gray-200" />
            </div>

            <div className="space-y-3 mt-4 pr-6">
              {summary.projectsSorted.slice(0, 8).map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 min-w-0 truncate">{p.name}</div>
                  <div className="flex items-baseline ml-4 whitespace-nowrap">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(Math.round(p.yrs * 10) / 10).toFixed(1)}
                    </span>
                    <span className="text-custom-neutralMuteText text-sm ml-1">yr</span>
                  </div>
                </div>
              ))}

              {!summary.projectsSorted.length && (
                <div className="text-sm text-gray-400">No project types yet</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
};

export default CareerSummary;
