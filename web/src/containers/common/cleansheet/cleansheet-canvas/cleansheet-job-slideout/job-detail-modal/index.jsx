import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ModalComponent from '../../../../../../components/modals/Modal';
import DeleteModal from '../../../../../../components/modals/DeleteModal';
import { PiSparkle } from 'react-icons/pi';
export default function JobDetailModal({ isOpen, onClose, job, onUpdateJob }) {
  const [draft, setDraft] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskEditing, setTaskEditing] = useState(null);
  const [taskForm, setTaskForm] = useState({ text: '', dueDate: '', priority: 'medium' });
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deletingTodo, setDeletingTodo] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [materialType, setMaterialType] = useState('resume');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMaterial, setViewMaterial] = useState(null);
  const [showSetDeadlines, setShowSetDeadlines] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [elementModalOpen, setElementModalOpen] = useState(false);
  const [elementType, setElementType] = useState(null);
  const [elementValue, setElementValue] = useState('');
  const [elementEditIndex, setElementEditIndex] = useState(null);

  const [deleteMaterialId, setDeleteMaterialId] = useState(null);
  const [deletingMaterial, setDeletingMaterial] = useState(false);

  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
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

  function loadJobsFromStorage() {
    try {
      const raw = localStorage.getItem('jobs');
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse jobs from localStorage', e);
      return [];
    }
  }
  // function saveJobsToStorage(list) {
  //   try {
  //     localStorage.setItem('jobs', JSON.stringify(list || []));
  //     try {
  //       window.dispatchEvent(new CustomEvent('jobsUpdated', { detail: list || [] }));
  //     } catch (e) {}
  //   } catch (e) {
  //     console.error('Failed to save jobs to localStorage', e);
  //   }
  // }
  function saveJobsToStorage(list) {
    try {
      localStorage.setItem('jobs', JSON.stringify(list || []));
      setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent('jobsUpdated', { detail: list || [] }));
        } catch (e) {}
      }, 0);
    } catch (e) {
      console.error('Failed to save jobs to localStorage', e);
    }
  }

  function saveOrUpdateJobInStorage(jobObj) {
    if (!jobObj) return;
    const jobs = loadJobsFromStorage();
    const idx = jobs.findIndex((j) => j.id === jobObj.id);
    if (idx >= 0) {
      jobs[idx] = { ...jobs[idx], ...jobObj };
    } else {
      jobs.push({ ...jobObj });
    }
    saveJobsToStorage(jobs);
    return jobs;
  }

  function updateDraft(patch) {
    setDraft((d) => ({ ...(d || {}), ...(typeof patch === 'function' ? patch(d) : patch) }));
  }
  useEffect(() => {
    if (!job) {
      setDraft(null);
      return;
    }
    const copy = JSON.parse(JSON.stringify(job || {}));
    copy.skills = copy.skills || [];
    copy.competencies = copy.competencies || [];
    copy.materials = copy.materials || [];
    if (!copy.todos || copy.todos.length === 0) {
      copy.todos = generateDefaultTodos(copy).map((t, i) => ({ id: Date.now() + i, ...t }));
    } else {
      copy.todos = (copy.todos || []).map((t, i) => ({ id: t.id || Date.now() + i, ...t }));
    }
    if (copy.closeDate && copy.closeDate.indexOf('T') !== -1) {
      copy.closeDate = copy.closeDate.split('T')[0];
    }
    setDraft(copy);
  }, [job]);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement;
    document.body.classList.add('overflow-hidden');
    const timer = setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      if (focusable) focusable.focus();
      else dialog.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('overflow-hidden');
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (taskModalOpen) {
          setTaskModalOpen(false);
          setTaskEditing(null);
        } else if (showGenerateModal) setShowGenerateModal(false);
        else if (showViewModal) {
          setShowViewModal(false);
          setViewMaterial(null);
        } else if (showSetDeadlines) {
          setShowSetDeadlines(false);
        } else if (deleteTargetId) {
          setDeleteTargetId(null);
        } else onClose?.();
      } else if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll(
            "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    isOpen,
    taskModalOpen,
    showGenerateModal,
    showViewModal,
    showSetDeadlines,
    deleteTargetId,
    onClose,
  ]);

  if (!isOpen || !draft) return null;

  function handleSave() {
    if (!draft.id) {
      draft.id = Date.now();
    }
    try {
      saveOrUpdateJobInStorage(draft);
    } catch (e) {
      console.error('Error saving job locally', e);
    }

    // onUpdateJob?.(draft);
    //  DEFER parent update to avoid "update during render" error
    Promise.resolve().then(() => {
      onUpdateJob?.(draft);
      onClose?.();
    });
  }

  function openAddTaskModal() {
    setTaskEditing(null);
    setTaskForm({ text: '', dueDate: '', priority: 'medium' });
    setTaskModalOpen(true);
  }
  function openEditTaskModal(todo) {
    setTaskEditing(todo);
    setTaskForm({
      text: todo.text || '',
      dueDate: todo.dueDate || '',
      priority: todo.priority || 'medium',
    });
    setTaskModalOpen(true);
  }
  function saveTaskFromModal() {
    const text = (taskForm.text || '').trim();
    if (!text) {
      alert('Task description required');
      return;
    }
    if (taskEditing) {
      setDraft((d) => ({
        ...d,
        todos: d.todos.map((t) => (t.id === taskEditing.id ? { ...t, ...taskForm } : t)),
      }));
    } else {
      const newTodo = {
        id: Date.now(),
        text,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority || 'medium',
        completed: false,
      };
      setDraft((d) => ({ ...d, todos: [...(d.todos || []), newTodo] }));
    }
    setTaskModalOpen(false);
    setTaskEditing(null);
  }
  function toggleTodoComplete(todoId) {
    setDraft((d) => ({
      ...d,
      todos: (d.todos || []).map((t) => (t.id === todoId ? { ...t, completed: !t.completed } : t)),
    }));
  }
  function confirmDeleteTodo(todoId) {
    setDeleteTargetId(todoId);
  }
  const performDeleteTodo = () => {
    if (!deleteTargetId) return;

    try {
      setDeletingTodo(true);

      setDraft((d) => ({
        ...d,
        todos: (d.todos || []).filter((t) => t.id !== deleteTargetId),
      }));
    } catch (e) {
      console.error('Failed to delete todo', e);
    } finally {
      setDeletingTodo(false);
      setDeleteTargetId(null);
    }
  };

  function openSetDeadlinesModal() {
    setTargetDate('');
    setShowSetDeadlines(true);
  }
  function scheduleAllToTarget() {
    if (!targetDate) return alert('Choose a target application date');
    if (!draft.todos || draft.todos.length === 0) return alert('No tasks to schedule');

    const sorted = [...draft.todos].sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority || 'medium'] - pOrder[b.priority || 'medium'];
    });

    const end = new Date(targetDate);
    const start = new Date(end);
    start.setDate(end.getDate() - Math.max(sorted.length - 1, 0));

    const scheduled = sorted.map((t, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { ...t, dueDate: d.toISOString().split('T')[0] };
    });

    const byId = new Map(scheduled.map((t) => [t.id, t.dueDate]));
    setDraft((d) => ({
      ...d,
      todos: d.todos.map((t) => ({ ...t, dueDate: byId.get(t.id) || t.dueDate || null })),
    }));
    setShowSetDeadlines(false);
  }

  function uploadMaterial() {
    const title = prompt('Filename (e.g. resume.pdf)');
    if (!title) return;
    const id = Date.now();
    setDraft((d) => ({
      ...d,
      materials: [
        ...(d.materials || []),
        {
          id,
          title,
          type: detectTypeFromTitle(title),
          meta: 'Uploaded',
          content: 'Uploaded content preview...',
          url: '#',
          badges: [
            { label: labelFromType(detectTypeFromTitle(title)), color: colors.primaryBlue },
            { label: new Date().toLocaleDateString(), color: '#f59e0b' },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }
  function detectTypeFromTitle(t) {
    const s = (t || '').toLowerCase();
    if (s.includes('cover')) return 'cover-letter';
    if (s.includes('resume') || s.endsWith('.pdf')) return 'resume';
    if (s.includes('email') || s.endsWith('.html')) return 'email';
    return 'file';
  }
  function labelFromType(type) {
    if (type === 'cover-letter') return 'DOCX';
    if (type === 'resume') return 'PDF';
    if (type === 'email') return 'HTML';
    return 'FILE';
  }
  function generateMaterial() {
    const id = Date.now();
    const dateStr = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    const base = {
      id,
      url: '#',
      createdAt: new Date().toISOString(),
      badges: [
        { label: labelFromType(materialType), color: colors.primaryBlue },
        ...(materialType !== 'email' ? [{ label: 'ATS Optimized', color: '#16a34a' }] : []),
        { label: dateStr, color: '#f59e0b' },
      ],
    };

    let item;
    if (materialType === 'resume') {
      item = {
        ...base,
        type: 'resume',
        title: `Resume for ${draft.title || 'Role'}`,
        meta: 'PDF',
        content:
          'Professional resume tailored for this role. Highlights relevant experience, skills, and achievements. Preview snippet...',
      };
    } else if (materialType === 'cover-letter') {
      item = {
        ...base,
        type: 'cover-letter',
        title: `Cover Letter for ${draft.title || 'Role'}`,
        meta: 'DOCX',
        content: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${draft.title} position at ${draft.company}. Based on ...`,
      };
    } else {
      item = {
        ...base,
        type: 'email',
        title: `Email for ${draft.title || 'Role'}`,
        meta: 'HTML',
        content: `Subject: Application for ${draft.title} Position\n\nDear Hiring Manager, I hope this email finds you well. I am reaching out ...`,
      };
    }

    setDraft((d) => ({ ...d, materials: [...(d.materials || []), item] }));
    setShowGenerateModal(false);
  }
  function openMaterialView(m) {
    setViewMaterial(m);
    setShowViewModal(true);
  }

  function isOverdue(t) {
    return t.dueDate && new Date(t.dueDate) < stripTime(new Date()) && !t.completed;
  }
  function isDueSoon(t) {
    if (!t.dueDate) return false;
    const days = Math.ceil(
      (stripTime(new Date(t.dueDate)) - stripTime(new Date())) / (1000 * 60 * 60 * 24),
    );
    return days >= 0 && days <= 3 && !t.completed;
  }
  function stripTime(d) {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  }
  const priorityColor = (p) => {
    if (p === 'high') return { color: '#dc2626', bg: '#fff1f2', badge: 'HIGH', border: '#dc2626' };
    if (p === 'medium')
      return { color: '#d97706', bg: '#fffbeb', badge: 'MEDIUM', border: '#f59e0b' };
    if (p === 'low') return { color: '#0369a1', bg: '#f0f9ff', badge: 'LOW', border: '#0369a1' };
    return { color: '#6b7280', bg: '#f3f4f6', badge: '—', border: '#6b7280' };
  };

  const fitScore = calculateFitScore(draft);

  function materialDate(m) {
    if (m?.badges) {
      const dateBadge = m.badges.find(
        (b) =>
          /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(b.label) ||
          /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(b.label) ||
          /\d{4}/.test(b.label),
      );
      if (dateBadge) return dateBadge.label;
    }

    if (m.createdAt) {
      return new Date(m.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return '';
  }
  function openAddElementModal(type) {
    setElementType(type);
    setElementValue('');
    setElementEditIndex(null);
    setElementModalOpen(true);
  }

  function openEditElementModal(type, value, index) {
    setElementType(type);
    setElementValue(value);
    setElementEditIndex(index);
    setElementModalOpen(true);
  }

  const confirmDeleteTask = (todoId) => {
    setDeleteTargetId(todoId);
  };
  function handleElementModalSubmit() {
    const val = (elementValue || '').trim();
    if (!val) return;

    if (elementType === 'skill') {
      setDraft((d) => {
        const arr = [...(d.skills || [])];
        if (elementEditIndex != null) arr[elementEditIndex] = val;
        else arr.push(val);
        return { ...d, skills: arr };
      });
    } else if (elementType === 'competency') {
      setDraft((d) => {
        const arr = [...(d.competencies || [])];
        if (elementEditIndex != null) arr[elementEditIndex] = val;
        else arr.push(val);
        return { ...d, competencies: arr };
      });
    }

    setElementModalOpen(false);
    setElementValue('');
    setElementEditIndex(null);
    setElementType(null);
  }

  function requestDeleteMaterial(id) {
    setDeleteMaterialId(id);
  }

  function confirmDeleteMaterial() {
    if (!deleteMaterialId) return;

    setDeletingMaterial(true);

    setDraft((prev) => {
      const updated = {
        ...prev,
        materials: (prev.materials || []).filter((m) => m.id !== deleteMaterialId),
      };

      try {
        saveOrUpdateJobInStorage(updated);
      } catch (e) {
        console.error('Failed to persist job after delete', e);
      }

      // onUpdateJob?.(updated);

      return updated;
    });

    setDeletingMaterial(false);
    setDeleteMaterialId(null);
  }

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!isOpen}
      role="presentation"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: colors.dark,
            color: 'white',
            borderBottom: `1px solid ${colors.neutralBorder}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                {draft?.title || 'Job Details'} {draft?.company ? ` at ${draft?.company}` : ''}
              </h3>
              <div className="text-xs text-gray-300 mt-0.5">{draft?.location || ''}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close dialog"
            className="p-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto space-y-6"
          style={{ background: colors.neutralBackground }}
        >
          <section
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: colors.neutralBorder }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: colors.primaryBlue }}
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <h4 className="text-base font-semibold" style={{ color: colors.dark }}>
                Job Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: colors.dark }}>
                  Status
                </label>
                <select
                  value={draft.status || 'interested'}
                  onChange={(e) => updateDraft({ status: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  style={{ borderColor: colors.neutralBorder }}
                >
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="not-interested">Not Interested</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: colors.dark }}>
                  Close Date
                </label>
                <input
                  type="date"
                  value={draft.closeDate || ''}
                  onChange={(e) => updateDraft({ closeDate: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  style={{ borderColor: colors.neutralBorder }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <InfoRow label="Company" value={draft.company || '—'} colors={colors} />
              <InfoRow label="Location" value={draft.location || '—'} colors={colors} />
              <InfoRow label="Salary" value={draft.salary || '—'} colors={colors} />
              <InfoRow label="Notes" value={draft.notes || 'No notes added'} colors={colors} />
            </div>
          </section>

          <section
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: colors.neutralBorder }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: colors.primaryBlue }}
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <h4 className="text-base font-semibold" style={{ color: colors.dark }}>
                Application Checklist
              </h4>
            </div>

            <div className="space-y-2 mb-4">
              {(draft.todos || []).map((t) => {
                const overdue = isOverdue(t);
                const dueSoon = isDueSoon(t);
                const pr = priorityColor(t.priority);

                const leftBorderColor = overdue
                  ? '#dc2626'
                  : dueSoon && !t.completed
                    ? '#f59e0b'
                    : pr.border;

                const bgColor = t.completed
                  ? 'var(--color-neutral-background-secondary)'
                  : overdue
                    ? '#fff1f2'
                    : dueSoon
                      ? '#fffbeb'
                      : pr.bg;

                const dueColor = t.completed
                  ? 'var(--color-primary-blue)'
                  : overdue && !t.completed
                    ? '#dc2626'
                    : dueSoon && !t.completed
                      ? '#d97706'
                      : 'var(--color-neutral-text-light)';

                return (
                  <div
                    key={t.id}
                    className="group relative flex items-center gap-3 p-3 rounded-lg border"
                    style={{
                      borderColor: 'var(--color-neutral-border)',
                      borderLeftWidth: 4,
                      borderLeftStyle: 'solid',
                      borderLeftColor: leftBorderColor,
                      background: bgColor,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!t.completed}
                      onChange={() => toggleTodoComplete(t.id)}
                      aria-label={`Mark ${t.text} complete`}
                      className="flex-shrink-0"
                      style={{
                        accentColor: 'var(--color-primary-blue)',
                        width: 18,
                        height: 18,
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${t.completed ? 'line-through' : ''}`}
                        style={{
                          color: t.completed
                            ? 'var(--color-neutral-text-muted)'
                            : 'var(--color-dark)',
                        }}
                      >
                        {t.text}
                      </div>

                      <div
                        className="flex items-center gap-3 text-xs mt-1"
                        style={{ color: 'var(--color-neutral-text-light)' }}
                      >
                        {t.dueDate && (
                          <>
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ color: dueColor }}
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>

                            <span
                              className="font-semibold"
                              style={{
                                color: dueColor,
                                fontWeight: 600,
                              }}
                            >
                              {formatDueDate(t.dueDate)}
                            </span>
                          </>
                        )}

                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-normal uppercase"
                          style={{
                            background: pr.bg,
                            color: pr.color,
                          }}
                        >
                          {pr.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        title="Edit"
                        onClick={() => openEditTaskModal(t)}
                        className="p-1.5 rounded border bg-white hover:bg-gray-50 transition-colors"
                        style={{ borderColor: 'var(--color-neutral-border)' }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button
                        title="Delete"
                        onClick={() => confirmDeleteTodo(t.id)}
                        className="p-1.5 rounded border bg-white hover:bg-red-50 transition-colors"
                        style={{ borderColor: 'var(--color-neutral-border)', color: '#dc2626' }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={openAddTaskModal}
                className="px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5"
                style={{ background: 'var(--color-primary-blue)' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Task
              </button>

              <button
                onClick={openSetDeadlinesModal}
                className="px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5"
                style={{ background: '#16a34a' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Set Deadlines
              </button>
            </div>
          </section>

          <section
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: colors.neutralBorder }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: colors.primaryBlue }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h4 className="text-base font-semibold" style={{ color: colors.dark }}>
                  Application Materials
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5 transition-colors"
                  style={{ background: colors.primaryBlue }}
                >
                  <PiSparkle className="h-4 w-4" />
                  Generate
                </button>
                <button
                  onClick={uploadMaterial}
                  className="px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5 transition-colors"
                  style={{ background: '#16a34a' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload
                </button>
              </div>
            </div>

            <div className="space-y-3 min-h-[120px]">
              {(draft.materials || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4" aria-hidden style={{ color: colors.neutralTextMuted }}>
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="mx-auto"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                  </div>

                  <div className="text-sm italic" style={{ color: colors.neutralTextMuted }}>
                    No application materials created for this opportunity yet.
                  </div>
                  <div className="text-xs mt-2" style={{ color: colors.neutralTextLight }}>
                    Use Generate to create a tailored resume/cover letter or Upload your own files.
                  </div>
                </div>
              ) : (
                (draft.materials || []).map((m) => (
                  <div
                    key={m.id}
                    className="relative flex items-start gap-3 p-4 rounded-lg border bg-[#f8f8f8] transition-all group hover:bg-[#e3f2fd] hover:border-[#0066CC]"
                    style={{
                      borderColor: colors.neutralBorder,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center font-bold text-white flex-shrink-0"
                      style={{
                        background:
                          m.type === 'cover-letter'
                            ? colors.accentBlue
                            : m.type === 'resume'
                              ? colors.primaryBlue
                              : colors.dark,
                      }}
                    >
                      {m.type === 'cover-letter' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      ) : m.type === 'resume' ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1.5" style={{ color: colors.dark }}>
                        {m.title}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: '#f5f5f7', color: colors.neutralTextLight }}
                        >
                          {labelFromType(m.type)}
                        </span>

                        {(m.badges || []).some((b) => /ATS/i.test(b.label)) && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{ background: '#e8f5e9', color: '#388e3c' }}
                          >
                            ATS Optimized
                          </span>
                        )}

                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: '#fff3e0', color: '#f57c00' }}
                        >
                          {materialDate(m)}
                        </span>
                      </div>

                      <div
                        className="text-xs line-clamp-2"
                        style={{ color: colors.neutralTextLight }}
                      >
                        {m.content ? m.content : 'No preview available.'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => openMaterialView(m)}
                        className="text-xs px-2.5 py-1 border rounded bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors"
                        style={{ borderColor: colors.neutralBorder }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => alert('Downloading stub...')}
                        className="text-xs px-2.5 py-1 border rounded bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors"
                        style={{ borderColor: colors.neutralBorder }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={() => requestDeleteMaterial(m.id)}
                        className="text-xs px-2.5 py-1 border rounded bg-white hover:bg-red-50 flex items-center gap-1 transition-colors"
                        style={{ borderColor: colors.neutralBorder, color: '#dc2626' }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: colors.neutralBorder }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: colors.primaryBlue }}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m9.2-5.2l-4.2-4.2m0 8.4l4.2-4.2M23 12h-6m-6 0H1m5.2-5.2l4.2 4.2m0-8.4L6.2 6.2" />
              </svg>
              <h4 className="text-base font-semibold" style={{ color: colors.dark }}>
                Required Skills & Competencies
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div
                  className="text-xs font-semibold mb-3"
                  style={{ color: colors.subneutralTextLight }}
                >
                  Required Skills
                </div>
                <div className="space-y-2">
                  {(draft.skills || []).length === 0 ? (
                    <div className="text-sm italic" style={{ color: colors.neutralTextMuted }}>
                      No skills specified
                    </div>
                  ) : (
                    (draft.skills || []).map((s, idx) => (
                      <div
                        key={`skill-${idx}`}
                        className="flex items-center justify-between bg-[#f8f8f8] py-1 px-2 border rounded-lg hover:bg-[#e3f2fd] hover:border-[#0066CC]"
                      >
                        <div className="text-sm" style={{ color: colors.dark }}>
                          {s}
                        </div>
                        <button
                          onClick={() =>
                            setDraft((d) => ({ ...d, skills: d.skills.filter((x) => x !== s) }))
                          }
                          className="text-sm px-2 py-1 rounded  transition-colors"
                          style={{ color: '#dc2626', fontWeight: 600 }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => openAddElementModal('skill')}
                  className="mt-3 px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5"
                  style={{ background: colors.primaryBlue }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Skill
                </button>
              </div>

              <div>
                <div
                  className="text-xs font-semibold mb-3"
                  style={{ color: colors.neutralTextLight }}
                >
                  Key Competencies
                </div>
                <div className="space-y-2">
                  {(draft.competencies || []).length === 0 ? (
                    <div className="text-sm italic" style={{ color: colors.neutralTextMuted }}>
                      No competencies
                    </div>
                  ) : (
                    (draft.competencies || []).map((c, idx) => (
                      <div
                        key={`comp-${idx}`}
                        className="flex items-center justify-between px-2 py-1 border bg-[#f8f8f8] rounded-lg hover:bg-[#e3f2fd] hover:border-[#0066CC]"
                      >
                        <div className="text-sm" style={{ color: colors.dark }}>
                          {c}
                        </div>
                        <button
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              competencies: d.competencies.filter((x) => x !== c),
                            }))
                          }
                          className="text-sm px-2 py-1 rounded transition-colors"
                          style={{ color: '#dc2626', fontWeight: 600 }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => openAddElementModal('competency')}
                  className="mt-3 px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5"
                  style={{ background: colors.primaryBlue }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Competency
                </button>
              </div>
            </div>
          </section>

          <section className=" rounded-lg border p-5" style={{ borderColor: colors.neutralBorder }}>
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: colors.primaryBlue }}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <h4 className="text-base font-semibold" style={{ color: colors.dark }}>
                Fit Analysis
              </h4>
            </div>

            <div
              className="flex items-center gap-4 p-4 rounded-lg border-2 mb-4"
              style={{ borderColor: colors.primaryBlue, background: 'white' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0"
                style={{
                  background: fitScore >= 75 ? '#16a34a' : fitScore >= 50 ? '#f59e0b' : '#dc2626',
                }}
              >
                {fitScore}%
              </div>

              <div className="flex-1">
                <div className="font-semibold text-base" style={{ color: colors.dark }}>
                  Overall Fit Score
                </div>
                <div className="text-sm mt-0.5" style={{ color: colors.neutralTextLight }}>
                  {fitScore >= 75
                    ? 'Excellent match, strong alignment'
                    : fitScore >= 50
                      ? 'Good match, some gaps identified'
                      : 'Limited match, significant gaps identified'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="bg-white p-3 rounded border"
                style={{ borderColor: colors.neutralBorder }}
              >
                <div className="mb-2">
                  <div className="text-sm font-normal" style={{ color: colors.dark }}>
                    Skills Match
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: colors.neutralTextLight }}>
                    {(draft.skills || []).length} of 2 required skills match
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: colors.neutralBorder }}
                  >
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `${Math.min(((draft.skills || []).length / 2) * 100, 100)}%`,
                        background: '#0369a1',
                      }}
                    />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#dc2626', minWidth: 35 }}>
                    {Math.min(((draft.skills || []).length / 2) * 100, 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div
                className="bg-white p-3 rounded border"
                style={{ borderColor: colors.neutralBorder }}
              >
                <div className="mb-2">
                  <div className="text-sm font-normal" style={{ color: colors.dark }}>
                    Competencies Match
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: colors.neutralTextLight }}>
                    {(draft.competencies || []).length} of 3 key competencies match
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: colors.neutralBorder }}
                  >
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `${Math.min(((draft.competencies || []).length / 3) * 100, 100)}%`,
                        background: '#0369a1',
                      }}
                    />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#dc2626', minWidth: 35 }}>
                    {Math.min(((draft.competencies || []).length / 3) * 100, 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div
                className="bg-white p-3 rounded border"
                style={{ borderColor: colors.neutralBorder }}
              >
                <div className="mb-2">
                  <div className="text-sm font-normal" style={{ color: colors.dark }}>
                    Experience Level
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: colors.neutralTextLight }}>
                    Average skill level: 1.0/4
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: colors.neutralBorder }}
                  >
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: '25%',
                        background: '#dc2626',
                      }}
                    />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#dc2626', minWidth: 35 }}>
                    25%
                  </div>
                </div>
              </div>

              <div
                className="bg-white p-3 rounded border"
                style={{ borderColor: colors.neutralBorder }}
              >
                <div className="mb-2">
                  <div className="text-sm font-normal" style={{ color: colors.dark }}>
                    Career Stage Fit
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: colors.neutralTextLight }}>
                    Management/operations alignment
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: colors.neutralBorder }}
                  >
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: '90%',
                        background: '#16a34a',
                      }}
                    />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#16a34a', minWidth: 35 }}>
                    90%
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          className="flex items-center justify-end gap-3 px-6 py-4 bg-white border-t"
          style={{ borderColor: colors.neutralBorder }}
        >
          <button
            onClick={() => {
              setDraft(null);
              onClose?.();
            }}
            className="px-4 py-2 rounded border text-sm font-medium transition-colors"
            style={{ borderColor: colors.neutralBorder, color: colors.dark }}
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
            style={{ background: colors.primaryBlue }}
            type="button"
          >
            Save Changes
          </button>
        </div>
      </div>

      {taskModalOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={() => {
              setTaskModalOpen(false);
              setTaskEditing(null);
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60" />
            <div
              className="relative z-10 w-full max-w-md rounded-lg bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.dark }}>
                {taskEditing ? 'Edit Application Task' : 'Add Application Task'}
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: colors.dark }}>
                  Task Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Follow up with hiring manager"
                  value={taskForm.text}
                  onChange={(e) => setTaskForm((s) => ({ ...s, text: e.target.value }))}
                  className="w-full px-3 py-2 border rounded text-sm"
                  style={{ borderColor: colors.neutralBorder }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: colors.dark }}
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate || ''}
                    onChange={(e) => setTaskForm((s) => ({ ...s, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded text-sm"
                    style={{ borderColor: colors.neutralBorder }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: colors.dark }}
                  >
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((s) => ({ ...s, priority: e.target.value }))}
                    className="w-full px-3 py-2 border rounded text-sm"
                    style={{ borderColor: colors.neutralBorder }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setTaskModalOpen(false);
                    setTaskEditing(null);
                  }}
                  className="px-4 py-2 border rounded text-sm font-medium"
                  style={{ borderColor: colors.neutralBorder, color: colors.dark }}
                >
                  Cancel
                </button>

                <button
                  onClick={saveTaskFromModal}
                  className="px-4 py-2 rounded text-sm font-medium text-white"
                  style={{ background: colors.primaryBlue }}
                >
                  {taskEditing ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showSetDeadlines &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            onClick={() => setShowSetDeadlines(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60" />
            <div
              className="relative z-10 w-full max-w-md rounded-lg bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.dark }}>
                Set Application Deadlines
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.neutralTextLight }}>
                Automatically set due dates for all tasks based on a target application date.
              </p>
              <div>
                <label className="text-sm font-semibold block mb-2" style={{ color: colors.dark }}>
                  Target Application Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  style={{ borderColor: colors.neutralBorder }}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowSetDeadlines(false)}
                  className="px-4 py-2 rounded border text-sm font-medium"
                  style={{ borderColor: colors.neutralBorder, color: colors.dark }}
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleAllToTarget}
                  className="px-4 py-2 rounded text-white text-sm font-medium flex items-center gap-2"
                  style={{ background: '#16a34a' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Set Deadlines
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {deleteTargetId !== null && (
        <DeleteModal
          isOpen={!!deleteTargetId}
          title="Task"
          onClose={() => setDeleteTargetId(null)}
          onConfirm={performDeleteTodo}
          loading={deletingTodo}
        />
      )}

      {showGenerateModal &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[10003] flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60" />
            <div
              className="relative z-10 w-full max-w-md rounded-lg bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.dark }}>
                Generate Application Material
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.neutralTextLight }}>
                Create a customized document for <strong>{draft.title}</strong> at{' '}
                <strong>{draft.company}</strong>
              </p>

              <div>
                <label className="text-sm font-semibold block mb-2" style={{ color: colors.dark }}>
                  Material Type
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  style={{ borderColor: colors.neutralBorder }}
                >
                  <option value="resume">Resume</option>
                  <option value="cover-letter">Cover Letter</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded border text-sm font-medium"
                  style={{ borderColor: colors.neutralBorder, color: colors.dark }}
                >
                  Cancel
                </button>
                <button
                  onClick={generateMaterial}
                  className="px-4 py-2 rounded text-white text-sm font-medium flex items-center gap-2"
                  style={{ background: colors.primaryBlue }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showViewModal &&
        viewMaterial &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[10004] flex items-center justify-center p-4"
            onClick={() => {
              setShowViewModal(false);
              setViewMaterial(null);
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-70" />
            <div
              className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: colors.neutralBorder }}
              >
                <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>
                  {viewMaterial.title}
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewMaterial(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none transition-colors"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: colors.neutralText,
                  }}
                >
                  {viewMaterial.content || 'No content available.'}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {elementModalOpen && (
        <ModalComponent
          isOpen={elementModalOpen}
          onClose={() => {
            setElementModalOpen(false);
            setElementValue('');
            setElementEditIndex(null);
            setElementType(null);
          }}
          title={
            elementEditIndex != null
              ? `Edit ${elementType === 'skill' ? 'Skill' : 'Competency'}`
              : `Add ${elementType === 'skill' ? 'Skill' : 'Competency'}`
          }
          showBottomButton={false}
          disabled={!elementValue?.trim()}
          onSubmit={handleElementModalSubmit}
          submitText={elementEditIndex != null ? 'Save' : 'Add'}
          cancelText="Cancel"
          isEdit={elementEditIndex != null}
        >
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2">
              {elementType === 'skill' ? 'Skill' : 'Competency'}
            </label>
            <input
              type="text"
              value={elementValue}
              onChange={(e) => setElementValue(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder={
                elementType === 'skill' ? 'e.g., React, SQL' : 'e.g., Cross-functional leadership'
              }
            />
          </div>
        </ModalComponent>
      )}

      {deleteMaterialId != null && (
        <DeleteModal
          isOpen={!!deleteMaterialId}
          title="Resume"
          onClose={() => setDeleteMaterialId(null)}
          onConfirm={confirmDeleteMaterial}
          loading={deletingMaterial}
        />
      )}
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

function InfoRow({ label, value, colors }) {
  return (
    <div>
      <div className="text-xs mb-1" style={{ color: colors.neutralTextLight }}>
        {label}
      </div>
      <div className="text-sm" style={{ color: colors.dark }}>
        {value}
      </div>
    </div>
  );
}

function calculateFitScore(jobObj) {
  const skillCount = (jobObj.skills || []).length;
  const compCount = (jobObj.competencies || []).length;
  const skillScore = Math.min(skillCount * 15, 60);
  const compScore = Math.min(compCount * 10, 30);
  let statusBonus = 0;
  if (jobObj.status === 'applied') statusBonus = 5;
  if (jobObj.status === 'interviewing') statusBonus = 10;
  if (jobObj.status === 'offer') statusBonus = 15;
  return Math.min(100, Math.round(skillScore + compScore + statusBonus || 0));
}

function generateDefaultTodos(job) {
  const baseDate = new Date();
  const addDays = (days) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      text: 'Tailor resume for this specific role',
      priority: 'high',
      dueDate: addDays(-6),
      completed: true,
    },
    {
      text: 'Write personalized cover letter',
      priority: 'high',
      dueDate: addDays(-5),
      completed: true,
    },
    {
      text: 'Connect with employees on LinkedIn',
      priority: 'low',
      dueDate: addDays(-4),
      completed: true,
    },
    {
      text: 'Review job description and requirements thoroughly',
      priority: 'low',
      dueDate: addDays(0),
      completed: true,
    },
    {
      text: 'Research interview questions for this role',
      priority: 'medium',
      dueDate: addDays(3),
      completed: true,
    },
    {
      text: 'Prepare behavioral interview stories',
      priority: 'medium',
      dueDate: addDays(3),
      completed: true,
    },
    {
      text: 'Submit application through company website',
      priority: 'high',
      dueDate: addDays(4),
      completed: true,
    },
    {
      text: 'Follow up on application status',
      priority: 'medium',
      dueDate: addDays(12),
      completed: false,
    },
  ];
}

function formatDueDate(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 3) {
    return `Due in ${diffDays} days`;
  } else {
    return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
}
