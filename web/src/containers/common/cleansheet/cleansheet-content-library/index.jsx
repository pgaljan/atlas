import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const mockArticles = [
  {
    id: 1,
    title: 'Date Arithmetic in Programming Languages',
    description: 'Duration Calculations and Temporal Operations',
    tags: ['Development', 'Technical Skills', 'Data Analysis'],
    careerPaths: ['Full Stack Developer', 'Analytics'],
    expertise: ['Operator', 'Expert'],
  },
  {
    id: 2,
    title: 'Testing with Dates and Mocking Time',
    description: 'Reproducible Tests for Time-Dependent Logic',
    tags: ['Development', 'Testing', 'Technical Skills'],
    careerPaths: ['Full Stack Developer', 'Project Management'],
    expertise: ['Operator', 'Expert'],
  },
  {
    id: 3,
    title: 'Frontend Date Manipulation in JavaScript',
    description: 'Modern Libraries and Timezone Display Patterns',
    tags: ['Development', 'Frontend', 'Professional Skills'],
    careerPaths: ['Full Stack Developer', 'Citizen Developer'],
    expertise: ['Operator', 'Expert'],
  },
  {
    id: 4,
    title: 'Database Date Storage and Querying',
    description: 'Timestamp Types, Timezone-Aware Storage, and Optimization',
    tags: ['Development', 'Data Analysis', 'Technical Skills'],
    careerPaths: ['Analytics', 'Cloud Computing'],
    expertise: ['Operator', 'Expert'],
  },
  {
    id: 5,
    title: 'Your First AI Chatbot',
    description: 'From Complete Beginner to Deployed Assistant',
    tags: ['Frontend', 'No Code', 'AI/ML'],
    careerPaths: ['AI/ML', 'Citizen Developer'],
    expertise: ['Neophyte', 'Novice'],
  },
  {
    id: 6,
    title: 'Building Dashboards with React and Chart.js',
    description: 'Visualizing Data in Modern Web Apps',
    tags: ['Development', 'Frontend', 'Data Analysis'],
    careerPaths: ['Full Stack Developer', 'Analytics'],
    expertise: ['Operator', 'Expert'],
  },
  {
    id: 7,
    title: 'Machine Learning Pipelines with Python',
    description: 'A Step-by-Step Guide to Training and Deployment',
    tags: ['AI/ML', 'Data Analysis', 'Technical Skills'],
    careerPaths: ['AI/ML', 'Cloud Computing'],
    expertise: ['Novice', 'Operator'],
  },
  {
    id: 8,
    title: 'Introduction to Cloud Infrastructure',
    description: 'Learn About Virtual Machines, Containers, and Networks',
    tags: ['Cloud Computing', 'Architecture', 'Networking'],
    careerPaths: ['Cloud Operations', 'Network Operations'],
    expertise: ['Neophyte', 'Novice'],
  },
  {
    id: 9,
    title: 'Securing APIs in Node.js',
    description: 'Token-Based Authentication and Best Practices',
    tags: ['Security', 'Development', 'Backend'],
    careerPaths: ['Security Operations', 'Full Stack Developer'],
    expertise: ['Operator', 'Expert'],
  },
  {
    id: 10,
    title: 'No Code Automation with Zapier',
    description: 'Integrate Apps and Workflows Without Code',
    tags: ['No Code', 'Professional Skills', 'Automation'],
    careerPaths: ['Citizen Developer', 'Project Management'],
    expertise: ['Neophyte', 'Novice'],
  },
];

const expertiseLevels = ['Neophyte', 'Novice', 'Operator', 'Expert', 'Academic'];

const careerPaths = [
  'AI/ML',
  'Analytics',
  'Citizen Developer',
  'Cloud Computing',
  'Cloud Operations',
  'Full Stack Developer',
  'Network Operations',
  'Project Management',
  'Security Operations',
];

const allTags = [
  'AI/ML',
  'Architecture',
  'Career',
  'Cleansheet',
  'Data Analysis',
  'Design',
  'DevOps',
  'Development',
  'Frontend',
  'Industry',
  'Networking',
  'No Code',
  'Pen Testing',
  'Procurement',
  'Professional Skills',
  'Project Management',
  'Security',
  'System Design',
  'Technical Skills',
  'Testing',
];

const ContentLibrary = () => {
  const [articles] = useState(mockArticles);
  const [expertise, setExpertise] = useState(null);
  const [minExpertise, setMinExpertise] = useState(0);
  const [maxExpertise, setMaxExpertise] = useState(expertiseLevels.length - 1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const modalRef = useRef(null);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((s) => ({ ...s, [key]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 1500);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const togglePath = (path) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  useEffect(() => {
    const blocked = isModalOpen || isSidebarOpen;
    document.body.style.overflow = blocked ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen, isSidebarOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsSidebarOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesExpertise =
      expertise === null || article.expertise.includes(expertiseLevels[expertise]);
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => article.tags.includes(tag));
    const matchesPaths =
      selectedPaths.length === 0 ||
      selectedPaths.some((path) => article.careerPaths.includes(path));

    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      lowerSearch === '' ||
      article.title.toLowerCase().includes(lowerSearch) ||
      article.description.toLowerCase().includes(lowerSearch) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerSearch)) ||
      article.careerPaths.some((path) => path.toLowerCase().includes(lowerSearch));

    return matchesExpertise && matchesTags && matchesPaths && matchesSearch;
  });

  const codeSnippets = {
    python: `from datetime import datetime, timedelta, timezone

# Current timestamp (UTC)
now = datetime(2025, 3, 15, 14, 30, 0, tzinfo=timezone.utc)

# Add days
next_week = now + timedelta(days=7)
print("Next week:", next_week)`,
    js: `// JavaScript Date Manipulation Example
const now = new Date();

// Add 7 days
const nextWeek = new Date(now);
nextWeek.setDate(now.getDate() + 7);
console.log("Next week:", nextWeek);`,
    java: `import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class TimeExample {
  public static void main(String[] args) {
    LocalDateTime now = LocalDateTime.now();
    System.out.println("Now: " + now);
  }
}`,
    csharp: `using System;

class Program {
  static void Main() {
    DateTime now = DateTime.Now;
    Console.WriteLine("Now: " + now);
  }
}`,
    sql: `-- Add 7 days to current date
SELECT NOW() + INTERVAL '7 days' AS next_week;`,
  };

  return (
    <div className="flex min-h-screen font-inter bg-gray-50">
      <header className="w-full md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open filters"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold">Content Library</h1>
            <p className="text-xs text-gray-500">{filteredArticles.length} articles</p>
          </div>
        </div>

        <div>
          <button
            onClick={() => navigate('/cleansheet')}
            className="text-sm px-3 py-1 rounded-md border border-gray-200"
          >
            Back
          </button>
        </div>
      </header>

      <aside
        className="hidden md:flex md:w-72 bg-[#101418] text-white flex-col p-6 overflow-y-auto border-r border-gray-800"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <h2 className="text-lg font-semibold mb-1">Cleansheet Library</h2>
        <p className="text-sm text-gray-400 mb-5">Technical Content Corpus</p>

        <button
          onClick={() => navigate('/cleansheet')}
          className="border border-gray-500 text-sm py-2 px-3 rounded-md w-fit mb-5 hover:bg-[#1a1a1a] transition"
        >
          ← Back to Home
        </button>

        <input
          type="text"
          placeholder="Search titles, tags, career paths..."
          className="w-full px-3 py-2 rounded-md bg-[#1E232A] text-sm text-white mb-6 placeholder-gray-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-3 font-medium">Expertise Level</p>
          <div className="flex justify-between text-[11px] text-gray-400 mb-2">
            {expertiseLevels.map((lvl, i) => (
              <span
                key={lvl}
                onClick={() => setExpertise(i)}
                className={`cursor-pointer transition tracking-wide ${
                  i >= minExpertise && i <= maxExpertise
                    ? 'text-white font-semibold'
                    : 'hover:text-gray-200'
                }`}
              >
                {lvl}
              </span>
            ))}
          </div>

          <div className="relative w-full h-5">
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-700 rounded-full transform -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 h-[3px] rounded-full transform -translate-y-1/2 z-10"
              style={{
                background: '#0066CC',
                left: `${(minExpertise / (expertiseLevels.length - 1)) * 100}%`,
                right: `${100 - (maxExpertise / (expertiseLevels.length - 1)) * 100}%`,
              }}
            />
            <input
              type="range"
              min="0"
              max={expertiseLevels.length - 1}
              value={minExpertise}
              onChange={(e) => setMinExpertise(Math.min(Number(e.target.value), maxExpertise - 1))}
              className="absolute w-full h-5 bg-transparent appearance-none pointer-events-auto z-20 cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max={expertiseLevels.length - 1}
              value={maxExpertise}
              onChange={(e) => setMaxExpertise(Math.max(Number(e.target.value), minExpertise + 1))}
              className="absolute w-full h-5 bg-transparent appearance-none pointer-events-auto z-20 cursor-pointer"
            />
            <style>{`
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: white;
                border: 2px solid #2563eb;
                cursor: pointer;
                position: relative;
                z-index: 30;
              }
            `}</style>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-3 font-medium">Career Paths</p>
          <div className="flex flex-wrap gap-1.5">
            {careerPaths.map((path) => (
              <button
                key={path}
                onClick={() => togglePath(path)}
                className={`px-2.5 py-0.5 text-[10px] rounded-full border whitespace-nowrap transition ${
                  selectedPaths.includes(path)
                    ? 'bg-[#0066CC] border-[#0066CC] text-white'
                    : 'bg-[rgba(255,255,255,0.06)] border-gray-600 text-gray-200 hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                {path}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-300 mb-3 font-medium">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-0.5 text-[10px] rounded-full border whitespace-nowrap transition ${
                  selectedTags.includes(tag)
                    ? 'bg-[#0066CC] border-[#0066CC] text-white'
                    : 'bg-[rgba(255,255,255,0.06)] border-gray-600 text-gray-200 hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#101418] text-white p-5 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button className="p-2" onClick={() => setIsSidebarOpen(false)}>
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 rounded-md bg-[#1E232A] text-sm text-white mb-4 placeholder-gray-400 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="mb-4">
              <p className="text-xs text-gray-300 mb-2">Expertise</p>
              <div className="flex gap-2 flex-wrap">
                {expertiseLevels.map((lvl, i) => (
                  <button
                    key={lvl}
                    onClick={() => setExpertise(i)}
                    className={`px-2 py-1 rounded text-xs ${
                      expertise === i
                        ? 'bg-[#0066CC] text-white'
                        : 'bg-[rgba(255,255,255,0.06)] text-gray-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-300 mb-2">Career Paths</p>
              <div className="flex flex-wrap gap-2">
                {careerPaths.map((path) => (
                  <button
                    key={path}
                    onClick={() => togglePath(path)}
                    className={`px-2 py-1 rounded text-xs ${
                      selectedPaths.includes(path)
                        ? 'bg-[#0066CC] text-white'
                        : 'bg-[rgba(255,255,255,0.06)] text-gray-200'
                    }`}
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Content Library</h1>
            <p className="text-gray-500 text-sm">{filteredArticles.length} articles found</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl tracking-wide uppercase text-gray-800">CLEANSHEET</h2>
            <div className="w-36 h-[1px] bg-black ml-auto" />
            <p className="text-[9px] text-black">expert-guided, outcome-focused learning</p>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 && (
              <p className="col-span-full text-center text-gray-500">
                No articles match your filters.
              </p>
            )}

            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => {
                  setSelectedArticle(article);
                  setIsModalOpen(true);
                }}
                className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition duration-200 cursor-pointer p-4 flex flex-col justify-between"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedArticle(article);
                    setIsModalOpen(true);
                  }
                }}
              >
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0A0A0A] mb-1 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2 leading-snug">{article.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.expertise.length > 0 && (
                      <span className="bg-[#0066CC] text-white text-[10px] px-2 py-0.5 rounded-sm uppercase font-semibold tracking-wide">
                        {article.expertise.join(', ')}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 leading-snug">
                    Programming languages handle date arithmetic differently — language-specific
                    patterns for duration calculations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30" />

          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="relative ml-auto bg-white h-full shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out w-full md:w-2/3 lg:w-[65%]"
          >
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">{selectedArticle?.title}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {selectedArticle?.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedArticle?.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Career Paths</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle?.careerPaths.map((path) => (
                      <span
                        key={path}
                        className="bg-[#0066CC] text-white text-xs px-2 py-1 rounded-md"
                      >
                        {path}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle?.expertise.map((lvl) => (
                      <span
                        key={lvl}
                        className="bg-[#0066CC] text-white text-xs px-2 py-1 rounded-md"
                      >
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center bg-gray-900 text-white px-4 py-2 rounded-t-lg">
                      <span className="text-sm font-semibold">Python</span>
                      <button
                        onClick={() =>
                          copyToClipboard(codeSnippets.python, `${selectedArticle?.id}-python`)
                        }
                        className="text-xs px-3 py-1 rounded bg-[#0066CC] hover:bg-[#005bb5]"
                      >
                        {copied[`${selectedArticle?.id}-python`] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-white text-sm rounded-b-xl p-4 overflow-x-auto shadow-lg">
                      {codeSnippets.python}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                      <span className="text-sm font-semibold">JavaScript</span>
                      <button
                        onClick={() =>
                          copyToClipboard(codeSnippets.js, `${selectedArticle?.id}-js`)
                        }
                        className="text-xs px-3 py-1 rounded bg-[#0066CC] hover:bg-[#005bb5]"
                      >
                        {copied[`${selectedArticle?.id}-js`] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-white text-sm rounded-b-xl p-4 overflow-x-auto shadow-lg">
                      {codeSnippets.js}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                      <span className="text-sm font-semibold">Java</span>
                      <button
                        onClick={() =>
                          copyToClipboard(codeSnippets.java, `${selectedArticle?.id}-java`)
                        }
                        className="text-xs px-3 py-1 rounded bg-[#0066CC] hover:bg-[#005bb5]"
                      >
                        {copied[`${selectedArticle?.id}-java`] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-white text-sm rounded-b-xl p-4 overflow-x-auto shadow-lg">
                      {codeSnippets.java}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                      <span className="text-sm font-semibold">C#</span>
                      <button
                        onClick={() =>
                          copyToClipboard(codeSnippets.csharp, `${selectedArticle?.id}-csharp`)
                        }
                        className="text-xs px-3 py-1 rounded bg-[#0066CC] hover:bg-[#005bb5]"
                      >
                        {copied[`${selectedArticle?.id}-csharp`] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-white text-sm rounded-b-xl p-4 overflow-x-auto shadow-lg">
                      {codeSnippets.csharp}
                    </pre>
                  </div>

                  {/** SQL */}
                  <div>
                    <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                      <span className="text-sm font-semibold">SQL</span>
                      <button
                        onClick={() =>
                          copyToClipboard(codeSnippets.sql, `${selectedArticle?.id}-sql`)
                        }
                        className="text-xs px-3 py-1 rounded bg-[#0066CC] hover:bg-[#005bb5]"
                      >
                        {copied[`${selectedArticle?.id}-sql`] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-white text-sm rounded-b-xl p-4 overflow-x-auto shadow-lg">
                      {codeSnippets.sql}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#0066CC] mb-2">Concept Explanation</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Date arithmetic refers to performing calculations on time and date values,
                      such as adding or subtracting days, hours, or minutes. This is essential for
                      scheduling systems, analytics, and automated reports.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#0066CC] mb-2">Common Use Cases</h4>
                    <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                      <li>Generating weekly or monthly reports</li>
                      <li>Scheduling emails or tasks</li>
                      <li>Tracking user session durations</li>
                      <li>Setting deadlines and reminders</li>
                      <li>Time-based database queries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
