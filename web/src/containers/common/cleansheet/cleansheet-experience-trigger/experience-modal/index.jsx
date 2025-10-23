import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TagInput from '../tag-input';
import { normalizeTechs } from '../../../../../utils/cleansheet-utils';

const defaultPosition = () => ({
  organizationName: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  coreTechnologies: [],
  peripheralTechnologies: [],
  keySkills: [],
  achievements: [],
  competencies: [],
  projectTypes: [],
  internalStakeholders: [],
  externalStakeholders: [],
});

const ExperienceModal = ({
  isOpen,
  onClose,
  initial = null,
  onSave,
  loading = false,
  submitText = 'Save Experience',
}) => {
  const [form, setForm] = useState(defaultPosition());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      const techs = normalizeTechs(initial);
      const core = techs.filter((t) => (t.type || '').toLowerCase() === 'core').map((t) => t.name);
      const peripheral = techs
        .filter((t) => (t.type || '').toLowerCase() === 'peripheral')
        .map((t) => t.name);

      setForm({
        ...defaultPosition(),
        ...initial,
        coreTechnologies: initial.coreTechnologies ?? core,
        peripheralTechnologies: initial.peripheralTechnologies ?? peripheral,
      });
    } else setForm(defaultPosition());
    setErrors({});
  }, [initial, isOpen]);

  const setField = useCallback(
    (field, value) => {
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
    },
    [errors],
  );

  const validate = () => {
    const newErrors = {};
    if (!form.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!form.role.trim()) newErrors.role = 'Role is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const mergedTechnologies = [
      ...(form.coreTechnologies || []).map((name) => ({ name, type: 'Core' })),
      ...(form.peripheralTechnologies || []).map((name) => ({ name, type: 'Peripheral' })),
    ];
    const payload = {
      ...form,
      technologies: mergedTechnologies,
      coreTechnologies: form.coreTechnologies || [],
      peripheralTechnologies: form.peripheralTechnologies || [],
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {initial ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.organizationName}
                onChange={(e) => setField('organizationName', e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                  errors.organizationName
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Company name"
              />
              {errors.organizationName && (
                <p className="text-xs text-red-500 mt-1">{errors.organizationName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                value={form.role}
                onChange={(e) => setField('role', e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                  errors.role
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Role (e.g. Frontend Developer)"
              />
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="City, State or Remote"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                  errors.startDate
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date (leave blank if current)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
              placeholder="Describe your role, responsibilities, and achievements"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Core Technologies
              </label>
              <TagInput
                value={form.coreTechnologies}
                onChange={(next) => setField('coreTechnologies', next)}
                chipColor="core"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peripheral Technologies
              </label>
              <TagInput
                value={form.peripheralTechnologies}
                onChange={(next) => setField('peripheralTechnologies', next)}
                chipColor="peripheral"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Skills</label>
              <TagInput
                value={form.keySkills}
                onChange={(next) => setField('keySkills', next)}
                chipColor="skill"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Competencies</label>
              <TagInput
                value={form.competencies}
                onChange={(next) => setField('competencies', next)}
                chipColor="competency"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Types</label>
              <TagInput
                value={form.projectTypes}
                onChange={(next) => setField('projectTypes', next)}
                chipColor="project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
              <TagInput
                value={form.achievements}
                onChange={(next) => setField('achievements', next)}
                chipColor="achievement"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Stakeholders
              </label>
              <TagInput
                value={form.internalStakeholders}
                onChange={(next) => setField('internalStakeholders', next)}
                chipColor="gray"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                External Stakeholders
              </label>
              <TagInput
                value={form.externalStakeholders}
                onChange={(next) => setField('externalStakeholders', next)}
                chipColor="gray"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : submitText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
};

export default ExperienceModal;
