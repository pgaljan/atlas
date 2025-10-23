import React from 'react';

const FooterCleanSheet = () => {
  return (
    <footer className="bg-gray-900 text-white text-xs sm:text-sm py-4 mt-12 text-center px-4">
      &copy; {new Date().getFullYear()} Cleansheet LLC. All rights reserved.
    </footer>
  );
};

export default FooterCleanSheet;
