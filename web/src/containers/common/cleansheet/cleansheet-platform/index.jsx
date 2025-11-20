import React, { useMemo, useState } from 'react';
import {
  HiOutlineBookOpen,
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineDocumentText,
  HiOutlineArrowSmRight,
} from 'react-icons/hi';

const Badge = ({ text, kind = 'green' }) => {
  const base = 'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ml-3';
  const style =
    kind === 'green'
      ? 'bg-emerald-500 text-white'
      : kind === 'blue'
        ? 'bg-[#0066CC] text-white'
        : 'bg-gray-200 text-gray-800';
  return <span className={`${base} ${style}`}>{text}</span>;
};

const IconBox = ({ children, bg = '#0066CC' }) => {
  return (
    <div
      className="flex items-center justify-center mb-5"
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '12px',
        background: bg,
        color: 'white',
      }}
      aria-hidden
    >
      <div className="text-xl">{children}</div>
    </div>
  );
};

const ToolCard = ({ tool, onNavigate }) => {
  const isComing = tool.badge === 'COMING SOON';
  return (
    <article className="bg-white border rounded-lg p-8 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 flex flex-col h-full">
      <div>
        <IconBox bg={tool.iconBg || '#0066CC'}>{tool.icon}</IconBox>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
          {tool.title}
          {tool.badge === 'FREE' && <Badge text="Free" kind="green" />}
          {tool.badge === 'COMING SOON' && <Badge text="Coming Soon" kind="blue" />}
        </h3>

        <p className="text-sm text-gray-600 mt-4 mb-6 leading-relaxed">{tool.description}</p>
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => !isComing && tool.link && onNavigate(tool.link)}
          disabled={isComing}
          className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0066CC] ${
            isComing
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed border border-gray-200'
              : 'bg-[#0066CC] text-white hover:bg-[#0055a3]'
          }`}
          aria-disabled={isComing}
        >
          {tool.button}
        </button>
      </div>
    </article>
  );
};

const AboutCard = ({ item, onNavigate }) => {
  return (
    <article className="bg-white border rounded-lg p-8 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 flex flex-col h-full">
      <div className="mb-5">
        <div
          className="flex items-center justify-center"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: '#1a1a1a',
            color: 'white',
          }}
        >
          <div className="text-xl">{item.icon}</div>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-lg font-semibold text-[#1a1a1a] mb-3">{item.title}</h4>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{item.description}</p>
      </div>

      <a
        href={item.link || '#'}
        onClick={(e) => {
          if (!item.link) e.preventDefault();
          else onNavigate && onNavigate(item.link);
        }}
        className="inline-block w-full text-center px-4 py-2 rounded-md font-semibold text-sm bg-[#1a1a1a] text-white hover:bg-gray-800 transition-colors"
      >
        {item.button}
      </a>
    </article>
  );
};

const CleanSheetPlatform = ({ logoSrc }) => {
  const [query, setQuery] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);

  const tools = useMemo(
    () => [
      {
        title: 'Career Canvas',
        description:
          'Interactive career management workspace with guided paths, role discovery tools, and curated learning resources.',
        button: 'Open Canvas',
        icon: <HiOutlineViewGrid className="w-5 h-5" />,
        link: '/cleansheet/career-canvas',
        badge: 'FREE',
        group: 'career',
      },
      {
        title: 'Content Library',
        description:
          'Browse our extensive collection of technical articles, tutorials, and learning resources curated for all expertise levels.',
        button: 'Explore Library',
        icon: <HiOutlineBookOpen className="w-5 h-5" />,
        link: '/cleansheet/content-library',
        group: 'career',
      },
      {
        title: 'Role Translator',
        description:
          'Discover your ideal tech role by mapping your skills and experience to career opportunities in the industry.',
        button: 'Find Your Role',
        icon: <HiOutlineBriefcase className="w-5 h-5" />,
        group: 'career',
      },
      {
        title: 'Experience Tagger',
        description:
          'Tag and organize your professional experiences with skills, technologies, and achievements for career planning.',
        button: 'Tag Experiences',
        link: '/cleansheet/experience-trigger',
        icon: <HiOutlineTag className="w-5 h-5" />,
        group: 'career',
      },

      {
        title: 'Planner',
        description:
          'Plan and manage projects with RACI matrices, task scheduling, and comprehensive dependency management.',
        button: 'Open Planner',
        icon: <HiOutlineViewGrid className="w-5 h-5" />,
        link: '/project-planner',
        badge: 'FREE',
        // iconBg: '#0ea5a4',
        group: 'professional',
      },
      {
        title: 'Professional',
        description:
          'Manage your professional workspace with documents, forms, reports, collaborative project tools, and ML pipelines.',
        button: 'Professional Preview',
        link: '/canvas-tour-pro',
        icon: <HiOutlineClipboardList className="w-5 h-5" />,
        badge: 'COMING SOON',
        group: 'professional',
      },
      {
        title: 'Coaching & Mentorship',
        description:
          'Connect with experienced coaches for 12-week Cleansheet Quarters focused on real-world project delivery.',
        button: 'Find a Coach',
        badge: 'COMING SOON',
        icon: <HiOutlineUserGroup className="w-5 h-5" />,
        group: 'professional',
      },
    ],
    [],
  );

  const about = useMemo(
    () => [
      {
        title: 'About Cleansheet',
        description:
          'Learn about our mission, vision, and the technology behind the Cleansheet career development platform.',
        button: 'Learn More',
        icon: <HiOutlineInformationCircle className="w-5 h-5" />,
        link: '/about-cleansheet',
      },
      {
        title: 'ML Pipeline Tour',
        description:
          'Explore our automated content processing pipeline that transforms curated content into multi-format deliverables.',
        button: 'Explore Pipeline',
        icon: <HiOutlineArrowSmRight className="w-5 h-5" />,
        link: '/cleansheet/ml-pipeline',
      },
      {
        title: 'Privacy & Terms',
        description:
          'Learn about our commitment to data privacy and review our platform terms of service and principles.',
        button: 'View Policies',
        icon: <HiOutlineShieldCheck className="w-5 h-5" />,
        link: '/privacy',
      },
      {
        title: 'Technical Innovation Library',
        description:
          'Explore comprehensive technical white papers documenting our career development platform innovations and defensive IP strategy.',
        button: 'Browse Library',
        icon: <HiOutlineDocumentText className="w-5 h-5" />,
        link: '/whitepapers',
      },
    ],
    [],
  );

  const visibleTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (onlyFree && t.badge !== 'FREE') return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    });
  }, [tools, query, onlyFree]);

  const handleNavigate = (href) => {
    if (!href) return;
    if (typeof window !== 'undefined') window.location.href = href;
  };

  const fillToMultipleOf = (items, multiple = 3) => {
    const filled = [...items];
    while (filled.length % multiple !== 0) {
      filled.push(null);
    }
    return filled;
  };

  const renderToolGrid = (items) => {
    const filled = fillToMultipleOf(items, 3);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filled.map((item, idx) =>
          item ? (
            <div key={item.title + idx} className="h-full">
              <ToolCard tool={item} onNavigate={handleNavigate} />
            </div>
          ) : (
            <div key={`placeholder-${idx}`} className="invisible" aria-hidden="true">
              <div className="h-full bg-transparent p-8 rounded-lg border" />
            </div>
          ),
        )}
      </div>
    );
  };

  const renderAboutGrid = (items) => {
    const filled = fillToMultipleOf(items, 4);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filled.map((item, idx) =>
          item ? (
            <div key={item.title + idx} className="h-full">
              <AboutCard item={item} onNavigate={handleNavigate} />
            </div>
          ) : (
            <div key={`placeholder-about-${idx}`} className="invisible" aria-hidden="true">
              <div className="h-full bg-transparent p-8 rounded-lg border" />
            </div>
          ),
        )}
      </div>
    );
  };

  const careerTools = visibleTools.filter(
    (t) => t.group === 'career' && ['Career Canvas'].includes(t.title),
  );

  const professionalTools = visibleTools.filter(
    (t) => t.group === 'professional' && ['Planner', 'Professional'].includes(t.title),
  );

  return (
    <div className="min-h-screen bg-[var(--color-neutral-background)]">
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] mb-3">Career Tools</h2>
          <div className="border-b border-gray-200 mb-6" />

          <p className="text-sm text-gray-500 text-center max-w-[900px] mx-auto mb-8 leading-relaxed">
            Serving Cleansheet's mission to improve universal access to career mobility and
            security.
          </p>

          {renderToolGrid(careerTools)}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] mb-3">
            Professional Tools
          </h2>
          <div className="border-b border-gray-200 mb-6" />

          <p className="text-sm text-gray-500 text-center max-w-[900px] mx-auto mb-6 leading-relaxed">
            Productivity tools designed for professionals to plan projects, manage teams,
            collaborate on deliverables, and streamline workflows with enterprise-grade
            capabilities.
          </p>

          {renderToolGrid(professionalTools)}
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] mb-3">
            About the Platform
          </h2>
          <div className="border-b border-gray-200 mb-6" />

          {renderAboutGrid(about)}
        </section>
      </main>
    </div>
  );
};

export default CleanSheetPlatform;
