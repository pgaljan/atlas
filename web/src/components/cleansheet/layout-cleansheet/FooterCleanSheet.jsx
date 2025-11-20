import React from 'react';

const FooterCleanSheet = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Cleansheet LLC. All rights reserved.</p>
        <p className="mt-2">
          <a
            className="underline"
            href="https://www.cleansheet.info"
            target="_blank"
            rel="noreferrer"
          >
            cleansheet.info
          </a>{' '}
          |{' '}
          <a
            className="underline"
            href="https://github.com/CleansheetLLC/Cleansheet"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>{' '}
          |{' '}
          <a className="underline" href="/privacy-policy.html">
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
};

export default FooterCleanSheet;
