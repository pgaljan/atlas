import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import InputField from '../../../../../../components/input-field/InputField';
import { FiChevronDown } from 'react-icons/fi';

const EXPERIENCES = [
  'Store Manager - Target #2847 (2019-Present)',
  'Asst Store Manager - Target #1923 (2016-2019)',
  'Dept Supervisor - Best Buy (2014-2016)',
  'Sales Associate - Best Buy (2012-2014)',
  'BA Business Admin - U of Minnesota (2012)',
];

export default function AddStoryModal({ isOpen, onClose, onSave, initial = {} }) {
  const [formData, setFormData] = useState({
    title: '',
    experience: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    competencies: '',
    ...initial,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, ...initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initial]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.situation || !formData.action) {
      // minimal required: title, situation, action (adjust as needed)
      alert('Please provide at least: Title, Situation, and Action.');
      return;
    }

    const normalized = {
      id: formData.id || Date.now(),
      title: String(formData.title).trim(),
      experience: String(formData.experience || '').trim(),
      situation: String(formData.situation || '').trim(),
      task: String(formData.task || '').trim(),
      action: String(formData.action || '').trim(),
      result: String(formData.result || '').trim(),
      competencies:
        typeof formData.competencies === 'string'
          ? formData.competencies
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
          : Array.isArray(formData.competencies)
            ? formData.competencies
            : [],
      createdAt: formData.createdAt || new Date().toISOString(),
      isExample: !!formData.isExample,
    };

    onSave?.(normalized);
    onClose?.();
  };

  if (!isOpen) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[512px] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1a1a1a]">
          <h3 className="text-sm font-semibold text-white">
            {initial?.id ? 'Edit Story' : 'Add Story'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white text-xl leading-none hover:opacity-80"
          >
            &times;
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 text-sm">
          <div className="space-y-3">
            {/* Title */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                Story Title / Competency <span className="text-red-500">*</span>
              </label>
              <InputField
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Short descriptive title (e.g., Handling a staffing crisis)"
                className="w-full py-2 px-2 border-2 border-[#e5e5e7] rounded-sm text-sm focus:outline-none focus:border-[#0066CC]"
              />
            </div>

            {/* Related Job Experience (select) */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                Related Job Experience
              </label>

              <div className="relative">
                <select
                  value={formData.experience || ''}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  aria-label="Related Job Experience"
                  className="w-full appearance-none py-2 px-2 pr-9 border-2 border-[#e5e5e7] rounded-sm text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] bg-white"
                >
                  <option value="">Select an experience...</option>

                  {EXPERIENCES.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}

                  {initial?.experience &&
                    initial.experience.length > 0 &&
                    !EXPERIENCES.includes(initial.experience) && (
                      <option value={initial.experience}>{initial.experience}</option>
                    )}
                </select>

                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <FiChevronDown />
                </span>
              </div>
            </div>

            {/* Situation */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                Situation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.situation}
                onChange={(e) => handleChange('situation', e.target.value)}
                rows={3}
                placeholder="Describe the situation..."
                className="w-full border-2 border-[#e5e5e7] rounded-sm px-2 py-2 text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] resize-none"
              />
            </div>

            {/* Task */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Task</label>
              <textarea
                value={formData.task}
                onChange={(e) => handleChange('task', e.target.value)}
                rows={2}
                placeholder="What was your task?"
                className="w-full border-2 border-[#e5e5e7] rounded-sm px-2 py-2 text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] resize-none"
              />
            </div>

            {/* Action */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                Action <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.action}
                onChange={(e) => handleChange('action', e.target.value)}
                rows={3}
                placeholder="What did you do?"
                className="w-full border-2 border-[#e5e5e7] rounded-sm px-2 py-2 text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] resize-none"
              />
            </div>

            {/* Result */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Result</label>
              <textarea
                value={formData.result}
                onChange={(e) => handleChange('result', e.target.value)}
                rows={2}
                placeholder="What was the outcome?"
                className="w-full border-2 border-[#e5e5e7] rounded-sm px-2 py-2 text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] resize-none"
              />
            </div>

            {/* Competencies */}
            <div className="">
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                Key Competencies Demonstrated
              </label>
              <InputField
                value={formData.competencies}
                onChange={(e) => handleChange('competencies', e.target.value)}
                placeholder="e.g., Leadership, Crisis Management"
                className="w-full py-2 px-2 border-2 border-[#e5e5e7] rounded-sm text-sm focus:outline-none focus:border-[#0066CC]"
              />
              <div className="text-[11px] text-[#6b7280] mt-1">Comma-separated list</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e7ee] mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold border border-[#e5e5e7] bg-[#f5f5f7] text-[#333333] hover:bg-[#eaeaea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-xs font-semibold bg-[#0066CC] text-white hover:bg-[#004C99]"
            >
              {initial?.id ? 'Save Changes' : 'Add Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
