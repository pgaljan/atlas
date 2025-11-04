import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FiPlus, FiGrid, FiList } from 'react-icons/fi';
import JobCard from './cleansheet-job-card';
import JobsTable from './cleansheet-job-table';
import AddJobModal from './cleansheet-add-job-modal';
import JobDetailModal from './job-detail-modal';
import DeleteModal from '../../../../../components/modals/DeleteModal';

const exampleJobOpportunities = {
  'retail-manager': [
    {
      title: 'Operations Manager',
      company: 'Amazon',
      location: 'Seattle',
      salary: '$125K',
      status: 'rejected',
      skills: ['Excel', 'Data Analysis', 'Process Optimization'],
      competencies: ['Leadership', 'Operations Management', 'Problem Solving'],
      isExample: true,
      alertCount: 4,
      alertLevel: 'due-soon',
      alertTooltip: 'due-soon: draft cover letter',
      nextActionText: 'Write personalized cover letter',
      nextActionDate: '2025-10-24',
      nextActionStatus: 'overdue',
    },
    {
      title: 'Business Analyst',
      company: 'Target HQ',
      location: 'Minneapolis',
      salary: '$95K',
      status: 'interested',
      skills: ['Excel', 'Power BI', 'SQL'],
      competencies: ['Data Analysis', 'Business Intelligence', 'Communication'],
      isExample: true,
      alertCount: 8,
      alertLevel: 'overdue',
      alertTooltip: 'Overdue: draft cover letter',
      nextActionText: 'Write personalized cover letter',
      nextActionDate: '2025-10-28',
      nextActionStatus: 'due-soon',
    },
    {
      title: 'Data Analyst',
      company: 'Walmart eCommerce',
      location: 'Bentonville',
      salary: '$85K',
      status: 'interested',
      skills: ['SQL', 'Python', 'Tableau'],
      competencies: ['Analytics', 'Critical Thinking', 'Collaboration'],
      isExample: true,
      alertCount: 3,
      alertLevel: 'normal',
      alertTooltip: 'normal: draft cover letter',
      nextActionText: 'Write personalized cover letter',
      nextActionDate: '2025-10-28',
      nextActionStatus: 'normal',
    },
    {
      title: 'Supply Chain Analyst',
      company: 'Nike',
      location: 'Portland',
      salary: '$90K',
      status: 'interested',
      skills: ['Excel', 'Supply Chain Software', 'Data Visualization'],
      competencies: ['Logistics', 'Process Improvement', 'Stakeholder Management'],
      isExample: true,
    },
    {
      title: 'Ops Coordinator',
      company: 'Instacart',
      location: 'San Francisco',
      salary: '$80K',
      status: 'interested',
      skills: ['Project Management', 'Excel', 'Communication'],
      competencies: ['Organization', 'Multitasking', 'Adaptability'],
      isExample: true,
    },
  ],
  default: [
    {
      title: 'Junior Full Stack Developer',
      company: 'StartupCo',
      location: 'Austin',
      salary: '$85K',
      status: 'applied',
      skills: ['React', 'Node.js'],
      competencies: ['Full Stack'],
      isExample: true,
    },
  ],
};

function defaultPersonaKey(key) {
  return key || 'default';
}

export default function JobOpportunities({
  currentPersona = 'default',
  examplePersona = null,
  ModalWrapper = null,
}) {
  const persona = useMemo(() => defaultPersonaKey(currentPersona), [currentPersona]);
  const storageKey = `jobOpportunities_${persona}`;

  const [userJobs, setUserJobs] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingJob, setEditingJob] = useState(null);
  const [isAddJobModalOpen, setAddJobModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setUserJobs(JSON.parse(stored));
      } else {
        setUserJobs([]);
      }
    } catch (e) {
      console.error('Failed parsing stored jobs for', storageKey, e);
      setUserJobs([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(userJobs));
      try {
        window.dispatchEvent(
          new CustomEvent(`jobsUpdated:${storageKey}`, {
            detail: Array.isArray(userJobs) ? userJobs : [],
          }),
        );
      } catch (e) {}
    } catch (e) {
      console.error('Failed writing jobs to localStorage', e);
    }
  }, [storageKey, userJobs]);

  useEffect(() => {
    function onStorageEvent(e) {
      if (e.key !== storageKey) return;
      try {
        if (e.newValue) setUserJobs(JSON.parse(e.newValue));
        else setUserJobs([]);
      } catch (err) {
        console.error('Failed reading storage event for', storageKey, err);
      }
    }
    function onCustomEvent(e) {
      try {
        if (e?.detail && Array.isArray(e.detail)) setUserJobs(e.detail);
      } catch (err) {}
    }

    window.addEventListener('storage', onStorageEvent);
    window.addEventListener(`jobsUpdated:${storageKey}`, onCustomEvent);

    window.addEventListener('jobsUpdated', onCustomEvent);

    return () => {
      window.removeEventListener('storage', onStorageEvent);
      window.removeEventListener(`jobsUpdated:${storageKey}`, onCustomEvent);
      window.removeEventListener('jobsUpdated', onCustomEvent);
    };
  }, [storageKey]);

  const combined = useMemo(() => {
    const allExamples = Object.values(exampleJobOpportunities).flat();
    return [...userJobs, ...allExamples];
  }, [userJobs]);

  function openJobDetail(index) {
    setSelectedIndex(index);
    setDetailOpen(true);
  }
  function closeJobDetail() {
    setSelectedIndex(null);
    setDetailOpen(false);
  }

  function handleDelete(index) {
    if (index >= userJobs.length) {
      alert('Cannot delete example job. Create your own job to manage it.');
      return;
    }
    setDeleteIndex(index);
    setDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    if (deleteIndex == null) return;

    setDeleteLoading(true);
    setTimeout(() => {
      const copy = [...userJobs];
      copy.splice(deleteIndex, 1);
      setUserJobs(copy);
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setDeleteIndex(null);
    }, 400);
  }

  const handleAddJob = useCallback(
    (newJob) => {
      const normalized = {
        ...newJob,
        status: (newJob.status || 'interested').toString().toLowerCase().replace(/\s+/g, '-'),
        closeDate:
          newJob.closeDate && !(newJob.closeDate instanceof Date)
            ? newJob.closeDate
            : newJob.closeDate instanceof Date
              ? newJob.closeDate.toISOString().split('T')[0]
              : newJob.closeDate || '',
      };
      setUserJobs((prev) => [...prev, normalized]);
      setAddJobModalOpen(false);
    },
    [setUserJobs],
  );

  function editJob(index) {
    if (index < userJobs.length) {
      setEditingIndex(index);
      setEditingJob({ ...userJobs[index] });
    } else {
    }
  }

  function saveEditedJob(job) {
    if (editingIndex >= 0) {
      const t = [...userJobs];
      t[editingIndex] = job;
      setUserJobs(t);
      setEditingIndex(-1);
      setEditingJob(null);
    }
  }

  function CardsGrid() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {combined.map((job, i) => (
          <JobCard
            key={`${job.title || 'job'}-${i}`}
            job={job}
            index={i}
            onEdit={(idx) => {
              if (idx < userJobs.length) editJob(idx);
              else alert('Cannot edit example job');
            }}
            onDelete={(idx) => handleDelete(idx)}
            onOpen={(idx) => openJobDetail(idx)}
          />
        ))}
      </div>
    );
  }

  const PRIMARY_BLUE = '#0066CC';
  const NEUTRAL_TEXT = '#333333';
  const NEUTRAL_BORDER = '#e5e5e7';
  const NEUTRAL_BACKGROUND = '#f5f5f7';
  const FONT_STACK = "'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return (
    <div className="w-full h-full">
      <style>{`
        .view-toggle-container { display: flex; gap: 8px; align-items: center; }
        .add-story-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: ${PRIMARY_BLUE};
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-family: ${FONT_STACK};
          font-size: 14px;
          font-weight: 600;
        }
        .job-view-toggle {
          margin-left: auto;
          display: inline-flex;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid ${NEUTRAL_BORDER};
        }
        .view-toggle-btn {
          padding: 6px 12px;
          background: #ffffff;
          border: none;
          border-right: 1px solid ${NEUTRAL_BORDER};
          color: ${NEUTRAL_TEXT};
          font-family: ${FONT_STACK};
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.12s ease;
        }
        .view-toggle-btn:last-child { border-right: none; }
        .view-toggle-btn:hover { background: ${NEUTRAL_BACKGROUND}; }
        .view-toggle-btn.active {
          background: ${PRIMARY_BLUE};
          color: #ffffff;
        }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddJobModalOpen(true)}
            className="add-story-btn"
            title="Add Job"
            type="button"
          >
            <FiPlus /> Add Job
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="view-toggle-container" style={{ width: 'auto' }}>
            <div className="job-view-toggle" role="tablist" aria-label="Toggle job view">
              <button
                id="jobCardViewBtn"
                onClick={() => setViewMode('cards')}
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                title="Cards"
                aria-pressed={viewMode === 'cards'}
                type="button"
              >
                <FiGrid />
                <span className="hidden sm:inline">Cards</span>
              </button>

              <button
                id="jobTableViewBtn"
                onClick={() => setViewMode('table')}
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table"
                aria-pressed={viewMode === 'table'}
                type="button"
              >
                <FiList />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {viewMode === 'cards' ? (
          <CardsGrid />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <JobsTable
              jobs={combined}
              onRowClick={openJobDetail}
              onEdit={editJob}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      <JobDetailModal
        isOpen={isDetailOpen}
        onClose={closeJobDetail}
        job={selectedIndex != null ? combined[selectedIndex] : null}
        onUpdateJob={(updated) => {
          if (selectedIndex < userJobs.length) {
            const copy = [...userJobs];
            copy[selectedIndex] = updated;
            setUserJobs(copy);
          } else {
            alert('Example jobs are read-only in this editor. Create your own to edit.');
          }
          closeJobDetail();
        }}
        onDelete={() => {
          if (selectedIndex < userJobs.length) {
            setDeleteIndex(selectedIndex);
            setDeleteModalOpen(true);
            closeJobDetail();
          } else {
            alert('Cannot delete example job');
          }
        }}
        ModalWrapper={ModalWrapper}
      />

      {editingIndex >= 0 && editingJob && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => {
              setEditingIndex(-1);
              setEditingJob(null);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl rounded shadow p-4 bg-white">
            <h3 className="text-lg font-semibold mb-3">Edit Job</h3>

            <div className="grid grid-cols-1 gap-2">
              <input
                className="border p-2 rounded"
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                value={editingJob.company}
                onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
              />
              <div className="flex gap-2">
                <input
                  className="border p-2 rounded flex-1"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  placeholder="Location"
                />
                <input
                  className="border p-2 rounded w-36"
                  value={editingJob.salary}
                  onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                  placeholder="Salary"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={editingJob.closeDate || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, closeDate: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setEditingJob(null);
                }}
                className="px-3 py-1 border rounded"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEditedJob(editingJob)}
                className="px-3 py-1"
                style={{ background: PRIMARY_BLUE, color: '#fff', borderRadius: 6 }}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteIndex(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteIndex != null && userJobs[deleteIndex]?.title ? userJobs[deleteIndex].title : 'Job'
        }
        loading={deleteLoading}
      />

      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setAddJobModalOpen(false)}
        onSave={handleAddJob}
      />
    </div>
  );
}
