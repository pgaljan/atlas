import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBookOpen,
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineBriefcase,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

const CleanSheetPlatform = () => {
  const tools = [
    {
      title: 'Content Library',
      description:
        'Browse our extensive collection of technical articles, tutorials, and learning resources curated for all expertise levels.',
      button: 'Explore Library',
      icon: <HiOutlineBookOpen className="w-6 h-6" />,
      link: '/cleansheet/content-library',
    },
    {
      title: 'Career Paths',
      description:
        'Navigate curated career progression paths from Citizen Developer to Cloud Operations, AI/ML Engineer, and more.',
      button: 'View Paths',
      icon: <HiOutlineViewGrid className="w-6 h-6" />,
    },
    {
      title: 'Role Translator',
      description:
        'Discover your ideal tech role by mapping your skills and experience to career opportunities in the industry.',
      button: 'Find Your Role',
      icon: <HiOutlineBriefcase className="w-6 h-6" />,
    },
    {
      title: 'Experience Tagger',
      description:
        'Tag and organize your professional experiences with skills, technologies, and achievements for career planning.',
      button: 'Tag Experiences',
      link: '/cleansheet/experience-trigger',
      icon: <HiOutlineTag className="w-6 h-6" />,
    },
    {
      title: 'Cleansheet Canvas',
      description:
        'All-in-one career experience management tool tracking opportunities, experiences, and matching roles to your skillsets.',
      button: 'Explore Canvas',
      badge: 'COMING SOON',
      link: '/cleansheet/canvas',
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
    },
    {
      title: 'Coaching & Mentorship',
      description:
        'Connect with experienced coaches for 12-week Cleansheet Quarters focused on real-world project delivery.',
      button: 'Find a Coach',
      badge: 'COMING SOON',
      icon: <HiOutlineUserGroup className="w-6 h-6" />,
    },
  ];

  const about = [
    {
      title: 'ML Pipeline Tour',
      description:
        'Explore our automated content processing pipeline that transforms curated content into multi-format deliverables.',
      button: 'Explore Pipeline',
      icon: <HiOutlineShieldCheck className="w-6 h-6" />,
    },
    {
      title: 'Privacy & Terms',
      description:
        'Learn about our commitment to data privacy and review our platform terms of service and principles.',
      button: 'View Policies',
      icon: <HiOutlineLockClosed className="w-6 h-6" />,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section: Learning & Career Tools */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            Learning & Career Tools
          </h2>
          <div className="h-1 w-24 bg-[#0066CC] rounded-full mb-8 mx-auto sm:mx-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="bg-[#0066CC] text-white w-12 h-12 flex items-center justify-center rounded-md mb-5">
                    {tool.icon}
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-2">
                    {tool.title}
                  </h3>

                  {tool.badge && (
                    <span className="inline-block bg-blue-100 text-[#0066CC] text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                      {tool.badge}
                    </span>
                  )}

                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{tool.description}</p>
                </div>

                {tool.link ? (
                  <Link
                    to={tool.link}
                    className="inline-flex items-center justify-center bg-[#0066CC] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#005bb5] transition-colors duration-200 w-full"
                  >
                    {tool.button}
                  </Link>
                ) : (
                  <button className="inline-flex items-center justify-center bg-[#0066CC] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#005bb5] transition-colors duration-200 w-full">
                    {tool.button}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: About */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            About the Platform
          </h2>
          <div className="h-1 w-24 bg-black rounded-full mb-8 mx-auto sm:mx-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {about.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-md mb-5">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{item.description}</p>
                </div>

                <button className="inline-flex items-center justify-center bg-black text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-800 transition-colors duration-200 w-full">
                  {item.button}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CleanSheetPlatform;
