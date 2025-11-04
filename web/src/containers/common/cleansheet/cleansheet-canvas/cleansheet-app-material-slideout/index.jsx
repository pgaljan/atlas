import React, { useEffect, useState } from 'react';
import ModalComponent from '../../../../../components/modals/Modal';
import ApplicationMaterialCard from './cleansheet-app-material-card';
import DeleteModal from '../../../../../components/modals/DeleteModal';
import InputField from '../../../../../components/input-field/InputField';
import { PiSparkle } from 'react-icons/pi';
import { PiFileArrowUp } from 'react-icons/pi';
import ReactDOM from 'react-dom';
const exampleApplicationMaterials = {
  'retail-manager': [
    {
      type: 'Resume',
      title: 'Cloud Operations Resume',
      jobOpportunity: 'Cloud Operations Engineer - TechCorp',
      content:
        'Experienced retail operations manager with 5+ years managing store operations, inventory systems, and teams of 15-30 employees. Strong background in data analysis using Excel and Power BI. Seeking to transition technical operations and cloud infrastructure management skills.',
      format: 'PDF',
      atsOptimized: true,
      createdDate: '2024-09-15',
      isExample: true,
    },
    {
      type: 'Cover Letter',
      title: 'Cloud Operations Cover Letter',
      jobOpportunity: 'Cloud Operations Engineer - TechCorp',
      content:
        'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Cloud Operations Engineer position at TechCorp...',
      format: 'DOCX',
      atsOptimized: true,
      createdDate: '2024-09-15',
      isExample: true,
    },
    {
      type: 'Email',
      title: 'Networking Email to TechCorp Cloud Engineer',
      jobOpportunity: 'Cloud Operations Engineer - TechCorp',
      content:
        'Subject: Retail Manager → Cloud Operations: Seeking Advice\n\nHi [Name],\n\nI found your profile...',
      format: 'HTML',
      atsOptimized: false,
      createdDate: '2024-09-16',
      isExample: true,
    },
  ],
  chemist: [
    {
      type: 'Resume',
      title: 'Cloud Computing Resume',
      jobOpportunity: 'Cloud Solutions Architect - CloudVendor',
      content:
        'Senior Chemist with 4+ years pharmaceutical R&D experience and strong computational background. Extensive experience with scientific computing, data analysis (Python, R), and laboratory automation systems. Seeking to apply analytical rigor and technical expertise to cloud architecture and solutions design.',
      format: 'PDF',
      atsOptimized: true,
      createdDate: '2024-09-12',
      isExample: true,
    },
    {
      type: 'Cover Letter',
      title: 'Cloud Architect Cover Letter',
      jobOpportunity: 'Cloud Solutions Architect - CloudVendor',
      content:
        'Dear Hiring Manager,\n\nI am excited to apply for the Cloud Solutions Architect position at CloudVendor...',
      format: 'DOCX',
      atsOptimized: true,
      createdDate: '2024-09-12',
      isExample: true,
    },
    {
      type: 'Email',
      title: 'Cold Outreach to CloudVendor Recruiter',
      jobOpportunity: 'Cloud Solutions Architect - CloudVendor',
      content:
        "Subject: PhD Chemist → Cloud Solutions Architect: Non-Traditional Background\n\nHi [Recruiter Name],\n\nI'm reaching out regarding the Cloud Solutions Architect role...",
      format: 'TXT',
      atsOptimized: false,
      createdDate: '2024-09-13',
      isExample: true,
    },
  ],
};

const LOCAL_KEY = 'userApplicationMaterials';
const jobOpportunities = [
  'Operations Manager - Amazon',
  'Business Analyst - Target HQ',
  'Data Analyst - Walmart eCommerce',
  'Supply Chain Analyst - Nike',
  'Ops Coordinator - Instacart',
];
function Portal({ children }) {
  const [el] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [el]);

  return ReactDOM.createPortal(children, el);
}
export default function ApplicationMaterials({ currentPersona = 'retail-manager' }) {
  const [userMaterials, setUserMaterials] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isGenerateOpen, setGenerateOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteIndex, setToDeleteIndex] = useState(null);
  const [form, setForm] = useState({
    type: 'Resume',
    title: '',
    jobOpportunity: '',
    format: 'PDF',
    atsOptimized: false,
    content: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(userMaterials));
    } catch {}
  }, [userMaterials]);

  const exampleMaterials =
    exampleApplicationMaterials[currentPersona] ||
    exampleApplicationMaterials['retail-manager'] ||
    [];
  const allMaterials = [...userMaterials, ...exampleMaterials];

  function openGenerate() {
    setForm({
      type: 'Resume',
      title: '',
      jobOpportunity: '',
      format: 'PDF',
      atsOptimized: false,
      content: '',
    });
    setGenerateOpen(true);
  }

  function handleGenerateSubmit() {
    const newItem = {
      ...form,
      createdDate: new Date().toISOString(),
      isExample: false,
    };
    setUserMaterials((s) => [newItem, ...s]);
    setGenerateOpen(false);
  }

  function handleDownload(idx) {
    const material = allMaterials[idx];
    const filename = `${(material.title || 'material').replace(/[^a-z0-9_-]/gi, '_')}.${(
      material.format || 'txt'
    ).toLowerCase()}`;

    const blob = new Blob([material.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleRequestDelete(idx) {
    if (idx < userMaterials.length) {
      setToDeleteIndex(idx);
      setDeleteOpen(true);
    }
  }

  function confirmDelete() {
    if (toDeleteIndex === null) return;
    setUserMaterials((s) => s.filter((_, i) => i !== toDeleteIndex));
    setToDeleteIndex(null);
    setDeleteOpen(false);
  }

  function handleUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target.result || '');
      const newItem = {
        type: 'Resume',
        title: file.name,
        jobOpportunity: '',
        format: file.name.split('.').pop() || 'PDF',
        atsOptimized: false,
        content,
        createdDate: new Date().toISOString(),
        isExample: false,
      };
      setUserMaterials((s) => [newItem, ...s]);
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={openGenerate}
          style={{
            boxShadow: '0 2px 8px rgba(0,102,204,0.3)',
            transition: 'all 0.2s',
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-[#004C99]"
        >
          <PiSparkle />
          Generate
        </button>

        <label
          style={{
            boxShadow: '0 2px 8px rgba(0,70,153,0.3)',
            transition: 'all 0.2s',
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#004C99] text-xs font-medium text-white cursor-pointer hover:bg-[#1a1a1a]"
        >
          {/* <input type="file" className="sr-only" /> */}
          <PiFileArrowUp />
          Upload
          <span className="text-[10px] opacity-80">(Coming soon)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allMaterials.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No application materials yet. Click Generate or Upload to add materials.
          </div>
        ) : (
          allMaterials.map((material, idx) => (
            <ApplicationMaterialCard
              key={`${material.title}-${idx}`}
              material={material}
              isUserMaterial={idx < userMaterials.length}
              onDownload={() => handleDownload(idx)}
              onDelete={() => handleRequestDelete(idx)}
            />
          ))
        )}
      </div>
      <Portal>
        <ModalComponent
          isOpen={isGenerateOpen}
          onClose={() => setGenerateOpen(false)}
          onSubmit={handleGenerateSubmit}
          title="Generate Application Material"
          submitText="Create"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <div className="text-xs text-gray-600 mb-1">Material Type</div>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-custom-main focus:outline-none"
                >
                  <option>Resume</option>
                  <option>Cover Letter</option>
                  <option>Email</option>
                </select>
              </label>

              <label className="block">
                <div className="text-xs text-gray-600 mb-1">Format</div>
                <select
                  value={form.format}
                  onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-custom-main focus:outline-none"
                >
                  <option>PDF</option>
                  <option>DOCX (Word)</option>
                  <option>HTML</option>
                  <option>Markdown</option>
                  <option>Plain Text</option>
                </select>
              </label>
            </div>

            <div>
              <InputField
                label="Title"
                name="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Resume for Operations Manager"
              />
            </div>

            <label className="block">
              <div className="text-xs text-gray-600 mb-1">Select a Job Opportunity</div>
              <select
                value={form.jobOpportunity}
                onChange={(e) => setForm((f) => ({ ...f, jobOpportunity: e.target.value }))}
                className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-custom-main focus:outline-none"
              >
                <option value="">Select a job opportunity...</option>
                {jobOpportunities.map((job, index) => (
                  <option key={index} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs text-gray-600 mb-1">Content</div>
              <textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Draft content or summary..."
                className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:border-custom-main focus:outline-none resize-none"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.atsOptimized}
                onChange={(e) => setForm((f) => ({ ...f, atsOptimized: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                ATS Optimized (Applicant Tracking System)
              </span>
            </label>
          </div>
        </ModalComponent>
      </Portal>
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setToDeleteIndex(null);
        }}
        onConfirm={confirmDelete}
        title="Application Material"
      />
    </div>
  );
}
