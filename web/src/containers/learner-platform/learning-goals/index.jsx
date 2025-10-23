import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { fetchCleansheetProfile, upsertCleansheetProfile } from '../../../redux/slices/cleansheet';

const defaultSkills = [
  { id: 's-1', name: 'Python', type: 'tool' },
  { id: 's-2', name: 'TensorFlow', type: 'tool' },
  { id: 's-3', name: 'PyTorch', type: 'tool' },
  { id: 's-4', name: 'Jupyter Notebooks', type: 'tool' },
  { id: 's-5', name: 'Machine Learning Algorithms', type: 'skill' },
  { id: 's-6', name: 'Deep Learning', type: 'skill' },
];

export default function LearningGoals({
  initialSkills,
  onChangeSkills,
  pathName = 'AI/ML Engineer',
  showBadge = true,
}) {
  const dispatch = useDispatch();
  const userId = Cookies.get('atlas_user_id') || null;

  const [skills, setSkills] = useState([]);
  const [profileRaw, setProfileRaw] = useState(null); 
  const [message, setMessage] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadFromServer() {
      if (!userId) {
        const rows = (initialSkills ?? defaultSkills).map((s) => ({
          ...s,
          current: typeof s.current === 'number' ? s.current : 0,
          desired: typeof s.desired === 'number' ? s.desired : 0,
        }));
        if (mounted) {
          setSkills(rows);
          if (onChangeSkills) onChangeSkills(rows);
        }
        return;
      }

      try {
        const res = await dispatch(fetchCleansheetProfile(userId)).unwrap();
        const serverSkills =
          (res &&
            res.resumeJson &&
            Array.isArray(res.resumeJson.skills) &&
            res.resumeJson.skills) ||
          (Array.isArray(res.skills) && res.skills) ||
          initialSkills ||
          defaultSkills;

        const rows = (serverSkills || []).map((s, idx) => {
          if (typeof s === 'string') {
            return { id: `srv-${idx}`, name: s, type: 'skill', current: 0, desired: 0 };
          }
          return {
            id: s.id || s.name || `srv-${idx}`,
            name: s.name || String(s.id || s),
            type: s.type || 'skill',
            current: typeof s.current === 'number' ? s.current : 0,
            desired: typeof s.desired === 'number' ? s.desired : 0,
          };
        });

        if (mounted) {
          setProfileRaw(res || null);
          setSkills(rows);
          if (onChangeSkills) onChangeSkills(rows);
        }
      } catch (err) {
        const rows = (initialSkills ?? defaultSkills).map((s) => ({
          ...s,
          current: typeof s.current === 'number' ? s.current : 0,
          desired: typeof s.desired === 'number' ? s.desired : 0,
        }));
        if (mounted) {
          setSkills(rows);
          if (onChangeSkills) onChangeSkills(rows);
          setMessage('Failed to load goals from server — using local data.');
        }
      }
    }

    loadFromServer();

    return () => {
      mounted = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [userId, initialSkills, dispatch]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2800);
    return () => clearTimeout(t);
  }, [message]);

  const updateLevel = useCallback(
    (id, field, value) => {
      setSkills((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, [field]: Number(value) } : r));
        if (onChangeSkills) onChangeSkills(next);

        if (userId) {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => {
            saveSkillsToServer(next).catch(() => {
              setMessage('Failed to save goals to server.');
            });
            saveTimeoutRef.current = null;
          }, 900);
        }

        return next;
      });
    },
    [userId, profileRaw, onChangeSkills, dispatch],
  );

  async function saveSkillsToServer(skillsToSave) {
    const dtoBase = profileRaw
      ? { ...profileRaw }
      : {
          userName: profileRaw?.userName || Cookies.get('displayName') || '',
          userGoals: profileRaw?.userGoals || '',
          experiences: Array.isArray(profileRaw?.experiences) ? profileRaw.experiences : [],
        };

    const resumeJson = {
      ...(dtoBase.resumeJson || {}),
      skills: (skillsToSave || []).map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        current: Number(s.current || 0),
        desired: Number(s.desired || 0),
      })),
    };

    const dto = {
      ...dtoBase,
      resumeJson,
    };

    try {
      await dispatch(upsertCleansheetProfile({ dto, userId: userId || undefined })).unwrap();
      setMessage('Goals saved to server.');
      setProfileRaw((p) => ({ ...(p || {}), ...dto }));
    } catch (err) {
      console.error('Failed to upsert cleansheet profile', err);
      throw err;
    }
  }

  function totalGap() {
    return skills.reduce((acc, s) => acc + Math.max(0, (s.desired || 0) - (s.current || 0)), 0);
  }

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <div className="bg-custom-main text-white px-4 py-3 rounded-t-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">
            4
          </div>
          <div className="font-semibold">Set Your Learning Goals</div>
        </div>
      </div>

      <div className="p-6 bg-white space-y-4">
        <div className="text-sm text-gray-600">
          Choose your learning paths and set your current and desired skill levels for each tool and
          competency.
        </div>

        {showBadge && (
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-green-100 text-green-800 text-sm px-3 py-1 font-medium">
              {pathName}
            </div>
            <div className="text-sm text-gray-500">{skills.length} skills & tools</div>
          </div>
        )}

        <div className="bg-white p-0 rounded-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-3 px-3 min-w-[200px]">Skill / Tool</th>
                  <th className="py-3 px-3 w-36">Type</th>
                  <th className="py-3 px-3 w-40">Current Level</th>
                  <th className="py-3 px-3 w-40">Desired Level</th>
                  <th className="py-3 px-3 w-24 text-right">Gap</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => {
                  const gap = Math.max(0, (s.desired || 0) - (s.current || 0));
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="py-3 px-3 align-top">
                        <div className="font-medium text-gray-800 truncate">{s.name}</div>
                      </td>

                      <td className="py-3 px-3 align-top">
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

                      <td className="py-3 px-3 align-top">
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

                      <td className="py-3 px-3 align-top">
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

                      <td className="py-3 px-3 align-top text-right">
                        <div className="text-sm font-medium">{gap}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 px-4 py-3 text-sm text-gray-600 flex items-center justify-between border-t border-gray-100">
            <div>
              Total gap across skills:{' '}
              <span className="font-semibold text-gray-800 ml-2">{totalGap()}</span>
            </div>
            <div className="text-xs text-gray-400">
              {userId
                ? 'Changes are saved to your account'
                : 'Not logged in — changes saved locally'}
            </div>
          </div>
        </div>

        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  );
}

LearningGoals.propTypes = {
  initialSkills: PropTypes.array,
  onChangeSkills: PropTypes.func,
  pathName: PropTypes.string,
  showBadge: PropTypes.bool,
};
