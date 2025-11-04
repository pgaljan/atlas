import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import CanvasRenderer from './cleansheet-renderer';
import ExperienceSlideout from './experiences-slideout';
import { useOutletContext } from 'react-router-dom';
import CleanSheetLearnerCanvas from './cleasheet-learner-canvas';
import CleanSheetProfessionalCanvas from './cleansheet-professional-canvas';
import JobOpportunities from './cleansheet-job-slideout';
import RightSlideout from './cleansheet-canvas-rigthslideout';
import ApplicationMaterials from './cleansheet-app-material-slideout';
import GoalsSlideout from './cleansheet-goals-slideout';
import PortfolioSlideout from './cleansheet-portfolio-slideout';
import InterviewPrepSlideout from './cleansheet-interview-prep';

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
  const [currentPersona] = useState('retail-manager');
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
  const exampleGoalsData = {
    chemist: {
      improvementGoals: ['Advanced Spectroscopy', 'AI in Drug Discovery'],
      skills: [
        { name: 'Analytical Chemistry', currentLevel: 4, desiredLevel: 5 },
        { name: 'Data Analysis', currentLevel: 3, desiredLevel: 4 },
        { name: 'Laboratory Safety', currentLevel: 4, desiredLevel: 4 },
        { name: 'Chromatography', currentLevel: 3, desiredLevel: 5 },
      ],
      competencies: [
        { name: 'Research Design', currentLevel: 4, desiredLevel: 5 },
        { name: 'Scientific Writing', currentLevel: 3, desiredLevel: 4 },
        { name: 'Problem Solving', currentLevel: 4, desiredLevel: 5 },
        { name: 'Collaboration', currentLevel: 3, desiredLevel: 4 },
      ],
    },

    'retail-manager': {
      improvementGoals: [
        'Python Programming',
        'Power BI Advanced Features',
        'SQL Query Optimization',
      ],
      skills: [
        { name: 'Excel', currentLevel: 4, desiredLevel: 5 },
        { name: 'Power BI', currentLevel: 2, desiredLevel: 4 },
        { name: 'SQL', currentLevel: 2, desiredLevel: 4 },
        { name: 'Python', currentLevel: 1, desiredLevel: 3 },
        { name: 'Data Analysis', currentLevel: 3, desiredLevel: 4 },
      ],
      competencies: [
        { name: 'Leadership', currentLevel: 4, desiredLevel: 4 },
        { name: 'Operations Management', currentLevel: 4, desiredLevel: 5 },
        { name: 'Problem Solving', currentLevel: 3, desiredLevel: 4 },
        { name: 'Communication', currentLevel: 4, desiredLevel: 4 },
        { name: 'Strategic Thinking', currentLevel: 2, desiredLevel: 4 },
      ],
    },

    'field-engineer': {
      improvementGoals: ['Azure Cloud Architecture', 'Kubernetes', 'Infrastructure as Code'],
      skills: [
        { name: 'Networking', currentLevel: 4, desiredLevel: 5 },
        { name: 'Windows Server', currentLevel: 4, desiredLevel: 4 },
        { name: 'Active Directory', currentLevel: 4, desiredLevel: 4 },
        { name: 'Azure', currentLevel: 2, desiredLevel: 4 },
        { name: 'PowerShell', currentLevel: 3, desiredLevel: 4 },
        { name: 'Kubernetes', currentLevel: 1, desiredLevel: 3 },
        { name: 'Terraform', currentLevel: 1, desiredLevel: 3 },
      ],
      competencies: [
        { name: 'Technical Troubleshooting', currentLevel: 4, desiredLevel: 5 },
        { name: 'Customer Service', currentLevel: 4, desiredLevel: 4 },
        { name: 'Documentation', currentLevel: 3, desiredLevel: 4 },
        { name: 'Project Management', currentLevel: 2, desiredLevel: 3 },
        { name: 'Cloud Architecture', currentLevel: 2, desiredLevel: 4 },
      ],
    },

    'business-analyst': {
      improvementGoals: ['Machine Learning Fundamentals', 'Advanced Python', 'Data Engineering'],
      skills: [
        { name: 'SQL', currentLevel: 4, desiredLevel: 5 },
        { name: 'Python', currentLevel: 2, desiredLevel: 4 },
        { name: 'R', currentLevel: 2, desiredLevel: 3 },
        { name: 'Excel', currentLevel: 4, desiredLevel: 5 },
      ],
      competencies: [
        { name: 'Data Analysis', currentLevel: 4, desiredLevel: 5 },
        { name: 'Business Acumen', currentLevel: 4, desiredLevel: 4 },
        { name: 'Communication', currentLevel: 4, desiredLevel: 5 },
        { name: 'Critical Thinking', currentLevel: 3, desiredLevel: 4 },
      ],
    },

    'devops-engineer': {
      improvementGoals: ['AWS Security', 'CI/CD Pipeline Optimization', 'Container Orchestration'],
      skills: [
        { name: 'AWS', currentLevel: 3, desiredLevel: 5 },
        { name: 'Docker', currentLevel: 3, desiredLevel: 4 },
        { name: 'Kubernetes', currentLevel: 2, desiredLevel: 4 },
        { name: 'Terraform', currentLevel: 2, desiredLevel: 4 },
        { name: 'Linux', currentLevel: 4, desiredLevel: 4 },
        { name: 'GitHub Actions', currentLevel: 3, desiredLevel: 4 },
      ],
      competencies: [
        { name: 'Automation', currentLevel: 3, desiredLevel: 5 },
        { name: 'Collaboration', currentLevel: 4, desiredLevel: 5 },
        { name: 'Monitoring', currentLevel: 3, desiredLevel: 4 },
        { name: 'Incident Management', currentLevel: 3, desiredLevel: 4 },
        { name: 'Security Compliance', currentLevel: 2, desiredLevel: 4 },
      ],
    },
  };
  const exampleStories = {
    'retail-manager': [
      {
        title: 'Managing Peak Season Staffing Crisis',
        experience: 'RetailMart Store Manager (2019-2024)',
        situation:
          'During Black Friday weekend, three team members called in sick, leaving us severely understaffed during our busiest period. Customer traffic was 40% above forecast, and we risked long wait times and poor customer experience.',
        task: 'As Store Manager, I needed to ensure we maintained service standards while managing an exhausted team and preventing further burnout.',
        action:
          'I immediately called in off-duty staff offering premium pay, reorganized floor coverage to prioritize high-traffic areas, and personally worked checkout and stocking alongside the team. I implemented 15-minute rotation breaks to prevent burnout and communicated transparently with customers about wait times.',
        result:
          'We processed 2,300 transactions over the weekend with 92% customer satisfaction scores (above our 85% target). Team morale remained strong, and we exceeded sales targets by 18%. Two team members later mentioned this experience in their positive reviews.',
        competencies: ['Crisis Management', 'Leadership', 'Customer Service', 'Team Building'],
      },
      {
        title: 'Implementing Data-Driven Inventory System',
        experience: 'RetailMart Store Manager (2019-2024)',
        situation:
          'Our store consistently had 22% inventory shrinkage (far above the 8% company benchmark) and frequent stockouts of popular items. Manual tracking was error-prone, and the team resisted changing established processes.',
        task: 'I was tasked with reducing shrinkage to under 10% within six months while improving product availability.',
        action:
          'I taught myself Excel pivot tables and Power BI to analyze shrinkage patterns. I discovered 60% of losses occurred during restocking shifts. I implemented a barcode scanning system, trained staff on cycle counting procedures, and created a daily dashboard showing real-time inventory accuracy by department.',
        result:
          'Inventory shrinkage dropped to 7.5% within four months, saving $45,000 annually. Product availability improved from 83% to 94%. My analytics approach was adopted by 12 other stores in the district, and I was asked to lead regional training sessions.',
        competencies: [
          'Data Analysis',
          'Problem Solving',
          'Change Management',
          'Process Improvement',
        ],
      },
    ],
  };

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
      <div className="absolute inset-0 overflow-hidden ">
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
        ) : selectedNode?.id === 'job' ? (
          <div className="p-4">
            <JobOpportunities currentPersona={currentPersona} />
          </div>
        ) : selectedNode?.id === 'portfolio' ? (
          <div className="p-4">
            <PortfolioSlideout currentPersona={currentPersona} />
          </div>
        ) : selectedNode?.id === 'app' ? (
          <div className="p-4">
            <ApplicationMaterials currentPersona={currentPersona} />
          </div>
        ) : selectedNode?.id === 'goals' ? (
          <GoalsSlideout
            open={slideOpen}
            onClose={closeSlide}
            currentPersona={currentPersona}
            exampleGoalsData={exampleGoalsData}
          />
        ) : selectedNode?.id === 'interview' ? (
          <InterviewPrepSlideout
            currentPersona={currentPersona}
            initialBehavioralStories={exampleStories[currentPersona] || []}
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
