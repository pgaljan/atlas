import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cogoToast from '@successtar/cogo-toast';

import { upsertCleansheetProfile } from '../../../../../redux/slices/cleansheet';
import ExperienceModal from '../experience-modal';
import ExperienceCard from '../cleansheet-experience-card';
import DeleteModal from '../../../../../components/modals/DeleteModal';

const ExperienceList = ({ forceOpenAdd = false }) => {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.cleansheet.profile);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalInitial, setModalInitial] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({
    isOpen: false,
    index: null,
    title: '',
    loading: false,
  });

  const experiences = profile?.experiences || [];

  const openAdd = () => {
    setEditingIndex(null);
    setModalInitial(null);
    setModalOpen(true);
  };

  useEffect(() => {
    if (forceOpenAdd) {
      openAdd();
    }
  }, [forceOpenAdd]);

  const openEdit = (index) => {
    setEditingIndex(index);
    setModalInitial(experiences[index]);
    setModalOpen(true);
  };

  const openDelete = (index) => {
    const title = experiences?.[index]?.role || 'this experience';
    setDeleteTarget({ isOpen: true, index, title, loading: false });
  };

  const handleDeleteCancel = () => {
    setDeleteTarget({ isOpen: false, index: null, title: '', loading: false });
  };

  const handleDeleteConfirm = async () => {
    const idx = deleteTarget.index;
    if (idx == null) {
      handleDeleteCancel();
      return;
    }

    setDeleteTarget((t) => ({ ...t, loading: true }));

    const next = [...experiences];
    next.splice(idx, 1);

    try {
      await dispatch(
        upsertCleansheetProfile({
          dto: {
            userName: profile?.userName ?? '',
            userGoals: profile?.userGoals ?? '',
            experiences: next,
            exportDate: new Date().toISOString(),
            version: profile?.version ?? '1.0.0',
          },
        }),
      ).unwrap();

      cogoToast.success('Experience deleted.');
      setDeleteTarget({ isOpen: false, index: null, title: '', loading: false });
    } catch (err) {
      cogoToast.error('Failed to delete experience.');
      setDeleteTarget((t) => ({ ...t, loading: false }));
    }
  };

  const handleSaveExperience = async (exp) => {
    setIsSaving(true);
    try {
      const next = [...experiences];
      if (editingIndex === null) {
        next.push(exp);
      } else {
        next[editingIndex] = exp;
      }

      const dto = {
        userName: profile?.userName ?? '',
        userGoals: profile?.userGoals ?? '',
        experiences: next,
        exportDate: new Date().toISOString(),
        version: profile?.version ?? '1.0.0',
      };

      await dispatch(upsertCleansheetProfile({ dto })).unwrap();
      setModalOpen(false);
    } catch (err) {
      cogoToast.error('Failed to save experience!');
    } finally {
      setIsSaving(false);
    }
  };

  if (!experiences.length) {
    return (
      <div>
        <div className="flex items-center justify-center h-[430px] bg-white rounded-2xl shadow-sm">
          <div className="text-center">
            <i className="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
            <h3 className="font-semibold mb-1" style={{ color: '#666666', fontSize: '28px' }}>
              No experiences yet
            </h3>
            <p className="text-gray-500 text-sm">Add your first experience or import from JSON</p>
          </div>
        </div>

        <ExperienceModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveExperience}
          loading={isSaving}
        />

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiences.map((exp, i) => (
          <ExperienceCard
            key={(exp.role || 'exp') + i}
            exp={exp}
            index={i}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        ))}
      </div>

      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initial={modalInitial}
        onSave={handleSaveExperience}
        loading={isSaving}
        submitText={editingIndex === null ? 'Save Experience' : 'Update Experience'}
      />

      <DeleteModal
        isOpen={deleteTarget.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget.title}
        loading={deleteTarget.loading}
      />
    </div>
  );
};

export default ExperienceList;
