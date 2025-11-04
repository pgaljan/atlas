import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import InputField from '../../../../../../components/input-field/InputField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiChevronDown, FiCalendar } from 'react-icons/fi';

export default function AddJobModal({ isOpen, onClose, onSave, initial = {} }) {
  const datePickerRef = useRef(null);

  const [formData, setFormData] = useState({
    url: '',
    title: '',
    company: '',
    location: '',
    salary: '',
    status: 'Interested',
    closeDate: null,
    notes: '',
    ...initial,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, ...initial }));
    }
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

  const normalizeStatus = (raw) => {
    if (!raw) return 'interested';
    return String(raw).toLowerCase().trim().replace(/\s+/g, '-');
  };

  const normalizeCloseDate = (val) => {
    if (!val) return '';
    if (val instanceof Date && !Number.isNaN(val.getTime())) {
      return val.toISOString().split('T')[0];
    }
    try {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch (e) {}
    return String(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.location || !formData.salary) {
      alert('Please fill required fields: Title, Company, Location, Salary.');
      return;
    }

    const newJob = {
      id: Date.now(),
      title: formData.title,
      company: formData.company,
      location: formData.location,
      salary: formData.salary,
      url: formData.url || '',
      status: normalizeStatus(formData.status),
      closeDate: normalizeCloseDate(formData.closeDate),
      notes: formData.notes || '',
      skills: formData.skills || [],
      competencies: formData.competencies || [],
      materials: formData.materials || [],
      todos: formData.todos || [],
      createdAt: new Date().toISOString(),
      ...initial,
    };

    onSave?.(newJob);

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

      <div
        className="relative z-10 w-full max-w-[460px] bg-white rounded-lg shadow-xl overflow-hidden"
        style={{
          transform: 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3 bg-[#1a1a1a]">
          <h3 className="text-sm font-semibold text-white">Add Job Opportunity</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white text-xl leading-none hover:opacity-80"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 text-sm">
          <div className="mb-3">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">
              Job URL <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <InputField
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full !py-1.5 !px-2 border-2 border-[#e5e5e7] rounded-md text-sm focus:border-[#0066CC]"
            />
          </div>

          <div className="mb-3">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <InputField
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Product Manager"
              className="w-full !py-1.5 !px-2 border-2 border-[#e5e5e7] rounded-md text-sm focus:border-[#0066CC]"
            />
          </div>

          <div className="mb-3">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <InputField
              required
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="e.g., Google"
              className="w-full !py-1.5 !px-2 border-2 border-[#e5e5e7] rounded-md text-sm focus:border-[#0066CC]"
            />
          </div>

          <div className="mb-3">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <InputField
              required
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Remote or New York, USA"
              className="w-full !py-1.5 !px-2 border-2 border-[#e5e5e7] rounded-md text-sm focus:border-[#0066CC]"
            />
          </div>

          <div className="mb-3">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">
              Salary <span className="text-red-500">*</span>
            </label>
            <InputField
              required
              value={formData.salary}
              onChange={(e) => handleChange('salary', e.target.value)}
              placeholder="e.g., $120,000"
              className="w-full !py-1.5 !px-2 border-2 border-[#e5e5e7] rounded-md text-sm focus:border-[#0066CC]"
            />
          </div>

          <div className="mb-3 relative">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full border-2 border-[#e5e5e7] rounded-md px-2 py-1.5 text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] appearance-none"
              >
                <option>Interested</option>
                <option>Applied</option>
                <option>Interviewing</option>
                <option>Offer</option>
                <option>Rejected</option>
                <option>Not Interested</option>
              </select>
              <FiChevronDown
                size={18}
                className="absolute right-3 top-3 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Close Date */}
          <div className="mb-3">
            <label className="block text-gray-800 font-semibold text-xs mb-1">
              Close Date <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="relative w-full">
              <DatePicker
                ref={datePickerRef}
                selected={
                  formData.closeDate
                    ? formData.closeDate instanceof Date
                      ? formData.closeDate
                      : new Date(formData.closeDate)
                    : null
                }
                onChange={(date) => handleChange('closeDate', date)}
                placeholderText="yyyy-MM-dd"
                dateFormat="yyyy-MM-dd"
                className="w-full border-2 border-gray-200 rounded-md px-3 py-1.5 pr-10 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              />
              <FiCalendar
                size={16}
                onClick={() => datePickerRef.current?.setFocus()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-600"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#1a1a1a] font-semibold text-xs mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional information..."
              className="w-full border-2 border-[#e5e5e7] rounded-md px-2 py-1.5 text-sm text-[#333333] focus:outline-none focus:border-[#0066CC] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e7ee]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border border-[#e5e5e7] bg-[#f5f5f7] text-[#333333] hover:bg-[#eaeaea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0066CC] text-white hover:bg-[#004C99]"
            >
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
