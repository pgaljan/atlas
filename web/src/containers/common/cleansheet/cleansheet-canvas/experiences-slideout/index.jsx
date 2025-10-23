import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import cogoToast from '@successtar/cogo-toast';
import { FaPencilAlt, FaTrash, FaCaretDown } from 'react-icons/fa';
import { PiLinkedinLogoFill, PiFileArrowUpFill, PiPlusCircleFill } from 'react-icons/pi';
import {
  fetchCleansheetProfile,
  upsertCleansheetProfile,
  updateCleansheetProfile,
  importCleansheetProfile,
} from '../../../../../redux/slices/cleansheet';
import DeleteModal from '../../../../../components/modals/DeleteModal';
import ExperienceModal from '../../cleansheet-experience-trigger/experience-modal';
import LoadingSpinner from '../../../../../components/loader/LoadingSpinner';
import ConfirmModal from '../../../../../components/modals/ConfirmModal';

export default function ExperienceSlideout({
  open,
  onClose,
  personaKey = 'chemist',
  exampleExperiences = {},
  userId: userIdProp = null,
}) {
  const ACCENT = '#004C99';
  const PRIMARY = '#0066CC';
  const CORE_BG = '#e3f2fd';
  const CORE_COLOR = '#1976d2';
  const PERI_BG = '#f3e5f5';
  const PERI_COLOR = '#7b1fa2';
  const NEUTRAL_BG = '#f5f5f7';
  const NEUTRAL_BORDER = '#e5e5e7';
  const DARK = '#1a1a1a';

  const dispatch = useDispatch();
  const profile = useSelector((s) => s.cleansheet.profile);
  const status = useSelector((s) => s.cleansheet.status);
  const error = useSelector((s) => s.cleansheet.error);

  const cookieUserId = Cookies.get('atlas_userId');
  const userId = userIdProp || cookieUserId;

  const [userExperiences, setUserExperiences] = useState([]);
  const personaExamples = exampleExperiences[personaKey] || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState({ isOpen: false, index: null, title: '' });
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingImportJson, setPendingImportJson] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.warn('ExperienceSlideout: no userId available to fetch profile');
      return;
    }
    if (!profile || profile.userId !== userId) {
      dispatch(fetchCleansheetProfile(userId));
    }
  }, [dispatch, userId, profile]);

  useEffect(() => {
    const exps = profile && Array.isArray(profile.experiences) ? profile.experiences : [];
    setUserExperiences(exps);
  }, [profile]);

  const allExperiences = useMemo(() => {
    const markedExamples = personaExamples.map((e) => ({ ...e, isExample: true }));
    const userMarked = (userExperiences || []).map((e) => ({ ...e, isExample: false }));
    return [...userMarked, ...markedExamples];
  }, [personaExamples, userExperiences]);

  const sortedExperiences = useMemo(() => {
    return [...allExperiences].sort((a, b) => {
      const aKey = a.startDate || '0000-00';
      const bKey = b.startDate || '0000-00';
      return bKey.localeCompare(aKey);
    });
  }, [allExperiences]);

  useEffect(() => {
    if (open) {
      const el = document.getElementById('experienceSlideoutScroll');
      if (el) el.scrollTop = 0;
    }
  }, [open]);

  const formatDate = (iso) => {
    if (!iso) return 'Present';
    try {
      const parts = String(iso).split('-');
      const year = parts[0];
      const month = parts[1] || '01';
      const dt = new Date(`${year}-${month}-01T00:00:00`);
      return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const openAddModal = () => {
    setModalInitial(null);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (exp, idx) => {
    const userIndex = userExperiences.findIndex(
      (ue) =>
        ue.organizationName === exp.organizationName &&
        ue.role === exp.role &&
        (ue.startDate || '') === (exp.startDate || ''),
    );
    if (userIndex === -1) {
      cogoToast.warn('Example experience cannot be edited');
      return;
    }
    setModalInitial(userExperiences[userIndex]);
    setEditingIndex(userIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalInitial(null);
    setEditingIndex(null);
  };

  const handleSave = async (form) => {
    if (!userId) {
      cogoToast.error('No user id available');
      return;
    }

    setSaving(true);

    try {
      const next = [...(userExperiences || [])];

      if (editingIndex !== null && editingIndex >= 0) {
        next[editingIndex] = { ...form };
      } else {
        next.unshift({ ...form });
      }

      if (profile && profile.userId === userId) {
        await dispatch(updateCleansheetProfile({ userId, dto: { experiences: next } })).unwrap();
      } else {
        const dto = {
          userId,
          userName: profile?.userName ?? '',
          userGoals: profile?.userGoals ?? '',
          experiences: next,
          exportDate: profile?.exportDate ?? new Date().toISOString(),
          version: profile?.version ?? '1.0',
        };
        await dispatch(upsertCleansheetProfile({ dto, userId })).unwrap();
      }

      setUserExperiences(next);
      cogoToast.success(editingIndex !== null ? 'Experience updated' : 'Experience added');
      closeModal();
    } catch (err) {
      cogoToast.error(typeof err === 'string' ? err : 'Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (exp) => {
    const userIndex = userExperiences.findIndex(
      (ue) =>
        ue.organizationName === exp.organizationName &&
        ue.role === exp.role &&
        (ue.startDate || '') === (exp.startDate || ''),
    );
    if (userIndex === -1) {
      cogoToast.warn('Example experience cannot be deleted');
      return;
    }
    setDeleteTarget({
      isOpen: true,
      index: userIndex,
      title: `${exp.role} — ${exp.organizationName}`,
      loading: false,
    });
  };

  const handleDeleteCancel = () => {
    setDeleteTarget({ isOpen: false, index: null, title: '' });
  };

  const handleDeleteConfirm = async () => {
    const idx = deleteTarget.index;
    if (idx === null || idx === undefined || !userId) {
      handleDeleteCancel();
      return;
    }

    const next = [...(userExperiences || [])];
    const removed = next.splice(idx, 1);
    setDeleteTarget((d) => ({ ...d, loading: true }));

    try {
      if (profile && profile.userId === userId) {
        await dispatch(updateCleansheetProfile({ userId, dto: { experiences: next } })).unwrap();
      } else {
        const dto = {
          userId,
          userName: profile?.userName ?? '',
          userGoals: profile?.userGoals ?? '',
          experiences: next,
          exportDate: profile?.exportDate ?? new Date().toISOString(),
          version: profile?.version ?? '1.0',
        };
        await dispatch(upsertCleansheetProfile({ dto, userId })).unwrap();
      }

      setUserExperiences(next);
      cogoToast.success('Experience deleted');
    } catch (err) {
      setUserExperiences((prev) => {
        const copy = [...prev];
        copy.splice(idx, 0, removed[0]);
        return copy;
      });
      cogoToast.error('Failed to delete experience');
    } finally {
      setDeleteTarget({ isOpen: false, index: null, title: '', loading: false });
    }
  };

  const validateProfileJson = (json) => {
    const requiredFields = ['userName', 'userGoals', 'experiences', 'exportDate', 'version'];
    const missing = requiredFields.filter((f) => !(f in (json || {})));
    if (missing.length > 0) {
      return { ok: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    if (!Array.isArray(json.experiences)) {
      return { ok: false, error: 'experiences must be an array' };
    }
    const exportDate = new Date(json.exportDate);
    if (Number.isNaN(exportDate.getTime())) {
      return { ok: false, error: 'exportDate is not a valid date' };
    }
    return { ok: true };
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = null;
    await handleJsonFileUpload(file);
  };

  const handleJsonFileUpload = async (file) => {
    if (!userId) {
      cogoToast.error('No user id available for import');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      cogoToast.error('Please upload a valid .json file');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        cogoToast.error('Invalid JSON format — could not parse file');
        setUploading(false);
        return;
      }

      const valid = validateProfileJson(parsed);
      if (!valid.ok) {
        cogoToast.error(`Invalid profile JSON: ${valid.error}`);
        setUploading(false);
        return;
      }

      // if (profile && profile.userId === userId) {
      //   setPendingImportJson(parsed);
      //   setUploading(false);
      //   setConfirmOpen(true);
      //   return;
      // }

      const payload = await dispatch(importCleansheetProfile({ json: parsed, userId })).unwrap();

      const newExperiences = payload?.experiences ?? payload?.profile?.experiences ?? [];
      setUserExperiences(Array.isArray(newExperiences) ? newExperiences : []);

      cogoToast.success('Resume JSON uploaded and imported successfully');
    } catch (err) {
      const message =
        typeof err === 'string' ? err : (err?.message ?? 'Failed to import resume JSON');
      cogoToast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const triggerFilePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleConfirmImport = async () => {
    if (!userId || !pendingImportJson) {
      setConfirmOpen(false);
      setPendingImportJson(null);
      return;
    }

    setConfirmLoading(true);
    setUploading(true);

    try {
      const payload = await dispatch(
        importCleansheetProfile({ json: pendingImportJson, userId }),
      ).unwrap();

      const newExperiences = payload?.experiences ?? payload?.profile?.experiences ?? [];
      setUserExperiences(Array.isArray(newExperiences) ? newExperiences : []);

      cogoToast.success('Existing profile replaced with uploaded resume JSON');
      setConfirmOpen(false);
      setPendingImportJson(null);
    } catch (err) {
      const message =
        typeof err === 'string' ? err : (err?.message ?? 'Failed to import resume JSON');
      cogoToast.error(message);
    } finally {
      setConfirmLoading(false);
      setUploading(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setPendingImportJson(null);
    setConfirmLoading(false);
    setUploading(false);
  };

  const showFullScreenLoader = status === 'loading' && !profile;

  return (
    <div id="experienceSlideoutScroll" className="flex flex-col h-full min-h-0" aria-hidden={!open}>
      {showFullScreenLoader && (
        <LoadingSpinner
          mode="fullscreen"
          message="Loading cleansheet profile..."
          wrapperClassName=""
          minHeight=""
          messageClass="text-gray-700 text-sm"
        />
      )}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() =>
            cogoToast.info('LinkedIn connect — integration hook (implement separately)')
          }
          className="linkedin-connect-btn flex items-center gap-1.5 px-4 py-2.5 bg-[#0077B5] text-white rounded-md text-[12px] font-semibold transition-all duration-200 hover:bg-[#005E93] hover:shadow-[0_2px_8px_rgba(0,119,181,0.3)]"
        >
          <PiLinkedinLogoFill size={16} />
          <span>Connect LinkedIn</span>
        </button>

        <button
          onClick={triggerFilePicker}
          className="upload-resume-btn flex items-center gap-1.5 px-4 py-2.5 bg-[#004C99] text-white rounded-md text-[12px] font-semibold transition-all duration-200 hover:bg-[#1a1a1a] hover:shadow-[0_2px_8px_rgba(0,70,153,0.3)]"
          disabled={uploading}
          title="Upload resume JSON"
        >
          <PiFileArrowUpFill size={16} />
          <span>{uploading ? 'Uploading…' : 'Upload Resume (JSON)'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button
          onClick={openAddModal}
          className="add-story-btn flex items-center gap-1.5 px-4 py-2.5 bg-[#0066CC] text-white rounded-md text-[12px] font-semibold transition-all duration-200 hover:bg-[#004C99] hover:shadow-[0_2px_8px_rgba(0,102,204,0.3)]"
        >
          <PiPlusCircleFill size={16} />
          <span>Add Experience</span>
        </button>
      </div>

      <div
        className="overflow-y-auto flex-1 min-h-0 pb-8"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-0">
          {sortedExperiences.length === 0 ? (
            <div className="col-span-1 lg:col-span-2 text-center py-16 text-gray-500">
              <div className="text-4xl opacity-30 mb-4">💼</div>
              <div className="text-base">
                No career experiences yet. Click "Add Experience" to get started.
              </div>
            </div>
          ) : (
            sortedExperiences.map((exp, idx) => {
              const isExample = !!exp.isExample;
              const userIndex = userExperiences.findIndex(
                (ue) =>
                  ue.organizationName === exp.organizationName &&
                  ue.role === exp.role &&
                  (ue.startDate || '') === (exp.startDate || ''),
              );

              return (
                <article
                  key={`${exp.organizationName}-${exp.role}-${idx}`}
                  className={`relative bg-white border rounded-md p-5 shadow-sm transition-all duration-200 transform hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] flex flex-col h-full min-h-[120px] ${'border-l-4 border-blue-100 bg-blue-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-slate-800 truncate">
                              {exp.role}
                            </h4>

                            {isExample && (
                              <span className="text-xs inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                Example
                              </span>
                            )}
                          </div>

                          <div className="mt-2 text-sm">
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                              style={{ color: ACCENT }}
                              title={exp.organizationName}
                            >
                              {exp.organizationName}
                              <FaCaretDown className="ml-1 text-xs text-slate-400" aria-hidden />
                            </a>

                            {exp.location ? (
                              <span className="text-slate-400"> • {exp.location}</span>
                            ) : null}
                          </div>

                          {/* dates */}
                          <div className="text-xs text-slate-400 mt-2">
                            {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                          </div>
                        </div>

                        {!isExample && userIndex !== -1 && (
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => openEditModal(exp, userIndex)}
                              className="p-2 rounded-md hover:bg-gray-100 flex items-center justify-center"
                              aria-label="Edit experience"
                              title="Edit"
                            >
                              <FaPencilAlt className="w-4 h-4 text-slate-600" />
                            </button>

                            <button
                              onClick={() => handleDeleteClick(exp)}
                              className="p-2 rounded-md hover:bg-red-50 flex items-center justify-center"
                              aria-label="Delete experience"
                              title="Delete"
                            >
                              <FaTrash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>

                      {exp.description ? (
                        <p className="mt-4 text-sm text-slate-700 exp-description line-clamp-3">
                          {exp.description}
                        </p>
                      ) : (
                        <div className="mt-3" />
                      )}

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="mt-5">
                          <div className="text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wide">
                            Technologies
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, tIdx) => {
                              const name = tech?.name ?? tech;
                              const type = (tech?.type || '').toString().toLowerCase();

                              const chipBase =
                                'px-3 py-1 text-xs rounded-md border font-medium select-none';

                              if (type === 'core') {
                                return (
                                  <span
                                    key={tIdx}
                                    className={chipBase}
                                    style={{
                                      backgroundColor: CORE_BG,
                                      borderColor: CORE_COLOR,
                                      color: CORE_COLOR,
                                    }}
                                  >
                                    {name}
                                  </span>
                                );
                              }

                              if (type === 'peripheral' || type === 'peri') {
                                return (
                                  <span
                                    key={tIdx}
                                    className={chipBase}
                                    style={{
                                      backgroundColor: PERI_BG,
                                      borderColor: PERI_COLOR,
                                      color: PERI_COLOR,
                                    }}
                                  >
                                    {name}
                                  </span>
                                );
                              }

                              return (
                                <span
                                  key={tIdx}
                                  className={chipBase}
                                  style={{
                                    backgroundColor: NEUTRAL_BG,
                                    borderColor: NEUTRAL_BORDER,
                                    color: '#333333',
                                  }}
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Key Skills */}
                      {exp.keySkills && exp.keySkills.length > 0 && (
                        <div className="mt-5">
                          <div className="text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wide">
                            Key Skills
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {exp.keySkills.map((s, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-md border"
                                style={{
                                  backgroundColor: '#f8f8f9',
                                  borderColor: NEUTRAL_BORDER,
                                  color: '#4b5563',
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {exp.competencies && exp.competencies.length > 0 && (
                        <div className="mt-5">
                          <div className="text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wide">
                            Competencies
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {exp.competencies.map((c, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-md border"
                                style={{
                                  backgroundColor: '#f8f8f9',
                                  borderColor: NEUTRAL_BORDER,
                                  color: '#4b5563',
                                }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-5">
                          <div className="text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wide">
                            Achievements
                          </div>
                          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1 exp-list">
                            {exp.achievements.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
      <ExperienceModal
        isOpen={modalOpen}
        onClose={closeModal}
        initial={modalInitial}
        onSave={handleSave}
        loading={saving}
        submitText={editingIndex !== null ? 'Save changes' : 'Add experience'}
      />
      <DeleteModal
        isOpen={!!deleteTarget.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget.title}
        loading={deleteTarget.loading}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Replace existing profile?"
        message={
          profile && profile.userName
            ? `A cleansheet profile already exists for ${profile.userName}. Do you want to replace it with the uploaded JSON?`
            : 'A cleansheet profile already exists. Do you want to replace it with the uploaded JSON?'
        }
        confirmText="Replace profile"
        cancelText="Cancel"
        loading={confirmLoading}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
}
