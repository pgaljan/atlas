import React from 'react';

const HeaderCleanSheet = ({
  logoSrc = '/assets/high-resolution-logo-files/white-on-transparent.png',
}) => {
  return (
    <header className="bg-gray-900 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-semibold">Cleansheet Platform</h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1">
            Technical Learning &amp; Career Development
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl tracking-wide uppercase font-semibold">CLEANSHEET</h2>
          <div className="w-20 sm:w-32 h-[1px] bg-gray-300 mx-auto my-2" />
          <p className="text-xs sm:text-sm text-gray-400">
            expert-guided, outcome-focused learning
          </p>
        </div>
      </div>
    </header>
  );
};

export default HeaderCleanSheet;
