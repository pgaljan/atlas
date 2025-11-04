import React, { useEffect, useState } from 'react';
import { PiPlusCircle, PiFileText } from 'react-icons/pi';
import PlaceholderPanel from '../empty-content-state';
import StoryCard from '../behavioral-tab-card';
import AddStoryModal from '../add-behavioral-story-modal';
import DeleteModal from '../../../../../../components/modals/DeleteModal';

const exampleStoriesByPersona = {
  'retail-manager': [
    {
      title: 'Managing Peak Season Staffing Crisis',
      experience: 'RetailMart Store Manager(2019-2024)',
      situation:
        'During Black Friday weekend, three team members called in sick, leaving us severely understaffed during our busiest period.',
      task: 'Ensure service standards while managing an exhausted team and prevent burnout.',
      action:
        'Called in off-duty staff offering premium pay, reorganized floor coverage and implemented 15-minute rotation breaks.',
      result:
        'Processed 2,300 transactions over the weekend with 92% customer satisfaction; exceeded sales targets by 18%.',
      competencies: ['Crisis Management', 'Leadership', 'Customer Service', 'Team Building'],
      isExample: true,
      id: 'example-1',
    },
    {
      title: 'Implementing Data-Driven Inventory System',
      experience: 'RetailMart Store Manager(2019-2024)',
      situation:
        'Store had 22% inventory shrinkage and frequent stockouts. Manual tracking was error-prone.',
      task: 'Reduce shrinkage below 10% and improve product availability.',
      action:
        'Implemented barcode scanning and daily dashboards; taught Power BI and pivot analysis to team.',
      result:
        'Shrinkage dropped to 7.5%, saving $45,000 annually; approach adopted by other stores.',
      competencies: ['Data Analysis', 'Problem Solving', 'Change Management'],
      isExample: true,
      id: 'example-2',
    },
  ],
};

const STORAGE_KEY = 'behavioralStories';

export default function BehavioralTab({ currentPersona = 'retail-manager', initialStories = [] }) {
  const [behavioralStories, setBehavioralStories] = useState(initialStories || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setBehavioralStories(JSON.parse(raw));
      } else {
        setBehavioralStories(initialStories || []);
      }
    } catch (e) {
      setBehavioralStories(initialStories || []);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(behavioralStories));
    } catch (e) {
      // ignore
    }
  }, [behavioralStories]);

  const personaExamples = exampleStoriesByPersona[currentPersona] || [];

  function handleAddClick() {
    setEditingStory(null);
    setIsModalOpen(true);
  }

  function handleSaveStory(story) {
    if (!story) return;
    setBehavioralStories((prev) => {
      const exists = prev.findIndex((s) => String(s.id) === String(story.id));
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = { ...copy[exists], ...story };
        return copy;
      } else {
        return [{ ...story, createdAt: new Date().toISOString() }, ...prev];
      }
    });
  }

  function handleEdit(index) {
    const story = behavioralStories[index];
    if (!story) return;
    setEditingStory(story);
    setIsModalOpen(true);
  }

  function handleDelete(index) {
    const story = behavioralStories[index];
    if (!story) return;
    setDeleteTarget({ index, story });
    setIsDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      setIsDeleteOpen(false);
      return;
    }

    try {
      setDeleting(true);

      setBehavioralStories((prev) => {
        const copy = [...prev];
        copy.splice(deleteTarget.index, 1);
        return copy;
      });

      setDeleteTarget(null);
      setIsDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  const userStories = behavioralStories || [];
  const allStoriesToRender = [...userStories, ...personaExamples];

  return (
    <div className="slideout-body" id="behavioralContent">
      <AddStoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStory(null);
        }}
        onSave={handleSaveStory}
        initial={editingStory || {}}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        title={deleteTarget?.story?.title || 'Story'}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <div className="mb-4">
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold focus:outline-none"
          style={{ background: 'var(--color-primary-blue)', color: 'white', border: 'none' }}
        >
          <PiPlusCircle />
          Add New Story
        </button>
      </div>

      <div id="storiesContainer" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allStoriesToRender.length === 0 ? (
          <div className="min-h-[240px] flex items-center justify-center">
            <PlaceholderPanel
              icon={<PiFileText />}
              title={
                'No stories yet. Click "Add New Story" to create your first STAR behavioral story.'
              }
            />
          </div>
        ) : (
          allStoriesToRender.map((story, idx) => {
            const isUserStory = idx < userStories.length;
            const userIndex = isUserStory ? idx : -1;
            return (
              <StoryCard
                key={`${story.id ?? story.title}-${idx}`}
                story={story}
                isUserStory={isUserStory}
                onEdit={() => {
                  if (!isUserStory) return;
                  handleEdit(userIndex);
                }}
                onDelete={() => {
                  if (!isUserStory) return;
                  handleDelete(userIndex);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
