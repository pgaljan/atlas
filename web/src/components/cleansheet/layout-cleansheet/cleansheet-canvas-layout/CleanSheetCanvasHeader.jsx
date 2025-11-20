import React, { useEffect, useRef, useState } from 'react';
import {
  PiTreeStructure,
  PiPathBold,
  PiBuildings,
  PiBooks,
  PiInfo,
  PiLightbulb,
  PiLock,
  PiFileText,
  PiArrowSquareOut,
  PiUserCircle,
  PiChatText,
  PiDatabase,
  PiDownloadSimple,
  PiLifebuoy,
  PiTrash,
  PiList,
} from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

export default function CleansheetCanvasHeader({ logoSrc = '/assets/white-on-transparent.png' }) {
  const [activeTab, setActiveTab] = useState('canvas');
  const [profileOpen, setProfileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const aboutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const navItems = [
    { key: 'canvas', label: 'Canvas', icon: PiTreeStructure },
    { key: 'paths', label: 'Paths', icon: PiPathBold },
    { key: 'roles', label: 'Industry', icon: PiBuildings },
    { key: 'library', label: 'Library', icon: PiBooks },
  ];

  const aboutItems = [
    {
      key: 'about-canvas',
      label: 'About Cleansheet Canvas',
      icon: PiInfo,
      onClick: () => alert('Open About Canvas'),
    },
    {
      key: 'about-cleansheet',
      label: 'About Cleansheet',
      icon: PiBuildings,
      href: 'about-cleansheet.html',
      external: true,
    },
    {
      key: 'whitepapers',
      label: 'White Papers',
      icon: PiLightbulb,
      href: 'whitepapers/index.html',
      external: true,
    },
    {
      key: 'privacy',
      label: 'Privacy Policy',
      icon: PiLock,
      href: 'privacy-policy.html',
      external: true,
    },
    {
      key: 'tos',
      label: 'Terms of Service',
      icon: PiFileText,
      href: 'terms-of-service.html',
      external: true,
    },
  ];

  const profileItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: PiUserCircle,
      onClick: () => alert('Profile clicked'),
    },
    { key: 'prompt', label: 'Prompt', icon: PiChatText, onClick: () => alert('Prompt clicked') },
    {
      key: 'data',
      label: 'Data Management',
      icon: PiDatabase,
      onClick: () => alert('Data Management clicked'),
    },
    {
      key: 'install',
      label: 'Install App',
      icon: PiDownloadSimple,
      onClick: () => alert('Install App clicked'),
    },
    { key: 'support', label: 'Support', icon: PiLifebuoy, onClick: () => alert('Support clicked') },
    {
      key: 'erasure',
      label: 'Erasure Request',
      icon: PiTrash,
      onClick: () => alert('Erasure Request clicked'),
    },
  ];

  const baseNavClass =
    'flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-all duration-150';
  const inactiveNavClass = 'text-white/70 hover:bg-white/10 hover:text-white';
  const activeNavClass = 'bg-[rgba(0,102,204,0.3)] text-white';

  const mobileItemClass =
    'flex items-center gap-3 px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition';

  return (
    <header
      style={{ background: 'var(--color-dark)' }}
      className="text-white border-b border-white/10 relative w-full z-50"
    >
      <div className="mx-auto px-8 py-4 flex items-center w-full">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 shrink-0 focus:outline-none"
              aria-label="Go back"
            >
              <img src={logoSrc} alt="Cleansheet Logo" className="h-8 w-auto" />
            </button>

            <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`${baseNavClass} ${activeTab === key ? activeNavClass : inactiveNavClass}`}
                  aria-current={activeTab === key ? 'page' : undefined}
                >
                  <Icon className="text-lg flex-shrink-0 text-current" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}

              <div className="relative" ref={aboutRef}>
                <button
                  type="button"
                  onClick={() => setAboutOpen((p) => !p)}
                  className={`${baseNavClass} ${inactiveNavClass}`}
                  aria-expanded={aboutOpen}
                >
                  <PiInfo className="text-lg flex-shrink-0 text-current" />
                  <span className="whitespace-nowrap">About</span>
                </button>

                <div
                  className={`absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 transform transition-all duration-150
                ${aboutOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                  role="menu"
                >
                  <div className="py-2">
                    {aboutItems.map(({ key, label, icon: Icon, href, onClick, external }) =>
                      href ? (
                        <a
                          key={key}
                          href={href}
                          target={external ? '_blank' : '_self'}
                          rel={external ? 'noopener noreferrer' : undefined}
                          onClick={() => setAboutOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                          role="menuitem"
                        >
                          <Icon className="text-lg text-[--color-primary-blue] flex-shrink-0" />
                          <span className="text-sm">{label}</span>
                          {external && (
                            <PiArrowSquareOut className="ml-auto text-gray-400 text-base" />
                          )}
                        </a>
                      ) : (
                        <button
                          key={key}
                          onClick={() => {
                            onClick?.();
                            setAboutOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                          role="menuitem"
                        >
                          <Icon className="text-lg text-[--color-primary-blue] flex-shrink-0" />
                          <span className="text-sm">{label}</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <div className="hidden md:block flex-1" />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <PiList className="text-2xl" />
            )}
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="w-11 h-11 rounded-full bg-[rgba(0,102,204,0.3)] flex items-center justify-center text-white text-sm hover:opacity-95 transition"
            >
              <span className="select-none">AM</span>
            </button>

            <div
              className={`absolute right-0 top-14 bg-white rounded-lg shadow-lg min-w-[220px] z-50 transform transition-all duration-150
            ${profileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
            >
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="font-semibold text-sm text-[#1A1A1A] mb-1">Alex Martinez</div>
                <div className="text-xs text-gray-500 capitalize">Retail Manager</div>
              </div>

              <div className="py-2">
                {profileItems.map(({ key, label, icon: Icon, onClick }) => (
                  <button
                    key={key}
                    onClick={() => {
                      onClick?.();
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  >
                    <Icon className="text-lg text-[--color-primary-blue] flex-shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--color-dark)] z-40 shadow-lg rounded-b-lg">
          <div className="flex flex-col py-2">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setMobileMenuOpen(false);
                }}
                className={`${mobileItemClass} ${activeTab === key ? 'bg-[rgba(0,102,204,0.3)] text-white' : ''}`}
              >
                <Icon className="text-lg text-current" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}

            {aboutItems.map(({ key, label, icon: Icon, href, external, onClick }) =>
              href ? (
                <a
                  key={key}
                  href={href}
                  target={external ? '_blank' : '_self'}
                  rel={external ? 'noopener noreferrer' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileItemClass}
                >
                  <Icon className="text-lg text-[--color-primary-blue] flex-shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                  {external && <PiArrowSquareOut className="ml-auto text-gray-400" />}
                </a>
              ) : (
                <button
                  key={key}
                  onClick={() => {
                    onClick?.();
                    setMobileMenuOpen(false);
                  }}
                  className={mobileItemClass}
                >
                  <Icon className="text-lg text-[--color-primary-blue] flex-shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </header>
  );
}
