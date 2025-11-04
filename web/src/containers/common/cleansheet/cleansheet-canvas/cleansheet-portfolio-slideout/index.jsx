import React, { useEffect, useState } from 'react';
import { PiPlusCircle, PiGithubLogo, PiCode } from 'react-icons/pi';
import PortfolioCard from './portfolio-card';

const examplePortfolioProjects = {
  'retail-manager': [
    {
      title: 'Power BI Sales Dashboard',
      description:
        'Interactive sales analytics dashboard tracking KPIs across 15 retail locations. Includes YoY comparisons, inventory turnover analysis, and predictive sales forecasting.',
      technologies: ['Power BI', 'Excel', 'SQL'],
      url: null,
      completedDate: '2023-11',
      highlights: [
        'Reduced reporting time from 4 hours to 15 minutes',
        'Identified $45K in inventory optimization opportunities',
        'Adopted by 12 stores in district',
      ],
      isExample: true,
    },
    {
      title: 'Staff Scheduling Model (Excel VBA)',
      description:
        'Automated employee scheduling system using Excel VBA and optimization algorithms. Considers availability, labor laws, peak traffic patterns, and employee preferences.',
      technologies: ['Excel VBA', 'Optimization Algorithms'],
      url: null,
      completedDate: '2023-06',
      highlights: [
        'Reduced scheduling time from 3 hours to 30 minutes weekly',
        'Improved schedule fairness scores by 40%',
        'Decreased overtime costs by 15%',
      ],
      isExample: true,
    },
  ],
};

export default function PortfolioSlideout({ currentPersona = 'retail-manager' }) {
  const [userProjects, setUserProjects] = useState([]);
  const personaExamples = examplePortfolioProjects[currentPersona] || [];

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userPortfolioProjects');
      if (raw) setUserProjects(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('userPortfolioProjects', JSON.stringify(userProjects));
    } catch (e) {}
  }, [userProjects]);

  const allProjects = [...userProjects, ...personaExamples];

  function handleAddProject() {
    alert(
      'Add Portfolio Project functionality coming soon! This will allow you to manually add projects with title, description, technologies, URL, and achievements.',
    );
  }

  function handleImportFromGitHub() {
    alert('GitHub import coming soon!');
  }
  function handleConnectCodePen() {
    alert('CodePen integration coming soon!');
  }

  function handleDelete(index) {
    if (!window.confirm('Are you sure you want to delete this portfolio project?')) return;
    setUserProjects((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  return (
    <div className="w-full max-h-[calc(100vh-120px)] overflow-y-auto  bg-transparent">
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={handleAddProject}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold"
          style={{
            background: 'var(--color-primary-blue)',
            color: 'white',
            boxShadow: 'none',
            border: 'none',
          }}
        >
          <PiPlusCircle />
          Add Project
        </button>

        <button
          onClick={handleImportFromGitHub}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold"
          style={{
            background: 'var(--color-accent-blue)',
            color: 'white',
            border: 'none',
          }}
        >
          <PiGithubLogo />
          Import from GitHub
        </button>

        <button
          onClick={handleConnectCodePen}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold"
          style={{
            background: 'var(--color-accent-blue)',
            color: 'white',
            border: 'none',
          }}
        >
          <PiCode />
          Connect to CodePen
        </button>
      </div>

      <div
        id="portfolioContainer"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        style={{ minHeight: 120 }}
      >
        {allProjects.length === 0 ? (
          <p className="text-[#666] text-center p-8">
            No portfolio projects yet. Click Add Project or Import from GitHub to showcase your
            work.
          </p>
        ) : (
          allProjects?.map((project, idx) => {
            const isUserProject = idx < userProjects.length;
            return (
              <PortfolioCard
                key={`${project.title}-${idx}`}
                project={project}
                index={isUserProject ? idx : null}
                isUserProject={isUserProject}
                onDelete={(i) => handleDelete(i)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
