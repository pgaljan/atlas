import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaLinkedin } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteModal from '../../../components/modals/DeleteModal';
import ModalComponent from '../../../components/modals/Modal';
import { learnerProfile, learnerPositions, learnerEducation } from '../../../constants/index';
import LearnerExperienceReview from '../learner-review-experience';

const STORAGE_KEY = 'learner_my_path_v1';
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

function toYYYYMM(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    return DATE_REGEX.test(d) ? d : '';
  }
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${yyyy}-${mm}`;
}
function parseYYYYMMToDate(s) {
  if (!s || typeof s !== 'string') return null;
  if (!DATE_REGEX.test(s)) return null;
  const [y, m] = s.split('-').map(Number);
  // day = 1
  return new Date(y, m - 1, 1);
}

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
    } else if (e.key === ',') {
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
        <div className="flex flex-wrap gap-3 mb-4">
          {value?.map((t, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-full 
                        border border-custom-main bg-white text-custom-main 
                        px-4 py-1.5 shadow-sm hover:shadow-md 
                        hover:bg-custom-main hover:text-white 
                        transition-all duration-200 ease-in-out"
            >
              <span className="text-sm font-medium max-w-[14rem] truncate">{t}</span>
              <button
                type="button"
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
                title="Remove"
                className="ml-1 w-6 h-6 flex items-center justify-center rounded-full 
                        bg-custom-main text-white hover:bg-white hover:text-custom-main 
                        border border-custom-main transition-all duration-200 
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-custom-main"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 6 L18 18" />
                  <path d="M6 18 L18 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => {
          if (text.trim()) addTagFrom(text);
        }}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-200 px-4 py-2 text-sm 
                placeholder-gray-400 shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-custom-main focus:border-custom-main"
        aria-label="Add tag"
      />
    </div>
  );
}

export default function LearnerMyPath() {
  const [profile, setProfile] = useState(undefined);
  const [positions, setPositions] = useState([]);
  const [education, setEducation] = useState([]);
  const [flags, setFlags] = useState({ skills: false, goals: false, welcomeCall: false });

  const [showReview, setShowReview] = useState(false);

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
    competencies: [],
    priorities: [],
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
    type: null, // 'position' | 'education'
    id: null,
    title: '',
    loading: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile(parsed.profile ?? learnerProfile);
        setPositions(
          parsed.positions && Array.isArray(parsed.positions) && parsed.positions.length > 0
            ? parsed.positions
            : learnerPositions,
        );
        setEducation(
          parsed.education && Array.isArray(parsed.education) && parsed.education.length > 0
            ? parsed.education
            : learnerEducation,
        );
        setFlags(parsed.flags ?? { skills: false, goals: false, welcomeCall: false });
      } else {
        setProfile(learnerProfile);
        setPositions(learnerPositions);
        setEducation(learnerEducation);
      }
    } catch (e) {
      console.warn('Failed to parse persisted learner state', e);
      setProfile(learnerProfile);
      setPositions(learnerPositions);
      setEducation(learnerEducation);
    }
  }, []);

  useEffect(() => {
    const toPersist = { profile, positions, education, flags };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch (e) {
      console.warn('Failed to persist learner state', e);
    }
  }, [profile, positions, education, flags]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const progress = useMemo(() => {
    const steps = [
      !!(profile && (profile.name || profile.email)),
      positions.length > 0,
      flags.skills,
      flags.goals,
      flags.welcomeCall,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  }, [profile, positions, flags]);

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
      competencies: [],
      priorities: [],
    });
    setPositionFormErrors({});
    setPositionModalOpen(true);
  }, []);

  const openEditPosition = useCallback((p) => {
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
      tools: Array.isArray(p.tools) ? p.tools : [],
      competencies: Array.isArray(p.competencies) ? p.competencies : [],
      priorities: Array.isArray(p.priorities) ? p.priorities : [],
    });
    setPositionFormErrors({});
    setPositionModalOpen(true);
  }, []);

  function validatePositionForm(payload) {
    const errs = {};
    if (!payload.company || payload.company.trim() === '') errs.company = 'Company is required.';
    if (!payload.title || payload.title.trim() === '') errs.title = 'Title is required.';
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
      tools: Array.isArray(payload.tools) ? payload.tools : [],
      competencies: Array.isArray(payload.competencies) ? payload.competencies : [],
      priorities: Array.isArray(payload.priorities) ? payload.priorities : [],
    };

    if (!validatePositionForm(normalized)) {
      setMessage('Please fix required fields in the position form.');
      return;
    }

    const stored = {
      ...normalized,
      startDate: toYYYYMM(normalized.startDate),
      endDate: normalized.currentlyWorking ? '' : toYYYYMM(normalized.endDate),
    };

    if (stored.id) {
      setPositions((prev) => prev.map((x) => (x.id === stored.id ? { ...x, ...stored } : x)));
      setMessage('Position updated');
    } else {
      const newPos = { ...stored, id: String(Date.now()) };
      setPositions((prev) => [newPos, ...prev]);
      setMessage('Position added');
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
      setMessage('Please fix required fields in the education form.');
      return;
    }
    const stored = {
      ...payload,
      startDate: toYYYYMM(payload.startDate),
      endDate: toYYYYMM(payload.endDate),
    };
    if (stored.id) {
      setEducation((prev) => prev.map((x) => (x.id === stored.id ? { ...x, ...stored } : x)));
      setMessage('Education updated');
    } else {
      const newEdu = { ...stored, id: String(Date.now()) };
      setEducation((prev) => [newEdu, ...prev]);
      setMessage('Education added');
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

  function saveProfile(p) {
    if (!p.name && !p.email) {
      setMessage('Provide at least a name or an email.');
      return;
    }
    setProfile(p);
    setProfileModalOpen(false);
    setMessage('Profile saved');
  }

  function importFromLinkedIn() {
    const samplePositions = [
      {
        id: `imp-pos-${Date.now()}`,
        company: 'Acme Corp',
        title: 'Frontend Developer',
        startDate: '2020-01',
        endDate: '2023-06',
        currentlyWorking: false,
        description: 'Built UI components and onboarding flows.',
        location: 'Remote',
        accomplishments: ['Feature Launch'],
        tasks: ['Component Design', 'Code Reviews'],
        tools: ['React', 'TypeScript'],
        competencies: ['Collaboration'],
        priorities: ['Product Quality'],
      },
    ];
    setPositions((prev) => {
      const already = prev.some(
        (p) => p.company === 'Acme Corp' && p.title === 'Frontend Developer',
      );
      return already ? prev : [...samplePositions, ...prev];
    });
    setMessage('Imported sample profile from LinkedIn (simulation).');
  }

  async function handleResumeFile(file) {
    if (!file) return;
    try {
      if (file.type === 'text/plain') {
        const txt = await file.text();
        const lines = txt
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const generated = {
          company: lines[0] ?? 'Parsed Company',
          title: lines[1] ?? 'Parsed Title',
          startDate: '2021-01',
          endDate: '',
          currentlyWorking: true,
          description: lines.slice(2).join(' '),
          location: '',
          accomplishments: lines.slice(2).slice(0, 3),
          tasks: lines.slice(2).slice(3, 6),
          tools: ['ParsedTool1'],
          competencies: [],
          priorities: [],
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
        setMessage('Resume parsed (demo). Please review and Save.');
      } else {
        setMessage(
          'Resume upload: only text demo available locally. Connect to parser backend for PDFs.',
        );
      }
    } catch (err) {
      console.error('Resume parse failed', err);
      setMessage('Failed to parse resume (demo).');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget.type || !deleteTarget.id) return;
    setDeleteTarget((d) => ({ ...d, loading: true }));

    try {
      if (deleteTarget.type === 'position') {
        setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setMessage('Position removed');
      } else if (deleteTarget.type === 'education') {
        setEducation((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        setMessage('Education removed');
      }
    } catch (err) {
      console.error('Delete failed', err);
      setMessage('Delete failed');
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

  const isEducationSubmitDisabled = !educationForm.institution?.trim();

  const handleStep2Continue = () => {
    if (!positions || positions.length === 0) {
      setMessage('Add at least one position before continuing.');
      return;
    }
    const invalid = positions.find(
      (p) => !p.company || !p.title || !p.startDate || (!p.currentlyWorking && !p.endDate),
    );
    if (invalid) {
      openEditPosition(invalid);
      setMessage('Please complete required fields for your positions.');
      return;
    }
    setShowReview(true);
    // setMessage('Showing review for your experience (step 3).');
  };

  const handleReviewContinue = () => {
    setFlags((s) => ({ ...s, skills: true }));
    setShowReview(false);
    // setMessage('Progress saved. Continue to Skills (step 4 simulated).');
  };

  const handleBackFromStep = () => {
    if (showReview) {
      setShowReview(false);
      return;
    }
    setProfileModalOpen(true);
  };

  const ProfileModal = () => {
    const [form, setForm] = useState(profile || {});
    useEffect(() => setForm(profile || {}), [profile, isProfileModalOpen]);

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
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
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
                onClick={() => saveProfile(form)}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

          <div className="flex mt-3 text-xs text-gray-500 justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="font-medium mr-1">Profile Info</span>
              {profile && (profile.name || profile.email) ? (
                <span className="text-green-600 text-xs">✓</span>
              ) : (
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="text-xs text-custom-main underline"
                >
                  Add
                </button>
              )}
            </div>
            <div>Experiences</div>
            <div>Skills</div>
            <div>Goals</div>
            <div>Welcome Call</div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 overflow-hidden">
        {showReview ? (
          <div className="p-6 bg-white">
            <LearnerExperienceReview
              positions={positions}
              onEdit={(p) => {
                openEditPosition(p);
              }}
            />
          </div>
        ) : (
          <>
            <div className="bg-custom-main text-white px-4 py-3 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="font-semibold">Share Your Professional Experience</div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-white">
              <p className="text-sm text-gray-600">
                Tell us about your work history and education to help us tailor your learning path.
              </p>

              {/* import / resume */}
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
                        onClick={() => importFromLinkedIn()}
                        className="px-4 py-1 rounded-md bg-blue-600 text-white text-sm"
                      >
                        Connect LinkedIn
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400">OR enter manually</div>

                <div className="ml-auto">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(e) => handleResumeFile(e.target.files?.[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="text-sm px-3 py-1 border rounded cursor-pointer"
                  >
                    Upload Resume (demo)
                  </label>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-gray-800">Work Experience</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openAddPosition}
                      className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-custom-secondary hover:text-white"
                    >
                      + Add Position
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  {positions.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded text-gray-500 text-sm">
                      No work experience added yet. Click "Add Position" to get started.
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
                              {p.currentlyWorking ? ' — Present' : ` — ${p.endDate || '—'}`}
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
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-gray-800">Education</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openAddEducation}
                      className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-custom-secondary hover:text-white"
                    >
                      + Add Education
                    </button>
                  </div>
                </div>

                <div className="mt-3">
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
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={handleBackFromStep}
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {!showReview ? (
            <button
              className="px-4 py-2 bg-custom-main text-white rounded hover:bg-custom-secondary"
              onClick={handleStep2Continue}
            >
              Continue to Review →
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-custom-main text-white rounded hover:bg-custom-secondary"
              onClick={handleReviewContinue}
            >
              Continue to Skills →
            </button>
          )}
        </div>
      </div>

      {/* toast */}
      {message && (
        <div className="fixed right-6 bottom-6 bg-gray-800 text-white px-4 py-2 rounded shadow">
          {message}
        </div>
      )}

      <ModalComponent
        isOpen={isPositionModalOpen}
        onClose={() => setPositionModalOpen(false)}
        title={editingPosition ? 'Edit Position' : 'Add Position'}
        onSubmit={handlePositionSubmit}
        disabled={isPositionSubmitDisabled}
        submitText="Save Position"
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
                className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                  positionFormErrors.company ? 'border-red-500' : ''
                }`}
                placeholder="Company name"
              />
              {positionFormErrors.company && (
                <p className="text-red-600 text-xs mt-1">{positionFormErrors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={positionForm.title}
                onChange={(e) => {
                  setPositionForm((s) => ({ ...s, title: e.target.value }));
                  setPositionFormErrors((errs) => ({ ...errs, title: undefined }));
                }}
                className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                  positionFormErrors.title ? 'border-red-500' : ''
                }`}
                placeholder="Job title"
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
                  onChange={(date) =>
                    setPositionForm((s) => ({
                      ...s,
                      startDate: date,
                      // clear related errors
                      ...(s.startDate !== date
                        ? {
                            /* noop */
                          }
                        : {}),
                    }))
                  }
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText="Select start month"
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                    positionFormErrors.startDate ? 'border-red-500' : ''
                  }`}
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
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                    positionFormErrors.endDate ? 'border-red-500' : ''
                  }`}
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

            {/* tag inputs for badges */}
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
              <label className="block text-sm font-medium text-gray-700">Tools</label>
              <TagInput
                value={positionForm.tools}
                onChange={(next) => setPositionForm((s) => ({ ...s, tools: next }))}
                placeholder="e.g. React, SQL — press Enter"
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
          </div>
        </div>
      </ModalComponent>

      {/* Education modal */}
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
                className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                  educationFormErrors.institution ? 'border-red-500' : ''
                }`}
                placeholder="Institution name"
              />
              {educationFormErrors.institution && (
                <p className="text-red-600 text-xs mt-1">{educationFormErrors.institution}</p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Degree</label>
                <input
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm((s) => ({ ...s, degree: e.target.value }))}
                  className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                  placeholder="Degree (optional)"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Field</label>
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
                <label className="block text-sm font-medium text-gray-700">Start (YYYY-MM)</label>
                <DatePicker
                  selected={educationForm.startDate}
                  onChange={(date) => setEducationForm((s) => ({ ...s, startDate: date }))}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText="Select start month"
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                    educationFormErrors.startDate ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">End (YYYY-MM)</label>
                <DatePicker
                  selected={educationForm.endDate}
                  onChange={(date) => setEducationForm((s) => ({ ...s, endDate: date }))}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  maxDate={new Date()}
                  placeholderText="Select end month (optional)"
                  className={`mt-1 block w-full rounded border px-3 py-2 text-sm ${
                    educationFormErrors.endDate ? 'border-red-500' : ''
                  }`}
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
