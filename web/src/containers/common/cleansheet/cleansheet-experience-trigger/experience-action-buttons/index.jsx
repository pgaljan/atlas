import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  upsertCleansheetProfile,
  importCleansheetProfile,
  exportCleansheetProfile,
  deleteCleansheetProfile,
  resetCleansheetState,
  fetchCleansheetProfile,
} from '../../../../../redux/slices/cleansheet';
import Cookies from 'js-cookie';
import ExampleProfiles from '../experience-example-profile';
import { FaPlus, FaUpload, FaDownload, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../../../../../components/modals/ConfirmModal';
import cogoToast from '@successtar/cogo-toast';

const ActionBar = ({ onAddExperience, userId: userIdProp }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const profile = useSelector((s) => s.cleansheet.profile);
  const cookieUserId = Cookies.get('atlas_userId');
  const resolvedUserId = userIdProp ?? cookieUserId ?? profile?.userId;

  const [userName, setUserName] = useState(profile?.userName ?? '');
  const [userGoals, setUserGoals] = useState(profile?.userGoals ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    setUserName(profile?.userName ?? '');
    setUserGoals(profile?.userGoals ?? '');
  }, [profile?.userName, profile?.userGoals]);

  const ensureProfileSaved = async () => {
    setIsSaving(true);
    try {
      const dto = {
        userName: (userName ?? '').trim(),
        userGoals: (userGoals ?? '').trim(),

        experiences: profile?.experiences ?? [],
        exportDate: new Date().toISOString(),
        version: profile?.version ?? '1.0.0',
      };

      await dispatch(upsertCleansheetProfile({ dto })).unwrap();

      const resolved = resolvedUserId ?? profile?.userId;
      if (resolved) {
        await dispatch(fetchCleansheetProfile(resolved))
          .unwrap()
          .catch(() => {});
      }
    } catch (err) {
      cogoToast.error('Failed to auto-save profile. Export may use older values.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperienceClicked = async () => {
    await ensureProfileSaved();
    onAddExperience?.();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await dispatch(importCleansheetProfile({ file, userId: resolvedUserId })).unwrap();
      cogoToast.success('Imported Profile Successfully!');
    } catch (err) {
      cogoToast.error('Import failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onExport = async () => {
    await ensureProfileSaved();

    const resolved = resolvedUserId ?? profile?.userId;
    if (!resolved) {
      cogoToast.warn('No profile to export');
      return;
    }

    try {
      setIsSaving(true);
      const result = await dispatch(
        exportCleansheetProfile({ userId: resolved, download: true }),
      ).unwrap();

      if (result?.filename && result?.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        cogoToast.success('Export started');
      } else {
        cogoToast.warn('Nothing to export');
      }
    } catch (err) {
      cogoToast.error('Export failed');
    } finally {
      setIsSaving(false);
    }
  };

  const onClearAll = () => {
    setConfirmClearOpen(true);
  };

  const handleClearCancel = () => {
    setConfirmClearOpen(false);
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      const resolved = resolvedUserId ?? profile?.userId;
      if (resolved) {
        await dispatch(deleteCleansheetProfile(resolved)).unwrap();
        dispatch(resetCleansheetState());
        setUserName('');
        setUserGoals('');
        cogoToast.success('Profile cleared.');
      } else {
        cogoToast.warn('No profile to delete.');
      }
      setConfirmClearOpen(false);
    } catch (err) {
      cogoToast.error(err?.message || 'Failed to delete profile');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-wrap gap-3 items-center justify-start">
        <input
          className="border border-gray-300 focus:border-blue-500 rounded-md px-3 py-2 min-w-[180px] flex-1 text-sm"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          className="border border-gray-300 focus:border-blue-500 rounded-md px-3 py-2 min-w-[180px] flex-1 text-sm"
          placeholder="Career Goals"
          value={userGoals}
          onChange={(e) => setUserGoals(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddExperienceClicked}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition-all"
          >
            <FaPlus className="text-base" /> Add Experience
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 border border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            <FaUpload className="text-base" /> Import JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            className="hidden"
            onChange={onFileChange}
          />

          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition-all"
          >
            <FaDownload className="text-base" /> Export JSON
          </button>

          <button
            onClick={onClearAll}
            disabled={isClearing}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition-all"
          >
            <FaTrash className="text-base" /> Clear All
          </button>
        </div>
      </div>

      <div className="mt-3">
        <ExampleProfiles userId={resolvedUserId} />
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear profile and experiences"
        message="This will delete the profile on the server (if you have permissions) and clear all experiences. Are you sure?"
        confirmText="Yes, clear all"
        cancelText="Cancel"
        loading={isClearing}
        onClose={handleClearCancel}
        onConfirm={handleClearConfirm}
      />
    </div>
  );
};

export default ActionBar;
