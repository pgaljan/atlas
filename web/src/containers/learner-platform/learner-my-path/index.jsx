import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaLinkedin } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Cookies from 'js-cookie';

import DeleteModal from '../../../components/modals/DeleteModal';
import ModalComponent from '../../../components/modals/Modal';
import LearnerExperienceReview from '../learner-review-experience';

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCleansheetProfile,
  upsertCleansheetProfile,
  exportCleansheetProfile,
  importCleansheetProfile,
} from '../../../redux/slices/cleansheet';
import cogoToast from '@successtar/cogo-toast';
import { useNavigate } from 'react-router-dom';

function _ensureArray(maybe) {
  if (!maybe) return [];
  if (Array.isArray(maybe)) return maybe;
  try {
    return JSON.parse(maybe);
  } catch {
    return [];
  }
}

function mapExportJsonToLocal(json = {}) {
  const profile = {
    name: String(json.userName || json.name || '') || '',
    email: String(json.userEmail || json.email || '') || '',
    goals: String(json.userGoals || json.goals || '') || '',
  };

  const experiences = Array.isArray(json.experiences)
    ? json.experiences
    : _ensureArray(json.experience);
  const positions = (experiences || []).map((e, idx) => {
    const techs =
      Array.isArray(e.technologies) && e.technologies.length
        ? e.technologies
        : Array.isArray(e.tools)
          ? e.tools.map((t) => ({ name: String(t), type: 'Peripheral' }))
          : [];

    return {
      id: String(Date.now() + idx),
      company: e.organizationName || e.company || '',
      title: e.role || e.title || '',
      location: e.location || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      currentlyWorking: !(e.endDate && String(e.endDate).trim().length > 0),
      description: e.description || e.summary || '',
      accomplishments: Array.isArray(e.achievements) ? e.achievements : [],
      tasks: Array.isArray(e.keySkills) ? e.keySkills : [],
      tools: Array.isArray(e.tools) ? e.tools : techs.map((t) => t.name),
      technologies: techs,
      internalStakeholders: Array.isArray(e.internalStakeholders) ? e.internalStakeholders : [],
      externalStakeholders: Array.isArray(e.externalStakeholders) ? e.externalStakeholders : [],
      competencies: Array.isArray(e.competencies) ? e.competencies : [],
      projectTypes: Array.isArray(e.projectTypes) ? e.projectTypes : [],
    };
  });

  const possibleEduKeys = ['education', 'educations', 'schools', 'degrees'];
  let eduArr = null;
  for (const k of possibleEduKeys) {
    if (Array.isArray(json[k])) {
      eduArr = json[k];
      break;
    }
  }
  if (!eduArr && json.resumeJson && Array.isArray(json.resumeJson.education)) {
    eduArr = json.resumeJson.education;
  }
  eduArr = Array.isArray(eduArr) ? eduArr : [];

  const education = eduArr.map((ed, idx) => ({
    id: String(Date.now() + idx),
    institution: ed.institution || ed.school || ed.organization || '',
    degree: ed.degree || ed.qualification || '',
    field: ed.field || ed.major || ed.area || '',
    startDate: ed.startDate || '',
    endDate: ed.endDate || '',
    description: ed.description || ed.summary || '',
  }));

  return { profile, positions, education };
}

const STORAGE_KEY = 'learner_my_path_v1';
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

function toYYYYMM(d) {
  if (!d) return '';
  if (typeof d === 'string') return DATE_REGEX.test(d) ? d : '';
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${yyyy}-${mm}`;
}
function parseYYYYMMToDate(s) {
  if (!s || typeof s !== 'string') return null;
  if (!DATE_REGEX.test(s)) return null;
  const [y, m] = s.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

/* TagInput unchanged */
function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText('');
  }, [value]);

  function addTagFrom(textVal) {
    const trimmed = (textVal ?? '').trim();
    if (!trimmed) return;
    const split = trimmed
      .split(/[,;|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const next = Array.from(new Set([...(value || []), ...split]));
    onChange && onChange(next);
    setText('');
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagFrom(text);
    } else if (e.key === 'Backspace' && text === '') {
      const last = (value || []).slice(-1)[0];
      if (last) {
        onChange && onChange((value || []).slice(0, -1));
      }
    }
  }

  function removeTag(t) {
    onChange && onChange((value || []).filter((x) => x !== t));
  }

  return (
    <div>
      {(value || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value?.map((t, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-custom-main bg-white text-custom-main px-2 py-0.5 text-xs group"
            >
              <span className="font-medium max-w-[12rem] truncate">{t}</span>

              <button
                type="button"
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
                title="Remove"
                className="ml-1 w-5 h-5 flex items-center justify-center rounded-full border border-custom-main bg-transparent text-custom-main opacity-0 group-hover:opacity-100 transition-all duration-150 ease-in-out group-hover:bg-custom-main group-hover:text-white focus:outline-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="block w-full rounded border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-main focus:border-custom-main"
        aria-label="Add tag"
      />
    </div>
  );
}

export default function LearnerMyPath() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cookieUserId = Cookies.get('atlas_userId') || Cookies.get('atlas_user_id') || null;
  const cookieDisplayName =
    Cookies.get('displayName') ||
    Cookies.get('atlas_displayName') ||
    Cookies.get('atlas_username') ||
    '';
  const cookieEmail = Cookies.get('atlas_email') || '';

  const authUser = useSelector((s) => (s.auth && s.auth.user) || null);

  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(1);

  const [profile, setProfile] = useState(undefined);
  const [positions, setPositions] = useState([]);
  const [education, setEducation] = useState([]);
  const [skillsState, setSkillsState] = useState([]);
  const [flags, setFlags] = useState({ skills: false, goals: false, welcomeCall: false });

  const [isPositionModalOpen, setPositionModalOpen] = useState(false);
  const [isEducationModalOpen, setEducationModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const [editingPosition, setEditingPosition] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);

  const [positionForm, setPositionForm] = useState({
    id: '',
    company: '',
    title: '',
    startDate: null,
    endDate: null,
    currentlyWorking: false,
    description: '',
    location: '',
    accomplishments: [],
    tasks: [],
    tools: [],
    technologies: [],
    internalStakeholders: [],
    externalStakeholders: [],
    competencies: [],
    priorities: [],
    projectTypes: [],
    _newTechName: '',
    _newTechType: 'Peripheral',
  });
  const [positionFormErrors, setPositionFormErrors] = useState({});

  const [educationForm, setEducationForm] = useState({
    id: '',
    institution: '',
    degree: '',
    field: '',
    startDate: null,
    endDate: null,
    description: '',
  });
  const [educationFormErrors, setEducationFormErrors] = useState({});

  const [message, setMessage] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    loading: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPositions(Array.isArray(parsed.positions) ? parsed.positions : []);
        setEducation(Array.isArray(parsed.education) ? parsed.education : []);
        setFlags(parsed.flags ?? { skills: false, goals: false, welcomeCall: false });
        setSkillsState(parsed.skillsState ?? []);
      } else {
        setPositions([]);
        setEducation([]);
        setFlags({ skills: false, goals: false, welcomeCall: false });
        setSkillsState([]);
      }
    } catch (e) {
      console.warn('Failed to parse persisted learner state', e);
      setPositions([]);
      setEducation([]);
      setFlags({ skills: false, goals: false, welcomeCall: false });
      setSkillsState([]);
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const userId = cookieUserId || (authUser && authUser.id);
      if (!userId) {
        setProfile({ name: cookieDisplayName, email: cookieEmail || '', goals: '' });
        setProfileModalOpen(true);
        return;
      }

      try {
        const result = await dispatch(fetchCleansheetProfile(userId)).unwrap();
        if (result) {
          const mapped = {
            name: result.userName || cookieDisplayName || (authUser && authUser.displayName),
            email: cookieEmail || (authUser && authUser.email) || '',
            goals: result.userGoals || '',
          };
          setProfile((prev) => ({ ...(prev || {}), ...mapped }));

          if (Array.isArray(result.experiences) && result.experiences.length > 0) {
            const pos = result.experiences.map((e, i) => ({
              id: String(Date.now() + i),
              company: e.organizationName || '',
              title: e.role || '',
              location: e.location || '',
              startDate: e.startDate || '',
              endDate: e.endDate || '',
              currentlyWorking: !e.endDate,
              description: e.description || '',
              accomplishments: Array.isArray(e.achievements) ? e.achievements : [],
              tasks: Array.isArray(e.keySkills) ? e.keySkills : [],
              tools: Array.isArray(e.technologies) ? e.technologies.map((t) => t.name) : [],
              technologies: Array.isArray(e.technologies) ? e.technologies : [],
              internalStakeholders: Array.isArray(e.internalStakeholders)
                ? e.internalStakeholders
                : [],
              externalStakeholders: Array.isArray(e.externalStakeholders)
                ? e.externalStakeholders
                : [],
              competencies: Array.isArray(e.competencies) ? e.competencies : [],
              projectTypes: Array.isArray(e.projectTypes) ? e.projectTypes : [],
            }));
            setPositions(pos);
          } else {
            setPositions([]);
          }

          if (Array.isArray(result.education) && result.education.length > 0) {
            const edu = result.education.map((ed, i) => ({
              id: String(Date.now() + i),
              institution: ed.institution || '',
              degree: ed.degree || '',
              field: ed.field || '',
              startDate: ed.startDate || '',
              endDate: ed.endDate || '',
              description: ed.description || '',
            }));
            setEducation(edu);
          } else {
            setEducation([]);
          }
        }
      } catch (err) {
        console.warn('fetchCleansheetProfile failed:', err);
        setProfile({ name: cookieDisplayName || '', email: cookieEmail || '', goals: '' });
        setPositions([]);
        setEducation([]);
      }
    }

    loadProfile();
  }, [cookieUserId, cookieDisplayName, cookieEmail, authUser, dispatch]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(t);
  }, [message]);

  const progress = useMemo(() => Math.round((currentStep / totalSteps) * 100), [currentStep]);

  const openAddPosition = useCallback(() => {
    setEditingPosition(null);
    setPositionForm({
      id: '',
      company: '',
      title: '',
      startDate: null,
      endDate: null,
      currentlyWorking: false,
      description: '',
      location: '',
      accomplishments: [],
      tasks: [],
      tools: [],
      technologies: [],
      internalStakeholders: [],
      externalStakeholders: [],
      competencies: [],
      priorities: [],
      projectTypes: [],
      _newTechName: '',
      _newTechType: 'Peripheral',
    });
    setPositionFormErrors({});
    setPositionModalOpen(true);
  }, []);

  const toolsToTechnologies = (toolsArr = [], existingTechs = []) => {
    const normalizedTools = (toolsArr || []).map((name) => {
      const found = (existingTechs || []).find(
        (t) => t.name.toLowerCase() === String(name).toLowerCase(),
      );
      return found ? found : { name: String(name), type: 'Peripheral' };
    });
    const remaining = (existingTechs || []).filter(
      (t) => !normalizedTools.some((nt) => nt.name.toLowerCase() === t.name.toLowerCase()),
    );
    return [...normalizedTools, ...remaining];
  };

  const openEditPosition = useCallback((p) => {
    const techs =
      Array.isArray(p.technologies) && p.technologies.length
        ? p.technologies.map((t) => ({ name: t.name, type: t.type || 'Peripheral' }))
        : p.tools
          ? toolsToTechnologies(p.tools, [])
          : [];
    setEditingPosition(p);
    setPositionForm({
      id: p.id,
      company: p.company || '',
      title: p.title || '',
      startDate: parseYYYYMMToDate(p.startDate) || null,
      endDate: parseYYYYMMToDate(p.endDate) || null,
      currentlyWorking: !!p.currentlyWorking,
      description: p.description || '',
      location: p.location || '',
      accomplishments: Array.isArray(p.accomplishments) ? p.accomplishments : [],
      tasks: Array.isArray(p.tasks) ? p.tasks : [],
      tools: Array.isArray(p.tools) ? p.tools : techs.map((t) => t.name),
      technologies: techs,
      internalStakeholders: Array.isArray(p.internalStakeholders) ? p.internalStakeholders : [],
      externalStakeholders: Array.isArray(p.externalStakeholders) ? p.externalStakeholders : [],
      competencies: Array.isArray(p.competencies) ? p.competencies : [],
      priorities: Array.isArray(p.priorities) ? p.priorities : [],
      projectTypes: Array.isArray(p.projectTypes) ? p.projectTypes : [],
      _newTechName: '',
      _newTechType: 'Peripheral',
    });
    setPositionFormErrors({});
    setPositionModalOpen(true);
  }, []);

  function validatePositionForm(payload) {
    const errs = {};
    if (!payload.company || payload.company.trim() === '') errs.company = 'Company is required.';
    if (!payload.title || payload.title.trim() === '') errs.title = 'Role is required.';
    if (
      !payload.startDate ||
      !(payload.startDate instanceof Date) ||
      Number.isNaN(payload.startDate.getTime())
    )
      errs.startDate = 'Start date required (YYYY-MM).';
    if (!payload.currentlyWorking) {
      if (
        !payload.endDate ||
        !(payload.endDate instanceof Date) ||
        Number.isNaN(payload.endDate.getTime())
      )
        errs.endDate = 'End date required (YYYY-MM) or mark as currently working.';
      else {
        if (payload.startDate && payload.endDate && payload.endDate < payload.startDate)
          errs.endDate = 'End date must be the same or after start date.';
      }
    }
    setPositionFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function savePosition(payload) {
    const normalized = {
      ...payload,
      accomplishments: Array.isArray(payload.accomplishments) ? payload.accomplishments : [],
      tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
      technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
      internalStakeholders: Array.isArray(payload.internalStakeholders)
        ? payload.internalStakeholders
        : [],
      externalStakeholders: Array.isArray(payload.externalStakeholders)
        ? payload.externalStakeholders
        : [],
      competencies: Array.isArray(payload.competencies) ? payload.competencies : [],
      priorities: Array.isArray(payload.priorities) ? payload.priorities : [],
      projectTypes: Array.isArray(payload.projectTypes) ? payload.projectTypes : [],
      tools: Array.isArray(payload.tools) ? payload.tools : [],
    };

    if (!validatePositionForm(normalized)) {
      cogoToast.warn('Please fix required fields in the experience form.');
      return;
    }

    const stored = {
      ...normalized,
      startDate: toYYYYMM(normalized.startDate),
      endDate: normalized.currentlyWorking ? '' : toYYYYMM(normalized.endDate),
    };

    if (stored.id) {
      setPositions((prev) => prev.map((x) => (x.id === stored.id ? { ...x, ...stored } : x)));
    } else {
      const newPos = { ...stored, id: String(Date.now()) };
      setPositions((prev) => [newPos, ...prev]);
    }
    setPositionModalOpen(false);
  }

  function confirmRemovePosition(position) {
    setDeleteTarget({
      isOpen: true,
      type: 'position',
      id: position.id,
      title: `${position.title} @ ${position.company}`,
      loading: false,
    });
  }

  const openAddEducation = useCallback(() => {
    setEditingEducation(null);
    setEducationForm({
      id: '',
      institution: '',
      degree: '',
      field: '',
      startDate: null,
      endDate: null,
      description: '',
    });
    setEducationFormErrors({});
    setEducationModalOpen(true);
  }, []);

  const openEditEducation = useCallback((e) => {
    setEditingEducation(e);
    setEducationForm({
      id: e.id,
      institution: e.institution || '',
      degree: e.degree || '',
      field: e.field || '',
      startDate: parseYYYYMMToDate(e.startDate) || null,
      endDate: parseYYYYMMToDate(e.endDate) || null,
      description: e.description || '',
    });
    setEducationFormErrors({});
    setEducationModalOpen(true);
  }, []);

  async function handleDownloadSampleJson() {
    try {
      const resp = await fetch('/cleansheet_sample_profile.json');
      if (!resp.ok) throw new Error(`Failed to fetch sample: ${resp.status} ${resp.statusText}`);
      const blob = await resp.blob();
      const filename = 'cleansheet_sample_profile.json';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      cogoToast.error('Failed to download sample JSON');
    }
  }

  function validateEducationForm(payload) {
    const errs = {};
    if (!payload.institution || payload.institution.trim() === '')
      errs.institution = 'Institution is required.';
    if (
      payload.startDate &&
      (!(payload.startDate instanceof Date) || Number.isNaN(payload.startDate.getTime()))
    )
      errs.startDate = 'Start date must be YYYY-MM.';
    if (
      payload.endDate &&
      (!(payload.endDate instanceof Date) || Number.isNaN(payload.endDate.getTime()))
    )
      errs.endDate = 'End date must be YYYY-MM.';
    if (payload.startDate && payload.endDate && payload.endDate < payload.startDate)
      errs.endDate = 'End date must be the same or after start date.';
    setEducationFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function saveEducation(payload) {
    if (!validateEducationForm(payload)) {
      cogoToast.warn('Please fill required fields in the education form.');
      return;
    }
    const stored = {
      ...payload,
      startDate: toYYYYMM(payload.startDate),
      endDate: toYYYYMM(payload.endDate),
    };
    if (stored.id) {
      setEducation((prev) => prev.map((x) => (x.id === stored.id ? { ...x, ...stored } : x)));
      cogoToast.success('Education updated');
    } else {
      const newEdu = { ...stored, id: String(Date.now()) };
      setEducation((prev) => [newEdu, ...prev]);
      cogoToast.success('Education has been added!');
    }
    setEducationModalOpen(false);
  }

  function confirmRemoveEducation(edu) {
    setDeleteTarget({
      isOpen: true,
      type: 'education',
      id: edu.id,
      title: edu.institution,
      loading: false,
    });
  }

  const SCHEMA_VERSION = '1.0.2';
  function mapToolsToTechnologies(tools = []) {
    return (tools || []).map((t) => ({ name: String(t), type: 'Peripheral' }));
  }
  function mapPositionToSchema(pos) {
    const techs =
      Array.isArray(pos.technologies) && pos.technologies.length
        ? pos.technologies
        : mapToolsToTechnologies(pos.tools || []);
    return {
      organizationName: pos.company || '',
      role: pos.title || '',
      location: pos.location || '',
      startDate: pos.startDate || '',
      endDate: pos.currentlyWorking ? '' : pos.endDate || '',
      technologies: techs,
      internalStakeholders: Array.isArray(pos.internalStakeholders) ? pos.internalStakeholders : [],
      externalStakeholders: Array.isArray(pos.externalStakeholders) ? pos.externalStakeholders : [],
      keySkills: Array.isArray(pos.tasks) ? pos.tasks : [],
      competencies: Array.isArray(pos.competencies) ? pos.competencies : [],
      projectTypes: Array.isArray(pos.projectTypes) ? pos.projectTypes : [],
      achievements: Array.isArray(pos.accomplishments) ? pos.accomplishments : [],
      description: pos.description || '',
    };
  }
  function buildSchemaObjectForDb() {
    return {
      userName:
        cookieDisplayName || (authUser && (authUser.displayName || authUser.username)) || '',
      userGoals: profile?.goals || '',
      experiences: (positions || []).map((p) => mapPositionToSchema(p)),
      skills: skillsState || [],
      exportDate: new Date().toISOString(),
      version: SCHEMA_VERSION,
    };
  }

  async function saveProfileToServerBlocking({
    profileOverride,
    positionsOverride,
    educationOverride,
    skillsOverride,
  } = {}) {
    const effectiveProfile = profileOverride ?? profile ?? {};
    const effectivePositions = positionsOverride ?? positions ?? [];
    const effectiveEducation = educationOverride ?? education ?? [];
    const effectiveSkills = skillsOverride ?? skillsState ?? [];

    const dto = {
      userName:
        cookieDisplayName || (authUser && (authUser.displayName || authUser.username)) || '',
      userGoals: effectiveProfile.goals || '',
      experiences: (effectivePositions || []).map((p) => mapPositionToSchema(p)),
      education: (effectiveEducation || []).map((e) => ({
        institution: e.institution || '',
        degree: e.degree || '',
        field: e.field || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        description: e.description || '',
      })),
      skills: effectiveSkills || [],
      exportDate: new Date().toISOString(),
      version: SCHEMA_VERSION,
    };

    const userId = cookieUserId || (authUser && authUser.id);
    try {
      const res = await dispatch(upsertCleansheetProfile({ dto, userId })).unwrap();
      setProfile((p) => ({
        ...(p || {}),
        name: res?.userName || effectiveProfile.name || cookieDisplayName,
        email: cookieEmail || effectiveProfile.email || p?.email,
        goals: res?.userGoals ?? effectiveProfile.goals ?? p?.goals,
      }));
      return true;
    } catch (err) {
      console.warn('upsert thunk error:', err);
      return false;
    }
  }

  async function handleResumeFile(file) {
    if (!file) return;
    try {
      if (file.type === 'text/plain' || (file.name && file.name.toLowerCase().endsWith('.txt'))) {
        const txt = await file.text();
        const lines = txt
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const generated = {
          company: lines[0] ?? 'Parsed Company',
          title: lines[1] ?? 'Parsed Experience',
          startDate: '2020-01',
          endDate: '',
          currentlyWorking: true,
          description: lines.slice(2).join(' '),
          location: '',
          accomplishments: lines.slice(2, 5),
          tasks: lines.slice(5, 8),
          tools: ['ParsedTool1'],
          technologies: [{ name: 'ParsedTool1', type: 'Peripheral' }],
        };
        setPositionForm((s) => ({
          ...s,
          ...generated,
          startDate: parseYYYYMMToDate(generated.startDate),
          endDate: parseYYYYMMToDate(generated.endDate),
          id: '',
        }));
        setPositionFormErrors({});
        setEditingPosition(null);
        setPositionModalOpen(true);
        cogoToast.success('Resume parsed (demo). Please review and Save.');
        return;
      }

      // JSON import
      if (
        file.type === 'application/json' ||
        (file.name && file.name.toLowerCase().endsWith('.json'))
      ) {
        const raw = await file.text();
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          cogoToast.error('Uploaded file is not valid JSON');
          return;
        }

        const candidate =
          parsed && parsed.userName ? parsed : parsed?.resumeJson ? parsed.resumeJson : parsed;

        if (!candidate || (!candidate.experiences && !candidate.education)) {
          cogoToast.error('Imported JSON does not contain experiences or education to import.');
          return;
        }

        const userId = cookieUserId || (authUser && authUser.id);

        if (
          userId &&
          typeof dispatch === 'function' &&
          typeof importCleansheetProfile === 'function'
        ) {
          try {
            const serverResp = await dispatch(
              importCleansheetProfile({ json: candidate, userId }),
            ).unwrap();
            const source =
              serverResp && (serverResp.resumeJson || serverResp)
                ? serverResp.resumeJson || serverResp
                : candidate;
            const {
              profile: mappedProfile,
              positions: pos,
              education: edu,
            } = mapExportJsonToLocal(source);
            setProfile((p) => ({ ...(p || {}), ...(mappedProfile || {}) }));
            if (Array.isArray(pos) && pos.length) setPositions(pos);
            if (Array.isArray(edu) && edu.length) setEducation(edu);
            cogoToast.success('Profile imported and saved to server');
            return;
          } catch (err) {
            console.warn('Server import failed, falling back to local import', err);
          }
        }

        const {
          profile: mappedProfile,
          positions: pos,
          education: edu,
        } = mapExportJsonToLocal(candidate);
        setProfile((p) => ({ ...(p || {}), ...(mappedProfile || {}) }));
        if (Array.isArray(pos) && pos.length) setPositions(pos);
        if (Array.isArray(edu) && edu.length) setEducation(edu);
        cogoToast.success('Profile imported locally. Click Save to persist to server.');
        return;
      }
    } catch (err) {
      cogoToast.error('Failed to import file.');
    }
  }

  function downloadBlob(blobOrData, filename = 'cleansheet_profile.json') {
    const blob =
      blobOrData instanceof Blob
        ? blobOrData
        : new Blob([blobOrData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  function downloadJSON(filename = 'learner_profile.json') {
    const payload = buildSchemaObjectForDb();
    const text = JSON.stringify(payload, null, 2);
    downloadBlob(text, filename);
  }

  async function handleExportClick() {
    const userId = cookieUserId || (authUser && authUser.id);
    if (!userId) {
      downloadJSON();
      setMessage('Export downloaded');
      return;
    }

    try {
      const payload = await dispatch(exportCleansheetProfile({ userId, download: true })).unwrap();

      let filename = (payload && payload.filename) || `cleansheet_profile_${userId}.json`;

      if (payload && payload.data) {
        const text = JSON.stringify(payload.data, null, 2);
        downloadBlob(text, filename);
      } else if (payload && payload.dataText) {
        downloadBlob(payload.dataText, filename);
      } else if (payload && typeof payload === 'object') {
        downloadBlob(JSON.stringify(payload, null, 2), filename);
      } else {
        downloadJSON(filename);
      }
    } catch (err) {
      cogoToast.error('Export failed. Check console/network for details.');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget.type || !deleteTarget.id) return;
    setDeleteTarget((d) => ({ ...d, loading: true }));

    try {
      if (deleteTarget.type === 'position') {
        setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        cogoToast.warn('Experience removed');
      } else if (deleteTarget.type === 'education') {
        setEducation((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        cogoToast.warn('Education removed');
      }
    } catch (err) {
      cogoToast.error('Delete failed!');
    } finally {
      setDeleteTarget({ isOpen: false, type: null, id: null, title: '', loading: false });
    }
  }

  function handleDeleteCancel() {
    setDeleteTarget({ isOpen: false, type: null, id: null, title: '', loading: false });
  }

  const handlePositionSubmit = () => {
    const payload = positionForm.currentlyWorking
      ? { ...positionForm, endDate: null }
      : positionForm;
    savePosition(payload);
  };

  const handleEducationSubmit = () => {
    saveEducation(educationForm);
  };

  const isPositionSubmitDisabled =
    !positionForm.company?.trim() || !positionForm.title?.trim() || !positionForm.startDate;
  const isEducationSubmitDisabled =
    !educationForm.institution?.trim() ||
    !educationForm.degree?.trim() ||
    !educationForm.startDate ||
    !educationForm.endDate;

  function canProceedFromCurrentStep() {
    if (currentStep === 1) {
      return !!(profile && (profile.name || profile.email));
    }
    if (currentStep === 2) {
      if (!positions || positions.length === 0) return false;
      const invalid = positions.find(
        (p) => !p.company || !p.title || !p.startDate || (!p.currentlyWorking && !p.endDate),
      );
      return !invalid;
    }
    return true;
  }

  async function handleNext() {
    if (!canProceedFromCurrentStep()) {
      if (currentStep === 1) {
        setProfileModalOpen(true);
        cogoToast.warn('Please provide a name  before continuing.');
      } else if (currentStep === 2) {
        cogoToast.warn('Please add and complete at least one experience before continuing');
      } else {
        cogoToast.warn('Please complete required fields before continuing.');
      }
      return;
    }

    const ok = await saveProfileToServerBlocking();
    if (!ok) return;

    if (currentStep === 4) setFlags((s) => ({ ...s, goals: true }));
    if (currentStep === 3) setFlags((s) => ({ ...s, skills: true }));
    if (currentStep === 5) setFlags((s) => ({ ...s, welcomeCall: true }));

    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  }

  function handleBack() {
    if (currentStep === 1) {
      setProfileModalOpen(true);
      return;
    }
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  async function handleFinishSubmit() {
    try {
      const ok = await saveProfileToServerBlocking();
      if (ok) {
        cogoToast.success('profile has been saved!');
        navigate('/cleansheet', { replace: true });
      }
    } catch (err) {
      cogoToast.error('Save profile has been failed!');
    }
  }

  function addNewTechnologyFromInput() {
    const name = (positionForm._newTechName || '').trim();
    if (!name) return setMessage('Enter technology name to add.');
    setPositionForm((s) => {
      const exists = (s.technologies || []).some(
        (x) => x.name.toLowerCase() === name.toLowerCase(),
      );
      if (exists) {
        const newTechs = (s.technologies || []).map((t) =>
          t.name.toLowerCase() === name.toLowerCase()
            ? { ...t, type: s._newTechType || 'Peripheral' }
            : t,
        );
        const newTools = Array.from(new Set([...(s.tools || []), name]));
        return { ...s, technologies: newTechs, tools: newTools, _newTechName: '' };
      }
      const newTech = { name, type: s._newTechType || 'Peripheral' };
      const newTools = Array.from(new Set([...(s.tools || []), name]));
      return {
        ...s,
        technologies: [newTech, ...(s.technologies || [])],
        tools: newTools,
        _newTechName: '',
      };
    });
  }

  function toggleProjectType(type) {
    setPositionForm((s) => {
      const set = new Set(s.projectTypes || []);
      if (set.has(type)) set.delete(type);
      else set.add(type);
      return { ...s, projectTypes: Array.from(set) };
    });
  }

  const ProfileModal = () => {
    const initialForm = {
      name:
        profile?.name ||
        cookieDisplayName ||
        (authUser && (authUser.displayName || authUser.username)) ||
        '',
      email: profile?.email || cookieEmail || (authUser && authUser.email) || '',
      goals: profile?.goals || '',
    };
    const [form, setForm] = useState(initialForm);
    useEffect(
      () => setForm(initialForm),
      [profile, isProfileModalOpen, cookieDisplayName, cookieEmail, authUser],
    );

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setProfileModalOpen(false)} />
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Profile Info</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setProfileModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                value={form.name ?? ''}
                readOnly
                className="mt-1 block w-full rounded border px-3 py-2 text-sm bg-gray-50"
                placeholder="Full name"
              />
              <p className="text-xs text-gray-400 mt-1">
                Name is taken from your account and is not editable here.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={form.email ?? ''}
                readOnly
                className="mt-1 block w-full rounded border px-3 py-2 text-sm bg-gray-50"
                placeholder="Email"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email is taken from your account and is not editable here.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Career Goals</label>
              <textarea
                value={form.goals ?? ''}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                rows={3}
                placeholder="Briefly describe your career & professional goals"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setProfileModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-custom-main text-white rounded hover:bg-custom-secondary hover:text-white"
                onClick={async () => {
                  const newProfile = { name: form.name, email: form.email, goals: form.goals };
                  setProfile((p) => ({ ...(p || {}), ...newProfile }));
                  setProfileModalOpen(false);

                  const ok = await saveProfileToServerBlocking({ profileOverride: newProfile });
                  if (!ok)
                    cogoToast.error(
                      'Failed to save profile to server. Please check network or server settings.',
                    );
                  else cogoToast.success('profile has been saved!');
                }}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepLabels = ['Profile Info', 'Experiences', 'Skills', 'Welcome Call'];
  const childProvidesHeader = currentStep === 3 || currentStep === 4;
  useEffect(() => {
    if (currentStep === 1) setProfileModalOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">My Path</h2>
        <p className="text-sm text-gray-500">
          Complete your onboarding to start your learning journey
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">Onboarding Progress</div>
          <div className="text-sm text-gray-500">{progress}% Complete</div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-white rounded-full h-3 border border-gray-200 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all bg-custom-main"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4">
            <nav className="flex items-center justify-between text-xs text-gray-600">
              {stepLabels.map((lab, idx) => {
                const step = idx + 1;
                const active = step === currentStep;
                return (
                  <div key={lab} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold mb-1 ${active ? 'bg-custom-main text-white' : 'bg-white text-gray-500 border'}`}
                    >
                      {step}
                    </div>
                    <div className={`truncate ${active ? 'text-custom-main font-medium' : ''}`}>
                      {lab}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 overflow-hidden bg-white">
        {!childProvidesHeader && (
          <div className="bg-custom-main text-white px-4 py-3 rounded-t-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                {currentStep}
              </div>
              <div className="font-semibold">{stepLabels[currentStep - 1] || 'Step'}</div>
            </div>
          </div>
        )}

        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Add or update your profile details so we can personalize your learning path.
              </div>
              <div className="p-4 border rounded">
                {profile ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{profile.name}</div>
                      <div className="text-sm text-gray-500">{profile.email}</div>
                      {profile.title && (
                        <div className="text-sm text-gray-500">{profile.title}</div>
                      )}
                      {profile.location && (
                        <div className="text-sm text-gray-500">{profile.location}</div>
                      )}
                      {profile.goals && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Goals:</strong> {profile.goals}
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => setProfileModalOpen(true)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No profile yet. Click Edit to add one.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600">
                Tell us about your work history and education to help us tailor your learning path.
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 flex items-center gap-3">
                      <FaLinkedin className="text-blue-600" />
                      <div>
                        <div className="font-medium">Import from LinkedIn</div>
                        <div className="text-xs text-gray-500">
                          Quickly populate your experience from your LinkedIn profile
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        disabled
                        className="px-4 py-1 rounded-md bg-blue-400 text-white text-sm cursor-not-allowed flex items-center gap-1 opacity-70"
                        title="LinkedIn import coming soon"
                      >
                        Connect LinkedIn
                        <span className="text-[11px] text-white/80">(coming soon)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400">OR enter manually</div>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSampleJson}
                    className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-50"
                    title="Download sample cleansheet JSON"
                  >
                    Download sample JSON
                  </button>

                  <input
                    id="resume-upload"
                    type="file"
                    accept=".txt,.json,.pdf,.docx"
                    onChange={(e) => handleResumeFile(e.target.files?.[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="text-sm px-3 py-1 border rounded cursor-pointer"
                  >
                    Upload Resume (.json)
                  </label>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-gray-800">Work Experience</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openAddPosition}
                      className="text-sm px-3 py-1 border border-gray-300 rounded"
                    >
                      + Add Experience
                    </button>
                  </div>
                </div>

                <div>
                  {positions.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded text-gray-500 text-sm">
                      No work experience added yet. Click "Add Experience" to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {positions.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 border rounded flex justify-between items-start bg-white"
                        >
                          <div>
                            <div className="font-medium text-gray-800">
                              {p.title}{' '}
                              <span className="text-sm text-gray-500"> @ {p.company}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {p.startDate || '—'}{' '}
                              {p.currentlyWorking ? ' — Present' : ` — ${p.endDate || '—'}`}{' '}
                              {p.location ? ` • ${p.location}` : ''}
                            </div>
                            {p.description && (
                              <div className="mt-2 text-sm text-gray-600">{p.description}</div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditPosition(p)}
                                className="text-sm px-2 py-1 border rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => confirmRemovePosition(p)}
                                className="text-sm px-2 py-1 border rounded text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-gray-800">Education</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openAddEducation}
                      className="text-sm px-3 py-1 border border-gray-300 rounded"
                    >
                      + Add Education
                    </button>
                  </div>
                </div>

                <div>
                  {education.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded text-gray-500 text-sm">
                      No education added yet. Click "Add Education" to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {education.map((e) => (
                        <div
                          key={e.id}
                          className="p-4 border rounded flex justify-between items-start bg-white"
                        >
                          <div>
                            <div className="font-medium text-gray-800">{e.institution}</div>
                            <div className="text-sm text-gray-500">
                              {e.degree || ''} {e.field ? ` • ${e.field}` : ''}
                            </div>
                            {e.description && (
                              <div className="mt-2 text-sm text-gray-600">{e.description}</div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditEducation(e)}
                                className="text-sm px-2 py-1 border rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => confirmRemoveEducation(e)}
                                className="text-sm px-2 py-1 border rounded text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <LearnerExperienceReview positions={positions} onEdit={(p) => openEditPosition(p)} />
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                You’re almost done! Click Finish to go to your learner canvas.
              </div>

              <button
                onClick={handleExportClick}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm transition-all"
                title="Export JSON matching schema"
              >
                Export as JSON
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={handleBack}
          aria-label="Back"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 bg-custom-main text-white rounded hover:bg-custom-secondary"
            onClick={currentStep < totalSteps ? handleNext : handleFinishSubmit}
            aria-label="Next"
          >
            {currentStep < totalSteps ? 'Continue →' : 'Finish'}
          </button>
        </div>
      </div>

      {message && (
        <div className="fixed right-6 bottom-6 bg-gray-800 text-white px-4 py-2 rounded shadow">
          {message}
        </div>
      )}

      <ModalComponent
        isOpen={isPositionModalOpen}
        onClose={() => setPositionModalOpen(false)}
        title={editingPosition ? 'Edit Experience' : 'Add Experience'}
        onSubmit={handlePositionSubmit}
        disabled={isPositionSubmitDisabled}
        submitText="Save Experience"
        cancelText="Cancel"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-4 pl-4 pb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                value={positionForm.company}
                onChange={(e) => {
                  setPositionForm((s) => ({ ...s, company: e.target.value }));
                  setPositionFormErrors((errs) => ({ ...errs, company: undefined }));
                }}
                className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${positionFormErrors.company ? 'border-red-500' : ''}`}
                placeholder="Company name"
              />
              {positionFormErrors.company && (
                <p className="text-red-600 text-xs mt-1">{positionFormErrors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                value={positionForm.title}
                onChange={(e) => {
                  setPositionForm((s) => ({ ...s, title: e.target.value }));
                  setPositionFormErrors((errs) => ({ ...errs, title: undefined }));
                }}
                className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${positionFormErrors.title ? 'border-red-500' : ''}`}
                placeholder="Role (e.g. Frontend Developer)"
              />
              {positionFormErrors.title && (
                <p className="text-red-600 text-xs mt-1">{positionFormErrors.title}</p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Start (YYYY-MM) <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={positionForm.startDate}
                  onChange={(date) => setPositionForm((s) => ({ ...s, startDate: date }))}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText="Select start month"
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${positionFormErrors.startDate ? 'border-red-500' : ''}`}
                />
                {positionFormErrors.startDate && (
                  <p className="text-red-600 text-xs mt-1">{positionFormErrors.startDate}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">End (YYYY-MM)</label>
                <DatePicker
                  selected={positionForm.endDate}
                  onChange={(date) => setPositionForm((s) => ({ ...s, endDate: date }))}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText={
                    positionForm.currentlyWorking ? 'Currently working' : 'Select end month'
                  }
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${positionFormErrors.endDate ? 'border-red-500' : ''}`}
                  disabled={positionForm.currentlyWorking}
                />
                {positionFormErrors.endDate && (
                  <p className="text-red-600 text-xs mt-1">{positionFormErrors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={!!positionForm.currentlyWorking}
                  onChange={(e) =>
                    setPositionForm((s) => {
                      const next = { ...s, currentlyWorking: e.target.checked };
                      if (e.target.checked) next.endDate = null;
                      return next;
                    })
                  }
                  className="mr-2"
                />
                Currently working here
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                value={positionForm.location}
                onChange={(e) => setPositionForm((s) => ({ ...s, location: e.target.value }))}
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                placeholder="City, State or Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={positionForm.description}
                onChange={(e) => setPositionForm((s) => ({ ...s, description: e.target.value }))}
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Accomplishments</label>
              <TagInput
                value={positionForm.accomplishments}
                onChange={(next) => setPositionForm((s) => ({ ...s, accomplishments: next }))}
                placeholder="e.g. Revenue growth — press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tasks</label>
              <TagInput
                value={positionForm.tasks}
                onChange={(next) => setPositionForm((s) => ({ ...s, tasks: next }))}
                placeholder="e.g. Data analysis — press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Technologies</label>

              <div className="mt-2 flex flex-wrap gap-2">
                {(positionForm.technologies || []).map((t, idx) => (
                  <div
                    key={t.name + idx}
                    className={`flex items-center gap-2 rounded-full px-2 py-0.5 text-xs ring-1 ${
                      (t.type || '').toLowerCase() === 'core'
                        ? 'bg-green-50 text-green-800 ring-green-200'
                        : 'bg-white text-gray-700 ring-gray-200'
                    }`}
                  >
                    <span className="max-w-[10rem] truncate">{t.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPositionForm((s) => ({
                          ...s,
                          technologies: (s.technologies || []).map((x) =>
                            x.name === t.name
                              ? { ...x, type: x.type === 'Core' ? 'Peripheral' : 'Core' }
                              : x,
                          ),
                          // keep internal tools list in sync for legacy consumers
                          tools: Array.from(new Set([...(s.tools || []), t.name])),
                        }))
                      }
                      className={`text-[11px] px-2 py-0.5 rounded ${t.type === 'Core' ? 'bg-white text-green-800' : 'bg-gray-50 text-gray-600'}`}
                    >
                      {t.type === 'Core' ? 'Core' : 'Peripheral'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPositionForm((s) => ({
                          ...s,
                          technologies: (s.technologies || []).filter((x) => x.name !== t.name),
                          tools: (s.tools || []).filter((x) => x !== t.name),
                        }))
                      }
                      className="text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-700"
                      title="Remove technology"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <input
                  placeholder="Add technology (name) and press Enter"
                  className="rounded border px-3 py-2 text-sm col-span-2"
                  value={positionForm._newTechName || ''}
                  onChange={(e) => setPositionForm((s) => ({ ...s, _newTechName: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNewTechnologyFromInput();
                    }
                  }}
                />
                <div className="flex gap-2 items-center">
                  <select
                    value={positionForm._newTechType || 'Peripheral'}
                    onChange={(e) =>
                      setPositionForm((s) => ({ ...s, _newTechType: e.target.value }))
                    }
                    className="rounded border px-2 py-2 text-sm"
                    aria-label="Select technology importance"
                  >
                    <option value="Peripheral">Peripheral</option>
                    <option value="Core">Core</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internal Stakeholders
              </label>
              <TagInput
                value={positionForm.internalStakeholders}
                onChange={(next) => setPositionForm((s) => ({ ...s, internalStakeholders: next }))}
                placeholder="e.g. Product, Design — press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                External Stakeholders
              </label>
              <TagInput
                value={positionForm.externalStakeholders}
                onChange={(next) => setPositionForm((s) => ({ ...s, externalStakeholders: next }))}
                placeholder="e.g. Vendor X, Agency — press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Competencies</label>
              <TagInput
                value={positionForm.competencies}
                onChange={(next) => setPositionForm((s) => ({ ...s, competencies: next }))}
                placeholder="e.g. Leadership — press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priorities</label>
              <TagInput
                value={positionForm.priorities}
                onChange={(next) => setPositionForm((s) => ({ ...s, priorities: next }))}
                placeholder="e.g. Customer satisfaction — press Enter"
              />
            </div>

            {/* Project Types: 2 columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Types</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={positionForm.projectTypes?.includes('Agile')}
                    onChange={() => toggleProjectType('Agile')}
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Agile</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={positionForm.projectTypes?.includes('Waterfall')}
                    onChange={() => toggleProjectType('Waterfall')}
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Waterfall</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={positionForm.projectTypes?.includes('Research')}
                    onChange={() => toggleProjectType('Research')}
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Research</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={positionForm.projectTypes?.includes('Implementation')}
                    onChange={() => toggleProjectType('Implementation')}
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Implementation</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        isOpen={isEducationModalOpen}
        onClose={() => setEducationModalOpen(false)}
        title={editingEducation ? 'Edit Education' : 'Add Education'}
        onSubmit={handleEducationSubmit}
        disabled={isEducationSubmitDisabled}
        submitText="Save Education"
        cancelText="Cancel"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-4 pl-4 pb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                value={educationForm.institution}
                onChange={(e) => {
                  setEducationForm((s) => ({ ...s, institution: e.target.value }));
                  setEducationFormErrors((errs) => ({ ...errs, institution: undefined }));
                }}
                className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${educationFormErrors.institution ? 'border-red-500' : ''}`}
                placeholder="Institution name"
              />
              {educationFormErrors.institution && (
                <p className="text-red-600 text-xs mt-1">{educationFormErrors.institution}</p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Degree <span className="text-red-500">*</span>
                </label>
                <input
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm((s) => ({ ...s, degree: e.target.value }))}
                  className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                  placeholder="Degree (optional)"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Field <span className="text-red-500">*</span>
                </label>
                <input
                  value={educationForm.field}
                  onChange={(e) => setEducationForm((s) => ({ ...s, field: e.target.value }))}
                  className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                  placeholder="Field of study (optional)"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Start (YYYY-MM) <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={educationForm.startDate}
                  onChange={(date) => setEducationForm((s) => ({ ...s, startDate: date }))}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText="Select start month"
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${educationFormErrors.startDate ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  End (YYYY-MM) <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={educationForm.endDate}
                  onChange={(date) => setEducationForm((s) => ({ ...s, endDate: date }))}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText="Select end month (optional)"
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${educationFormErrors.endDate ? 'border-red-500' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={educationForm.description}
                onChange={(e) => setEducationForm((s) => ({ ...s, description: e.target.value }))}
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>
      </ModalComponent>

      {isProfileModalOpen && <ProfileModal />}

      <DeleteModal
        isOpen={deleteTarget.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget.title}
        loading={deleteTarget.loading}
      />
    </div>
  );
}
