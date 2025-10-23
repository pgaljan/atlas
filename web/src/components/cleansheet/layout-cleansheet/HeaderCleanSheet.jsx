import React from 'react';

const HeaderCleanSheet = () => {
  return (
    <header className="bg-gray-900 text-white px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left space-y-6 sm:space-y-0">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold">CleanSheet Platform</h1>
        <p className="text-sm sm:text-base text-gray-300">
          Technical Learning & Career Development
        </p>
      </div>
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl tracking-wide uppercase">CLEANSHEET</h2>
        <div className="w-20 sm:w-32 h-[1px] bg-gray-300 mx-auto my-2" />
        <p className="text-xs sm:text-sm text-gray-400">expert-guided, outcome-focused learning</p>
      </div>
    </header>
  );
};

export default HeaderCleanSheet;
