import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderCleanSheet from './HeaderCleanSheet';
import FooterCleanSheet from './FooterCleanSheet';

const CleanSheetLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-background">
      <HeaderCleanSheet />
      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-12">
        <Outlet />
      </main>

      <FooterCleanSheet />
    </div>
  );
};

export default CleanSheetLayout;
