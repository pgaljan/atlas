import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import CanvasRenderer from './cleansheet-renderer';
import RightSlideout from './cleanshee-canvas-rigthslideout';
import ExperienceSlideout from './experiences-slideout';
import { useOutletContext } from 'react-router-dom';
import CleanSheetLearnerCanvas from './cleasheet-learner-canvas';
import CleanSheetProfessionalCanvas from './cleansheet-professional-canvas';

const exampleExperiences = {
  chemist: [
    {
      organizationName: 'PharmaTech Labs',
      role: 'Research Chemist',
      location: 'Boston, MA',
      startDate: '2020-06',
      endDate: '2024-01',
      description:
        'Conducted analytical chemistry research for pharmaceutical development. Designed experiments, analyzed compounds, and collaborated with cross-functional teams.',
      technologies: [
        { name: 'HPLC', type: 'Core' },
        { name: 'Mass Spectrometry', type: 'Core' },
        { name: 'Python', type: 'Peripheral' },
      ],
      keySkills: ['Analytical Chemistry', 'Data Analysis', 'Lab Safety'],
      competencies: ['Scientific Research', 'Problem Solving'],
      achievements: ['Published 3 papers', 'Developed new testing method'],
    },
  ],
};

function capitalizeName(raw) {
  if (!raw) return 'User';
  return String(raw)
    .split(' ')
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : ''))
    .join(' ');
}

export default function CleanSheetCanvas() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [currentPersona] = useState('chemist');
  const { viewMode } = useOutletContext();

  const fixedChildren = [
    {
      id: 'job',
      name: 'Job Opportunities',
      count: 5,
      content: 'List of job opportunities...',
      icon: 'briefcase',
    },
    {
      id: 'app',
      name: 'Application Materials',
      count: 4,
      content: 'Resume, cover letter...',
      icon: 'file',
    },
    {
      id: 'exp',
      name: 'Career Experience',
      count: 5,
      content: 'Work history, projects...',
      icon: 'gift',
    },
    {
      id: 'goals',
      name: 'Goals',
      count: 6,
      content: 'Short-term and long-term goals...',
      icon: 'target',
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      count: 2,
      content: 'Selected projects & artifacts...',
      icon: 'folder',
    },
    {
      id: 'interview',
      name: 'Interview Prep',
      count: 2,
      content: 'Mock questions, notes...',
      icon: 'message',
    },
  ];

  const usernameRaw = Cookies.get('atlas_username') || 'User';
  const username = capitalizeName(usernameRaw);

  useEffect(() => {
    const listener = (e) => {
      setSelectedNode(e.detail);
      setSlideOpen(true);
    };
    window.addEventListener('react-mindmap-node', listener);
    return () => window.removeEventListener('react-mindmap-node', listener);
  }, []);

  function handleNodeClick(node) {
    setSelectedNode(node);
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setSelectedNode(null);
  }

  return (
    <div className="w-full h-full overflow-hidden bg-white">
      <div className="absolute inset-0 overflow-hidden">
        {viewMode == 'seeker' && (
          <CanvasRenderer
            fixedChildren={fixedChildren}
            heightHint={null}
            onNodeClick={handleNodeClick}
          />
        )}

        {viewMode == 'learner' && <CleanSheetLearnerCanvas onNodeClick={handleNodeClick} />}
        {viewMode == 'professional' && <CleanSheetProfessionalCanvas />}
      </div>

      <RightSlideout open={slideOpen} title={selectedNode?.name || 'Details'} onClose={closeSlide}>
        {selectedNode?.id === 'exp' ? (
          <ExperienceSlideout
            open={slideOpen}
            onClose={closeSlide}
            personaKey={currentPersona}
            exampleExperiences={exampleExperiences}
            initialUserExperiences={[]}
          />
        ) : selectedNode ? (
          <div className="p-4">
            <h3 className="mt-0">{selectedNode.name}</h3>
            <p>{selectedNode.content}</p>
          </div>
        ) : null}
      </RightSlideout>
    </div>
  );
}
